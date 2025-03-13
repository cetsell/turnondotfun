import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';

export class CharacterPreview {
  constructor(world, container) {
    console.log('CharacterPreview: Initializing with world:', world);
    console.log('CharacterPreview: Container:', container);
    
    if (!world || !world.assetLookup) {
      throw new Error('CharacterPreview: World object with assetLookup is required');
    }
    
    if (!container) {
      throw new Error('CharacterPreview: Container element is required');
    }
    
    this.world = world;
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    
    try {
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (error) {
      console.error('CharacterPreview: Failed to create WebGL renderer:', error);
      throw error;
    }
    
    try {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    } catch (error) {
      console.error('CharacterPreview: Failed to create OrbitControls:', error);
      throw error;
    }
    
    this.loader = new GLTFLoader();
    this.loader.register(parser => new VRMLoaderPlugin(parser));
    
    // Setup
    this.setupScene();
    this.setupLights();
    this.setupRenderer();
    this.setupControls();
    
    // Start render loop
    this.animate();
    
    // Handle resize
    window.addEventListener('resize', this.onResize.bind(this));
    
    console.log('CharacterPreview: Initialization complete');
  }
  
  setupScene() {
    console.log('CharacterPreview: Setting up scene');
    this.scene.background = null;
    this.camera.position.set(0, 1.5, 2);
    this.camera.lookAt(0, 1, 0);
    
    // Add a grid helper for better orientation
    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);
  }
  
  setupLights() {
    console.log('CharacterPreview: Setting up lights');
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 3);
    this.scene.add(directionalLight);
    
    // Add light helper for debugging
    const lightHelper = new THREE.DirectionalLightHelper(directionalLight);
    this.scene.add(lightHelper);
  }
  
  setupRenderer() {
    console.log('CharacterPreview: Setting up renderer');
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);
  }
  
  setupControls() {
    console.log('CharacterPreview: Setting up controls');
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 5;
    this.controls.target.set(0, 1, 0);
    this.controls.enablePan = false;
  }
  
  onResize() {
    console.log('CharacterPreview: Handling resize');
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  
  async updateCharacter(components) {
    console.log('CharacterPreview: Updating character with components:', components);
    
    // Clear existing model
    while(this.scene.children.length > 0) { 
      const obj = this.scene.children[0];
      if(obj.type === 'Light' || obj.type === 'GridHelper' || obj.type === 'DirectionalLightHelper') continue;
      this.scene.remove(obj);
    }
    
    if (!components.base_model) {
      console.warn('CharacterPreview: No base model provided');
      return;
    }
    
    try {
      // Get the asset info from the world
      const baseModelAsset = this.world.assetLookup.base_model.find(a => a.id === components.base_model);
      if (!baseModelAsset) {
        console.error('CharacterPreview: Base model asset not found:', components.base_model);
        return;
      }
      
      console.log('CharacterPreview: Loading model from:', baseModelAsset.file_path);
      
      // Load base model
      const gltf = await this.loader.loadAsync(baseModelAsset.file_path);
      console.log('CharacterPreview: Model loaded successfully:', gltf);
      
      const model = gltf.scene;
      
      // Apply materials/textures based on components
      if (components.skin) {
        console.log('CharacterPreview: Applying skin:', components.skin);
        const skinAsset = this.world.assetLookup.skin.find(a => a.id === components.skin);
        if (skinAsset) {
          // Load and apply skin texture
          const textureLoader = new THREE.TextureLoader();
          const skinTexture = await textureLoader.loadAsync(skinAsset.file_path);
          model.traverse(obj => {
            if (obj.isMesh && obj.material) {
              obj.material.map = skinTexture;
              obj.material.needsUpdate = true;
            }
          });
        }
      }
      
      if (components.hair) {
        console.log('CharacterPreview: Adding hair:', components.hair);
        const hairAsset = this.world.assetLookup.hair.find(a => a.id === components.hair);
        if (hairAsset) {
          // Load and add hair model
          const hairGltf = await this.loader.loadAsync(hairAsset.file_path);
          model.add(hairGltf.scene);
        }
      }
      
      // Position model
      model.position.set(0, 0, 0);
      this.scene.add(model);
      console.log('CharacterPreview: Model added to scene');
      
      // Adjust camera to frame model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = this.camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
      
      this.camera.position.set(0, center.y, center.z + cameraZ);
      this.controls.target.set(0, center.y, 0);
      this.camera.updateProjectionMatrix();
      this.controls.update();
      console.log('CharacterPreview: Camera adjusted to frame model');
      
    } catch (error) {
      console.error('CharacterPreview: Error updating character:', error);
      console.error('Error details:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
  }
  
  destroy() {
    console.log('CharacterPreview: Destroying instance');
    if (this.renderer) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
    window.removeEventListener('resize', this.onResize);
  }
} 