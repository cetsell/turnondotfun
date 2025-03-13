import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AnimatedBackground } from './AnimatedBackground';
import { CharacterPreview } from './CharacterPreview.jsx';
import * as THREE from 'three';
import '../styles/avatarCustomizer.css';
import { fetchApi, getAssetUrl, fileExists } from '../utils/apiUtils';

// Categories of character customization
const CATEGORIES = [
  'base_model',
  'skin',
  'hair',
  'clothing_top',
  'clothing_bottom',
  'clothing_shoes',
  'accessories'
];

/**
 * Avatar Customizer Page
 */
export function AvatarCustomizer() {
  console.log("=== AVATAR CUSTOMIZER COMPONENT RENDERING ===");
  
  const { user, getToken, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const viewportRef = useRef();
  const previewRef = useRef();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);
  
  const [activeCategory, setActiveCategory] = useState('base_model');
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState({
    base_model: null,
    skin: null,
    hair: null,
    hair_color: '#000000',
    clothing_top: null,
    clothing_bottom: null,
    clothing_shoes: null,
    accessories: []
  });
  
  // Update the preview when character changes
  useEffect(() => {
    if (!previewRef.current) {
      console.log('[Avatar Customizer] Preview not initialized yet');
      return;
    }
    
    if (!character.base_model) {
      console.log('[Avatar Customizer] No base model selected yet');
      return;
    }
    
    try {
      console.log('[Avatar Customizer] Updating preview with character changes');
      previewRef.current.updateCharacter(character);
    } catch (error) {
      console.error('[Avatar Customizer] Error updating character preview:', error);
    }
  }, [character]);
  
  // Initialize preview
  useEffect(() => {
    if (!viewportRef.current) {
      console.log('[Avatar Customizer] Viewport not ready');
      return;
    }
    
    if (!assets || Object.keys(assets).length === 0) {
      console.log('[Avatar Customizer] Assets not loaded yet');
      return;
    }
    
    // Create a world object for the preview
    // Log the assets structure to help debug
    console.log('[Avatar Customizer] Assets structure:', JSON.stringify(assets, null, 2));
    
    const world = {
      assetLookup: assets
    };
    
    try {
      // Create the preview instance
      console.log('[Avatar Customizer] Initializing character preview');
      const preview = new CharacterPreview(world, viewportRef.current);
      previewRef.current = preview;
      
      // Update the preview with current character settings
      if (character.base_model) {
        console.log('[Avatar Customizer] Setting initial character model');
        preview.updateCharacter(character);
      }
      
      return () => {
        if (preview && preview.destroy) {
          try {
            console.log('[Avatar Customizer] Cleaning up character preview');
            preview.destroy();
          } catch (e) {
            console.error('[Avatar Customizer] Error destroying preview:', e);
          }
        }
      };
    } catch (error) {
      console.error('[Avatar Customizer] Error initializing character preview:', error);
      console.error('[Avatar Customizer] Error details:', error.message);
      if (error.stack) {
        console.error('[Avatar Customizer] Stack trace:', error.stack);
      }
      setLoading(false);
    }
  }, [assets]);
  
  // Load available assets
  useEffect(() => {
    console.log('[Avatar Customizer] Component mounted');
    
    // Initialize the character with default settings
    const defaultCharacter = {
      base_model: 'default_male',
      skin: 'skin_light',
      hair: 'short',
      clothing_top: 'shirt',
      clothing_bottom: 'cargopants',
      clothing_shoes: 'sneakers',
      accessories: []
    };
    
    console.log('[Avatar Customizer] Setting initial character:', defaultCharacter);
    setCharacter(defaultCharacter);
    
    // Load asset definitions
    const loadAssets = async () => {
      setLoading(true);
      try {
        // Default assets that we know exist locally
        // Using real file paths to the assets
        const defaultAssets = {
          base_model: [
            { id: 'default_male', name: 'Default Male', category: 'base_model', file_path: '/assets/avatars/base_models/default_male.vrm', preview_image: '/assets/avatars/previews/default_male.png' },
            { id: 'drophunter', name: 'Drop Hunter', category: 'base_model', file_path: '/assets/avatars/base_models/drophunter.vrm', preview_image: '/assets/avatars/previews/drophunter.png' },
            { id: 'neurohacker', name: 'Neuro Hacker', category: 'base_model', file_path: '/assets/avatars/base_models/neurohacker.vrm', preview_image: '/assets/avatars/previews/neurohacker.png' },
          ],
          skin: [
            { id: 'skin_light', name: 'Light Skin', category: 'skin', file_path: '/assets/avatars/textures/skin_light.png', preview_image: '/assets/avatars/previews/skin_light.png' },
            { id: 'skin_dark', name: 'Dark Skin', category: 'skin', file_path: '/assets/avatars/textures/skin_dark.png', preview_image: '/assets/avatars/previews/skin_dark.png' },
          ],
          hair: [
            { id: 'short', name: 'Short Hair', category: 'hair', file_path: '/assets/avatars/hair/short.vrm', preview_image: '/assets/avatars/previews/short-hair.png' },
            { id: 'straight', name: 'Straight Hair', category: 'hair', file_path: '/assets/avatars/hair/straight.vrm', preview_image: '/assets/avatars/previews/straight.png' },
            { id: 'ponytail', name: 'Ponytail', category: 'hair', file_path: '/assets/avatars/hair/ponytail.vrm', preview_image: '/assets/avatars/previews/ponytail.png' },
          ],
          clothing_top: [
            { id: 'shirt', name: 'Shirt', category: 'clothing_top', file_path: '/assets/avatars/clothing/top/shirt.vrm', preview_image: '/assets/avatars/previews/shirt.png' },
            { id: 'tanktop', name: 'Tank Top', category: 'clothing_top', file_path: '/assets/avatars/clothing/top/tanktop.vrm', preview_image: '/assets/avatars/previews/tanktop.png' },
            { id: 'hoodie', name: 'Hoodie', category: 'clothing_top', file_path: '/assets/avatars/clothing/top/hoodie.vrm', preview_image: '/assets/avatars/previews/hoodie.png' },
          ],
          clothing_bottom: [
            { id: 'shorts', name: 'Shorts', category: 'clothing_bottom', file_path: '/assets/avatars/clothing/bottom/casualshorts.vrm', preview_image: '/assets/avatars/previews/casualshorts.png' },
            { id: 'cargopants', name: 'Cargo Pants', category: 'clothing_bottom', file_path: '/assets/avatars/clothing/bottom/cargopants.vrm', preview_image: '/assets/avatars/previews/cargopants.png' },
            { id: 'skirt', name: 'Skirt', category: 'clothing_bottom', file_path: '/assets/avatars/clothing/bottom/skirt.vrm', preview_image: '/assets/avatars/previews/skirt.png' },
          ],
          clothing_shoes: [
            { id: 'sneakers', name: 'Sneakers', category: 'clothing_shoes', file_path: '/assets/avatars/footwear/sneakers.vrm', preview_image: '/assets/avatars/previews/sneakers.png' },
            { id: 'tallboots', name: 'Tall Boots', category: 'clothing_shoes', file_path: '/assets/avatars/footwear/tallboots.vrm', preview_image: '/assets/avatars/previews/tallboots.png' },
            { id: 'tennisshoes', name: 'Tennis Shoes', category: 'clothing_shoes', file_path: '/assets/avatars/footwear/tennisshoes.vrm', preview_image: '/assets/avatars/previews/tennisshoes.png' },
          ],
          accessories: [
            { id: 'glasses', name: 'Glasses', category: 'accessories', file_path: '/assets/avatars/accessories/glasses.vrm', preview_image: '/assets/avatars/previews/glasses.png' },
            { id: 'hat', name: 'Hat', category: 'accessories', file_path: '/assets/avatars/accessories/hat.vrm', preview_image: '/assets/avatars/previews/hat.png' },
          ],
        };
        
        // Verify that the base model files exist
        await verifyAssetFiles(defaultAssets);
        
        console.log(`[Avatar Customizer] Loaded ${Object.keys(defaultAssets).length} asset categories`);
        setAssets(defaultAssets);
        
        // Apply the default character immediately after assets are loaded
        setTimeout(() => {
          console.log('[Avatar Customizer] Applying default character after assets loaded');
          setCharacter(prevChar => ({...prevChar})); // Force a re-render with the same character
        }, 100);
        
        setLoading(false);
      } catch (error) {
        console.error('[Avatar Customizer] Error loading assets:', error);
        setLoading(false);
      }
    };
    
    loadAssets();
  }, []);
  
  // Force character update when assets are loaded
  useEffect(() => {
    if (assets && Object.keys(assets).length > 0) {
      console.log('[Avatar Customizer] Assets loaded, updating character');
      setCharacter(prevChar => ({...prevChar})); // Force a re-render with the same character
    }
  }, [assets]);

  // Apply character changes
  useEffect(() => {
    if (character) {
      console.log('[Avatar Customizer] Character updated:', character);
    }
  }, [character]);
  
  // Function to verify that asset files exist
  const verifyAssetFiles = async (assetCategories) => {
    try {
      // Check base models first as they're most important
      if (assetCategories.base_model) {
        for (const asset of assetCategories.base_model) {
          try {
            console.log(`[Avatar Customizer] Verifying base model: ${asset.file_path}`);
            const exists = await fileExists(asset.file_path);
            if (!exists) {
              console.error(`[Avatar Customizer] Base model file not found: ${asset.file_path}`);
            } else {
              console.log(`[Avatar Customizer] Base model file exists: ${asset.file_path}`);
            }
          } catch (error) {
            console.error(`[Avatar Customizer] Error checking base model file: ${asset.file_path}`, error);
          }
        }
      }
    } catch (error) {
      console.error('[Avatar Customizer] Error verifying asset files:', error);
    }
  };
  
  // Select an asset for the current category
  const selectAsset = (asset) => {
    // Only log the important info about what's being selected
    console.log(`[Avatar Customizer] Selecting ${asset.name} for ${asset.category}`);
    console.log(`[Avatar Customizer] Asset details:`, asset);
    
    // Update the character state with the new selection
    setCharacter(prev => {
      // Check if this is actually a change
      if (prev[asset.category] === asset.id) {
        console.log(`[Avatar Customizer] ${asset.name} is already selected for ${asset.category}`);
        return prev; // No change needed
      }
      
      console.log(`[Avatar Customizer] Updating character state: ${asset.category} = ${asset.id}`);
      
      // Return updated character with the new selection
      const updated = {
        ...prev,
        [asset.category]: asset.id
      };
      
      console.log(`[Avatar Customizer] New character state:`, updated);
      return updated;
    });
  };
  
  // Add/remove an accessory (allows multiple)
  const toggleAccessory = (asset) => {
    setCharacter(prev => {
      const accessories = [...prev.accessories];
      const index = accessories.indexOf(asset.id);
      
      if (index >= 0) {
        // Removing an accessory
        console.log(`[Avatar Customizer] Removing accessory: ${asset.name}`);
        accessories.splice(index, 1);
      } else {
        // Adding an accessory
        console.log(`[Avatar Customizer] Adding accessory: ${asset.name}`);
        accessories.push(asset.id);
      }
      
      return {
        ...prev,
        accessories
      };
    });
  };
  
  // Save avatar config
  const saveAvatar = async () => {
    try {
      // Get auth token
      const token = getToken();
      
      // Check if preview has been generated
      if (!previewRef.current) {
        console.warn('Character preview not initialized, using default avatar');
      }
      
      // Get avatar URL if possible
      let avatarUrl = '/assets/avatars/previews/avatar-placeholder.png';
      
      if (previewRef.current) {
        try {
          avatarUrl = await previewRef.current.generateFinalAvatar();
        } catch (previewError) {
          console.error('Error generating avatar preview:', previewError);
          // Continue with placeholder URL
        }
      }
      
      // If we have a token, try to save the configuration to the server
      if (token) {
        try {
          const response = await fetchApi('/api/avatar/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ...character,
              avatar_url: avatarUrl
            })
          });
          
          if (!response.ok) {
            console.warn('Server warning: Failed to save avatar configuration to server, continuing with local save');
          } else {
            console.log('Avatar configuration saved to server successfully');
          }
        } catch (apiError) {
          console.warn('API warning: Could not save to server, using local storage instead', apiError);
        }
      }
      
      // Save to local storage as fallback
      localStorage.setItem('localAvatarConfig', JSON.stringify({
        ...character,
        avatar_url: avatarUrl
      }));
      console.log('Saved avatar configuration to local storage');
      
      // Navigate back to worlds page
      navigate('/worlds');
    } catch (error) {
      console.error('Error in avatar creation process:', error);
      // Navigate back anyway
      navigate('/worlds');
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleBackToWorlds = () => {
    navigate('/worlds');
  };

  return (
    <div className="page-container">
      <AnimatedBackground />
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackToWorlds}
              className="btn btn-secondary px-4 py-2"
            >
              Back to Worlds
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 mt-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 3D Preview */}
          <div className="relative avatar-preview-container">
            <div 
              ref={viewportRef}
              className="bg-gray-800 rounded-lg shadow-lg aspect-square w-full h-[500px] relative"
              style={{ minHeight: '500px' }}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          {/* Asset Selection */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Customize Your Avatar</h2>
              <div className="flex gap-2">
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => {
                      if (previewRef.current) {
                        previewRef.current.visualizeBones();
                        previewRef.current.logBoneStructure();
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md"
                  >
                    Debug Bones
                  </button>
                )}
                <button
                  onClick={saveAvatar}
                  className="save-button px-4 py-2 rounded-lg"
                >
                  Save Avatar
                </button>
              </div>
            </div>
            
            {/* Category Selection */}
            <div className="flex flex-wrap gap-2 mb-6">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`category-button px-4 py-2 rounded-lg transition-all ${
                    activeCategory === category
                      ? 'active'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            
            {/* Asset Grid */}
            <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2 asset-grid">
              {loading ? (
                <div className="col-span-3 text-center text-gray-400 py-8">
                  Loading assets...
                </div>
              ) : !assets[activeCategory] || assets[activeCategory].length === 0 ? (
                <div className="col-span-3 text-center text-gray-400 py-8">
                  No {activeCategory.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} assets available
                </div>
              ) : (
                assets[activeCategory].map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => activeCategory === 'accessories' ? toggleAccessory(asset) : selectAsset(asset)}
                    className={`asset-button p-3 rounded-lg transition-all ${
                      activeCategory === 'accessories'
                        ? character.accessories.includes(asset.id)
                          ? 'selected bg-secondary'
                          : 'bg-gray-700 hover:bg-gray-600'
                        : character[activeCategory] === asset.id
                          ? 'selected bg-secondary'
                          : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="w-24 h-24 mx-auto mb-2 flex items-center justify-center">
                      <img
                        src={asset.preview_image}
                        alt={asset.name}
                        className="asset-image rounded"
                        onError={(e) => {
                          // Only log once per session for each missing image
                          if (!window._missingImageWarnings) {
                            window._missingImageWarnings = new Set();
                          }
                          
                          const imagePath = asset.preview_image;
                          if (!window._missingImageWarnings.has(imagePath)) {
                            console.warn(`Missing preview image: ${imagePath}`);
                            window._missingImageWarnings.add(imagePath);
                          }
                          
                          // Prevent further errors
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                    <p className="text-sm text-center text-white truncate">
                      {asset.name}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 