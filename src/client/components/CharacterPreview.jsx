import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMUtils, VRMLoaderPlugin } from '@pixiv/three-vrm';
import { getAssetUrl, fileExists } from '../utils/apiUtils';

/**
 * CharacterPreview class for handling VRM model loading and display
 */
export class CharacterPreview {
  constructor(world, container) {
    console.log('[Character Preview] Initializing');
    this.world = world;
    this.container = container;
    this.currentVrm = null;
    this.currentParts = {};
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 20);
    this.camera.position.set(0, 1, 5);
    this.clock = new THREE.Clock();
    
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    // Add orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    
    // Setup loaders
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.register((parser) => new VRMLoaderPlugin(parser));
    
    // Track loaded accessories and attachments
    this.loadedAttachments = {
      hair: null,
      clothing_top: null,
      clothing_bottom: null,
      clothing_shoes: null,
      accessories: []
    };
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Start animation loop
    this.animate();
    
    console.log('[Character Preview] Initialization complete');
  }
  
  onWindowResize() {
    if (!this.container) return;
    
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  animate() {
    if (!this.renderer) return; // Check if destroyed
    
    requestAnimationFrame(this.animate.bind(this));
    
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    
    // Update VRM if available
    if (this.currentVrm && typeof this.currentVrm.update === 'function') {
      try {
        this.currentVrm.update(this.clock.getDelta());
      } catch (error) {
        // Silently catch any update errors to prevent console spam
      }
    }
  }
  
  async loadBaseModel(modelPath) {
    console.log(`[Character Preview] Loading model from: ${modelPath}`);
    
    try {
      // Verify the model path
      if (!modelPath) {
        throw new Error('Model path is undefined or empty');
      }
      
      // Convert to absolute URL
      const absoluteModelPath = getAssetUrl(modelPath);
      console.log(`[Character Preview] Absolute model path: ${absoluteModelPath}`);
      
      // Clear previous VRM
      if (this.currentVrm) {
        console.log('[Character Preview] Removing previous model');
        if (this.currentVrm.scene) {
          VRMUtils.deepDispose(this.currentVrm.scene);
          this.scene.remove(this.currentVrm.scene);
        } else if (this.currentVrm instanceof THREE.Group) {
          this.scene.remove(this.currentVrm);
        }
        this.currentVrm = null;
      }
      
      // Clear all loaded attachments
      this.clearAttachments();
      
      // Check if the file exists by making a HEAD request
      try {
        const exists = await fileExists(modelPath);
        if (!exists) {
          console.error(`[Character Preview] File not found: ${modelPath}`);
          throw new Error(`File not found: ${modelPath}`);
        }
      } catch (fetchError) {
        console.error(`[Character Preview] Error checking file: ${fetchError.message}`);
        // Continue anyway, as the file might still be accessible by the loader
      }
      
      // Load new VRM
      console.log(`[Character Preview] Starting to load model from: ${absoluteModelPath}`);
      const gltf = await new Promise((resolve, reject) => {
        this.gltfLoader.load(
          absoluteModelPath,
          resolve,
          (xhr) => {
            const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
            if (percent % 20 === 0) { // Only log at 0%, 20%, 40%, 60%, 80%, 100%
              console.log(`[Character Preview] Model loading: ${percent}%`);
            }
          },
          (error) => {
            console.error('[Character Preview] Error loading model:', error);
            reject(error);
          }
        );
      });
      
      console.log('[Character Preview] GLTF loaded, userData:', gltf.userData);
      
      // Get VRM instance from GLTF
      const vrm = gltf.userData.vrm;
      
      if (!vrm) {
        console.error('[Character Preview] VRM data not found in loaded model. This might not be a VRM file.');
        
        // Fallback: If it's not a VRM file, just add the scene directly
        console.log('[Character Preview] Attempting to add model as regular GLTF');
        this.scene.add(gltf.scene);
        
        // Store a reference to the model with a dummy update method
        this.currentVrm = {
          scene: gltf.scene,
          update: (delta) => {} // Dummy update method
        };
        
        // Center the model
        this.centerModel(gltf.scene);
        
        console.log('[Character Preview] Added as regular GLTF model');
        return this.currentVrm;
      }
      
      // Add VRM to scene
      this.currentVrm = vrm;
      
      // Ensure the VRM has an update method
      if (typeof this.currentVrm.update !== 'function') {
        console.log('[Character Preview] Adding dummy update method to VRM');
        this.currentVrm.update = (delta) => {};
      }
      
      this.scene.add(vrm.scene);
      
      // Center model
      VRMUtils.rotateVRM0(vrm);
      this.centerModel(vrm.scene);
      
      console.log('[Character Preview] VRM model loaded successfully');
      return vrm;
    } catch (error) {
      console.error('[Character Preview] Failed to load model:', error);
      console.error('[Character Preview] Error details:', error.message);
      if (error.stack) {
        console.error('[Character Preview] Stack trace:', error.stack);
      }
      
      // Create a simple error indicator in the scene
      this.createErrorIndicator();
      return null;
    }
  }
  
  // Create a simple indicator when model loading fails
  createErrorIndicator() {
    console.log('[Character Preview] Creating error indicator');
    
    // Create a simple red cube to indicate error
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 1, 0);
    
    // Add to scene
    this.scene.add(cube);
    
    // Store reference
    this.currentVrm = {
      scene: cube,
      update: (delta) => {} // Dummy update method
    };
    
    console.log('[Character Preview] Error indicator created');
  }
  
  centerModel(model) {
    // Create a bounding box for the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Adjust model position to center it
    model.position.x = -center.x;
    model.position.z = -center.z;
    
    // Adjust camera position based on model size
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // Set camera position
    this.camera.position.z = cameraZ * 1.5;
    this.controls.target.set(0, size.y / 2, 0);
    this.controls.update();
  }
  
  // Clear all attachments from the model
  clearAttachments() {
    console.log('[Character Preview] Clearing all attachments');
    
    // Remove all attachment objects from the scene
    for (const category in this.loadedAttachments) {
      if (category === 'accessories') {
        // Handle accessories array
        for (const accessory of this.loadedAttachments.accessories) {
          if (accessory && accessory.object && accessory.object.parent) {
            accessory.object.parent.remove(accessory.object);
          }
        }
        this.loadedAttachments.accessories = [];
      } else {
        // Handle single attachments
        if (this.loadedAttachments[category] && this.loadedAttachments[category].object && this.loadedAttachments[category].object.parent) {
          this.loadedAttachments[category].object.parent.remove(this.loadedAttachments[category].object);
        }
        this.loadedAttachments[category] = null;
      }
    }
  }
  
  // Find a bone in the VRM model by name pattern
  findBone(namePattern) {
    if (!this.currentVrm || !this.currentVrm.scene) return null;
    
    let foundBone = null;
    
    this.currentVrm.scene.traverse((object) => {
      if (object.isBone && !foundBone) {
        const name = object.name.toLowerCase();
        if (name.includes(namePattern.toLowerCase())) {
          foundBone = object;
        }
      }
    });
    
    return foundBone;
  }
  
  // Load an attachment (hair, clothing, etc.) and attach it to the model
  async loadAttachment(assetPath, category, attachPoint) {
    if (!this.currentVrm || !this.currentVrm.scene) {
      console.warn(`[Character Preview] Cannot load attachment: No VRM model loaded`);
      return null;
    }
    
    if (!assetPath) {
      console.warn(`[Character Preview] Cannot load attachment: No asset path provided`);
      return null;
    }
    
    try {
      console.log(`[Character Preview] Loading attachment: ${category} from ${assetPath}`);
      
      // Convert to absolute URL
      const absolutePath = getAssetUrl(assetPath);
      
      // Check if the file exists
      try {
        const exists = await fileExists(assetPath);
        if (!exists) {
          console.error(`[Character Preview] Attachment file not found: ${assetPath}`);
          return null;
        }
      } catch (error) {
        console.error(`[Character Preview] Error checking attachment file: ${error.message}`);
        // Continue anyway
      }
      
      // Load the VRM model for the attachment
      return new Promise((resolve, reject) => {
        this.gltfLoader.load(
          absolutePath,
          (gltf) => {
            console.log(`[Character Preview] Loaded attachment GLTF:`, gltf);
            
            // Get the VRM instance or use the GLTF scene
            let attachmentObject;
            let vrmInstance = null;
            
            if (gltf.userData.vrm) {
              // If it's a VRM, use its scene and store the VRM instance
              vrmInstance = gltf.userData.vrm;
              attachmentObject = vrmInstance.scene;
            } else {
              // Otherwise use the GLTF scene directly
              attachmentObject = gltf.scene;
            }
            
            if (!attachmentObject) {
              console.error(`[Character Preview] Failed to extract scene from loaded attachment`);
              resolve(null);
              return;
            }
            
            // Instead of attaching to bones, we'll add the attachment directly to the scene
            // and position it relative to the main VRM model
            
            // First, get the main VRM's position
            const mainVrmPosition = new THREE.Vector3();
            if (this.currentVrm.scene) {
              this.currentVrm.scene.getWorldPosition(mainVrmPosition);
            }
            
            // Add the attachment to the scene
            this.scene.add(attachmentObject);
            
            // Position the attachment at the same position as the main VRM
            attachmentObject.position.copy(mainVrmPosition);
            
            // Store the attachment with its VRM instance if available
            const attachmentData = {
              object: attachmentObject,
              vrm: vrmInstance,
              category: category
            };
            
            if (category === 'accessories') {
              this.loadedAttachments.accessories.push(attachmentData);
            } else {
              this.loadedAttachments[category] = attachmentData;
            }
            
            console.log(`[Character Preview] Added ${category} to scene`);
            resolve(attachmentData);
          },
          (xhr) => {
            const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
            if (percent % 20 === 0) { // Only log at 0%, 20%, 40%, 60%, 80%, 100%
              console.log(`[Character Preview] Attachment loading: ${percent}%`);
            }
          },
          (error) => {
            console.error(`[Character Preview] Error loading attachment: ${error.message}`);
            resolve(null);
          }
        );
      });
    } catch (error) {
      console.error(`[Character Preview] Error loading attachment: ${error.message}`);
      return null;
    }
  }
  
  async updateCharacter(character) {
    try {
      console.log('[Character Preview] updateCharacter called with:', JSON.stringify(character, null, 2));
      console.log('[Character Preview] Current parts:', JSON.stringify(this.currentParts, null, 2));
      console.log('[Character Preview] World asset lookup available:', !!this.world?.assetLookup);
      
      if (this.world?.assetLookup) {
        console.log('[Character Preview] Available asset categories:', Object.keys(this.world.assetLookup));
      }
      
      // Only log changes that will actually be applied
      const changes = [];
      
      // Load base model if needed or changed
      if (!this.currentVrm || this.currentParts.base_model !== character.base_model) {
        console.log('[Character Preview] Base model needs update:', character.base_model);
        const baseModelAsset = this.world.assetLookup?.base_model?.find(
          asset => asset.id === character.base_model
        );
        
        console.log('[Character Preview] Found base model asset:', baseModelAsset);
        
        if (baseModelAsset) {
          console.log(`[Character Preview] Loading base model: ${baseModelAsset.name} from ${baseModelAsset.file_path}`);
          await this.loadBaseModel(baseModelAsset.file_path);
          this.currentParts.base_model = character.base_model;
          changes.push(`base model: ${baseModelAsset.name}`);
        } else {
          console.error(`[Character Preview] Could not find base model asset for ID: ${character.base_model}`);
        }
      }
      
      // Apply skin texture if changed
      if (character.skin && this.currentParts.skin !== character.skin) {
        const skinAsset = this.world.assetLookup?.skin?.find(
          asset => asset.id === character.skin
        );
        
        if (skinAsset && this.currentVrm) {
          console.log(`[Character Preview] Applying skin: ${skinAsset.name}`);
          
          // In a real implementation, you would apply the skin texture to the model
          // For now, we'll just update the tracking
          this.currentParts.skin = character.skin;
          changes.push(`skin: ${skinAsset.name}`);
        }
      }
      
      // Apply hair if changed
      if (character.hair && this.currentParts.hair !== character.hair) {
        const hairAsset = this.world.assetLookup?.hair?.find(
          asset => asset.id === character.hair
        );
        
        if (hairAsset && this.currentVrm) {
          console.log(`[Character Preview] Applying hair: ${hairAsset.name}`);
          
          // Remove previous hair if any
          if (this.loadedAttachments.hair && this.loadedAttachments.hair.object && this.loadedAttachments.hair.object.parent) {
            this.loadedAttachments.hair.object.parent.remove(this.loadedAttachments.hair.object);
            this.loadedAttachments.hair = null;
          }
          
          // Construct the correct path for the hair VRM file
          const hairPath = `/assets/avatars/hair/${hairAsset.id}.vrm`;
          console.log(`[Character Preview] Loading hair from: ${hairPath}`);
          
          // Load and attach the new hair
          await this.loadAttachment(hairPath, 'hair', 'head');
          
          this.currentParts.hair = character.hair;
          changes.push(`hair: ${hairAsset.name}`);
        }
      }
      
      // Apply clothing top if changed
      if (character.clothing_top && this.currentParts.clothing_top !== character.clothing_top) {
        const topAsset = this.world.assetLookup?.clothing_top?.find(
          asset => asset.id === character.clothing_top
        );
        
        if (topAsset && this.currentVrm) {
          console.log(`[Character Preview] Applying top: ${topAsset.name}`);
          
          // Remove previous top if any
          if (this.loadedAttachments.clothing_top && this.loadedAttachments.clothing_top.object && this.loadedAttachments.clothing_top.object.parent) {
            this.loadedAttachments.clothing_top.object.parent.remove(this.loadedAttachments.clothing_top.object);
            this.loadedAttachments.clothing_top = null;
          }
          
          // Construct the correct path for the top VRM file
          const topPath = `/assets/avatars/clothing/top/${topAsset.id}.vrm`;
          console.log(`[Character Preview] Loading top from: ${topPath}`);
          
          // Load and attach the new top
          await this.loadAttachment(topPath, 'clothing_top', 'chest');
          
          this.currentParts.clothing_top = character.clothing_top;
          changes.push(`top: ${topAsset.name}`);
        }
      }
      
      // Apply clothing bottom if changed
      if (character.clothing_bottom && this.currentParts.clothing_bottom !== character.clothing_bottom) {
        const bottomAsset = this.world.assetLookup?.clothing_bottom?.find(
          asset => asset.id === character.clothing_bottom
        );
        
        if (bottomAsset && this.currentVrm) {
          console.log(`[Character Preview] Applying bottom: ${bottomAsset.name}`);
          
          // Remove previous bottom if any
          if (this.loadedAttachments.clothing_bottom && this.loadedAttachments.clothing_bottom.object && this.loadedAttachments.clothing_bottom.object.parent) {
            this.loadedAttachments.clothing_bottom.object.parent.remove(this.loadedAttachments.clothing_bottom.object);
            this.loadedAttachments.clothing_bottom = null;
          }
          
          // Construct the correct path for the bottom VRM file
          const bottomPath = `/assets/avatars/clothing/bottom/${bottomAsset.id}.vrm`;
          console.log(`[Character Preview] Loading bottom from: ${bottomPath}`);
          
          // Load and attach the new bottom
          await this.loadAttachment(bottomPath, 'clothing_bottom', 'hips');
          
          this.currentParts.clothing_bottom = character.clothing_bottom;
          changes.push(`bottom: ${bottomAsset.name}`);
        }
      }
      
      // Apply shoes if changed
      if (character.clothing_shoes && this.currentParts.clothing_shoes !== character.clothing_shoes) {
        const shoesAsset = this.world.assetLookup?.clothing_shoes?.find(
          asset => asset.id === character.clothing_shoes
        );
        
        if (shoesAsset && this.currentVrm) {
          console.log(`[Character Preview] Applying shoes: ${shoesAsset.name}`);
          
          // Remove previous shoes if any
          if (this.loadedAttachments.clothing_shoes && this.loadedAttachments.clothing_shoes.object && this.loadedAttachments.clothing_shoes.object.parent) {
            this.loadedAttachments.clothing_shoes.object.parent.remove(this.loadedAttachments.clothing_shoes.object);
            this.loadedAttachments.clothing_shoes = null;
          }
          
          // Construct the correct path for the shoes VRM file
          const shoesPath = `/assets/avatars/footwear/${shoesAsset.id}.vrm`;
          console.log(`[Character Preview] Loading shoes from: ${shoesPath}`);
          
          // Load shoes as a single model
          await this.loadAttachment(shoesPath, 'clothing_shoes', 'feet');
          
          this.currentParts.clothing_shoes = character.clothing_shoes;
          changes.push(`shoes: ${shoesAsset.name}`);
        }
      }
      
      // Handle accessories (can have multiple)
      if (character.accessories && this.currentVrm) {
        const currentAccessories = this.currentParts.accessories || [];
        
        // Find accessories to remove
        const accessoriesToRemove = currentAccessories.filter(
          id => !character.accessories.includes(id)
        );
        
        // Find accessories to add
        const accessoriesToAdd = character.accessories.filter(
          id => !currentAccessories.includes(id)
        );
        
        // Remove accessories
        for (const accessoryId of accessoriesToRemove) {
          console.log(`[Character Preview] Removing accessory: ${accessoryId}`);
          
          // Find the index of this accessory in the loaded attachments
          const index = currentAccessories.indexOf(accessoryId);
          if (index >= 0 && index < this.loadedAttachments.accessories.length) {
            const accessory = this.loadedAttachments.accessories[index];
            if (accessory && accessory.object && accessory.object.parent) {
              accessory.object.parent.remove(accessory.object);
            }
            this.loadedAttachments.accessories.splice(index, 1);
          }
        }
        
        // Add new accessories
        for (const accessoryId of accessoriesToAdd) {
          const accessoryAsset = this.world.assetLookup?.accessories?.find(
            asset => asset.id === accessoryId
          );
          
          if (accessoryAsset) {
            console.log(`[Character Preview] Adding accessory: ${accessoryAsset.name}`);
            
            // Determine attachment point based on accessory type
            let attachPoint = 'head';
            if (accessoryId === 'glasses') {
              attachPoint = 'head';
            } else if (accessoryId === 'hat') {
              attachPoint = 'head';
            }
            
            // Construct the correct path for the accessory VRM file
            const accessoryPath = `/assets/avatars/accessories/${accessoryId}.vrm`;
            console.log(`[Character Preview] Loading accessory from: ${accessoryPath}`);
            
            // Load and attach the accessory
            await this.loadAttachment(accessoryPath, 'accessories', attachPoint);
            
            changes.push(`added accessory: ${accessoryAsset.name}`);
          }
        }
        
        // Update current accessories
        this.currentParts.accessories = [...character.accessories];
      }
      
      if (changes.length > 0) {
        console.log(`[Character Preview] Applied changes: ${changes.join(', ')}`);
      } else {
        console.log(`[Character Preview] No changes to apply`);
      }
    } catch (error) {
      console.error('[Character Preview] Error updating character:', error);
    }
  }
  
  async generateFinalAvatar() {
    // In a real implementation, this would create a final VRM file
    // For now, we'll just return a placeholder URL
    return '/assets/avatars/previews/avatar-placeholder.png';
  }
  
  destroy() {
    console.log('[Character Preview] Cleaning up resources');
    
    // Stop animation loop
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);
    
    // Dispose of Three.js objects
    if (this.currentVrm) {
      console.log('[Character Preview] Disposing VRM model');
      if (this.currentVrm.scene) {
        VRMUtils.deepDispose(this.currentVrm.scene);
      }
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Remove canvas from container
    if (this.container && this.renderer) {
      this.container.removeChild(this.renderer.domElement);
    }
    
    // Clear references
    this.currentVrm = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.container = null;
    
    console.log('[Character Preview] Cleanup complete');
  }
  
  // Debug method to visualize the bone structure
  visualizeBones() {
    if (!this.currentVrm || !this.currentVrm.scene) {
      console.warn('[Character Preview] No VRM model loaded, cannot visualize bones');
      return;
    }
    
    console.log('[Character Preview] Visualizing bones...');
    
    // Remove any existing bone helpers
    this.scene.traverse((object) => {
      if (object.userData && object.userData.isBoneHelper) {
        this.scene.remove(object);
      }
    });
    
    // Create a helper for each bone
    this.currentVrm.scene.traverse((object) => {
      if (object.isBone) {
        console.log(`[Character Preview] Found bone: ${object.name}`);
        
        // Create a small sphere to represent the bone
        const geometry = new THREE.SphereGeometry(0.02, 8, 8);
        
        // Use different colors for different bone types to make them easier to identify
        let color = 0xff0000; // Default red
        
        // Color code bones by type
        const name = object.name.toLowerCase();
        if (name.includes('head')) {
          color = 0xffff00; // Yellow for head
        } else if (name.includes('neck')) {
          color = 0xff8800; // Orange for neck
        } else if (name.includes('spine') || name.includes('chest')) {
          color = 0x00ff00; // Green for spine/chest
        } else if (name.includes('shoulder') || name.includes('arm')) {
          color = 0x0000ff; // Blue for arms
        } else if (name.includes('hand') || name.includes('finger')) {
          color = 0x00ffff; // Cyan for hands
        } else if (name.includes('hip') || name.includes('pelvis')) {
          color = 0xff00ff; // Magenta for hips
        } else if (name.includes('leg') || name.includes('thigh')) {
          color = 0x8800ff; // Purple for legs
        } else if (name.includes('foot') || name.includes('ankle')) {
          color = 0x00ff88; // Teal for feet
        }
        
        const material = new THREE.MeshBasicMaterial({ color: color });
        const sphere = new THREE.Mesh(geometry, material);
        
        // Add the sphere at the bone's position
        sphere.position.copy(object.position);
        sphere.userData.isBoneHelper = true;
        sphere.userData.boneName = object.name;
        
        // Add a small text label with the bone name
        const div = document.createElement('div');
        div.className = 'bone-label';
        div.textContent = object.name;
        div.style.position = 'absolute';
        div.style.fontSize = '10px';
        div.style.color = '#ffffff';
        div.style.backgroundColor = 'rgba(0,0,0,0.5)';
        div.style.padding = '2px';
        div.style.borderRadius = '2px';
        div.style.pointerEvents = 'none';
        div.style.zIndex = '1000';
        
        // Store the div for cleanup
        sphere.userData.labelDiv = div;
        
        // Add the sphere to the scene
        this.scene.add(sphere);
      }
    });
    
    console.log('[Character Preview] Bone visualization complete');
    
    // Add a method to toggle bone visualization
    if (!this.toggleBonesVisible) {
      this.toggleBonesVisible = () => {
        this.scene.traverse((object) => {
          if (object.userData && object.userData.isBoneHelper) {
            object.visible = !object.visible;
          }
        });
      };
      
      // Log the method name for debugging
      console.log('[Character Preview] Added toggleBonesVisible() method');
    }
  }
  
  // Log the bone structure to the console
  logBoneStructure() {
    if (!this.currentVrm || !this.currentVrm.scene) {
      console.warn('[Character Preview] No VRM model loaded, cannot log bone structure');
      return;
    }
    
    console.log('[Character Preview] Logging bone structure...');
    
    // Create a map to store the bone hierarchy
    const boneMap = new Map();
    const rootBones = [];
    
    // First pass: collect all bones
    this.currentVrm.scene.traverse((object) => {
      if (object.isBone) {
        boneMap.set(object.id, {
          name: object.name,
          children: [],
          object: object
        });
        
        if (!object.parent || !object.parent.isBone) {
          rootBones.push(object.id);
        }
      }
    });
    
    // Second pass: build the hierarchy
    this.currentVrm.scene.traverse((object) => {
      if (object.isBone && object.parent && object.parent.isBone) {
        const parentBone = boneMap.get(object.parent.id);
        if (parentBone) {
          parentBone.children.push(object.id);
        }
      }
    });
    
    // Helper function to print the bone hierarchy
    const printBoneHierarchy = (boneId, level = 0) => {
      const bone = boneMap.get(boneId);
      if (!bone) return;
      
      const indent = '  '.repeat(level);
      console.log(`${indent}${bone.name}`);
      
      for (const childId of bone.children) {
        printBoneHierarchy(childId, level + 1);
      }
    };
    
    // Print the hierarchy starting from root bones
    console.log('[Character Preview] Bone hierarchy:');
    for (const rootBoneId of rootBones) {
      printBoneHierarchy(rootBoneId);
    }
    
    console.log('[Character Preview] Bone structure logging complete');
  }
} 