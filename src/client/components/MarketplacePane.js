import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ShoppingBagIcon, 
  XIcon, 
  FileIcon, 
  UserIcon, 
  SunIcon, 
  SmileIcon, 
  BookIcon, 
  SettingsIcon 
} from 'lucide-react';
import { usePane } from './usePane';

// Initialize Supabase client with the correct environment variables
// Use a singleton pattern to avoid multiple instances
let supabaseInstance = null;
const getSupabase = () => {
  if (!supabaseInstance) {
    // Properly access environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key available:', !!supabaseKey);
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or Key is missing');
      return null;
    }
    
    try {
      // Use the anon key for client-side access - proper RLS policies will control access
      supabaseInstance = createClient(supabaseUrl, supabaseKey);
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      return null;
    }
  }
  return supabaseInstance;
};

const MarketplacePane = ({ onClose, world }) => {
  const [activeTab, setActiveTab] = useState('avatars');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState(null);
  const paneRef = useRef(null);
  const headRef = useRef(null);
  const spinnerRef = useRef(null);
  const supabase = getSupabase();
  
  // Use the same pane management hook as AvatarPane
  usePane('marketplace', paneRef, headRef);

  // Add spinner animation
  useEffect(() => {
    if (spinnerRef.current && loading) {
      let rotation = 0;
      const animateSpinner = () => {
        if (!spinnerRef.current) return;
        rotation += 5;
        spinnerRef.current.style.transform = `rotate(${rotation}deg)`;
        if (rotation >= 360) rotation = 0;
        requestAnimationFrame(animateSpinner);
      };
      const animationId = requestAnimationFrame(animateSpinner);
      return () => cancelAnimationFrame(animationId);
    }
  }, [loading, spinnerRef.current]);

  // Fetch marketplace items based on active tab
  useEffect(() => {
    if (supabase) {
      loadMarketplaceItems();
    } else {
      setError('Could not connect to database. Please check your configuration.');
      setLoading(false);
    }
  }, [activeTab]);

  // Check user session and get user data
  useEffect(() => {
    if (supabase) {
      checkUser();
      // Try to sign in anonymously if not authenticated
      signInAnonymously();
    }
  }, []);

  // Handle notification display and auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const checkUser = async () => {
    if (!supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (userError) throw userError;
        setUserData(userData);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  // Try to sign in anonymously to get a valid session for RLS
  const signInAnonymously = async () => {
    if (!supabase) return;
    
    try {
      // Check if we already have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found, attempting anonymous sign-in...');
        
        // Try to sign in anonymously
        const { data, error } = await supabase.auth.signInAnonymously();
        
        if (error) {
          console.error('Anonymous sign-in failed:', error);
        } else {
          console.log('Anonymous sign-in successful:', !!data.session);
        }
      } else {
        console.log('Existing session found, no need for anonymous sign-in');
      }
    } catch (error) {
      console.error('Error during anonymous sign-in:', error);
    }
  };

  const loadMarketplaceItems = async () => {
    if (!supabase) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to fetch marketplace data for tab:', activeTab);
      
      // Check if we're authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Authentication session:', session ? 'Authenticated' : 'Not authenticated');
      
      // If not authenticated, try to sign in anonymously
      if (!session) {
        await signInAnonymously();
        // Get the session again after attempting to sign in
        const { data: { session: newSession } } = await supabase.auth.getSession();
        console.log('Authentication after anonymous sign-in:', newSession ? 'Authenticated' : 'Still not authenticated');
      }
      
      // Check RLS configuration
      await checkRLSConfiguration();
      
      // First, let's check the structure of the marketplace table
      const { data: sampleData, error: sampleError } = await supabase
        .from('marketplace')
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.error('Error fetching sample data:', sampleError);
      } else {
        console.log('Sample marketplace item structure:', sampleData && sampleData.length > 0 ? sampleData[0] : 'No data');
      }
      
      // Check if we have a sample item to determine the schema
      const hasTypeField = sampleData && sampleData.length > 0 && 'type' in sampleData[0];
      const hasAssetId = sampleData && sampleData.length > 0 && 'asset_id' in sampleData[0];
      const hasStoryId = sampleData && sampleData.length > 0 && 'story_id' in sampleData[0];
      
      console.log('Schema check - Has type field:', hasTypeField);
      console.log('Schema check - Has asset_id field:', hasAssetId);
      console.log('Schema check - Has story_id field:', hasStoryId);
      
      // Check for valid enum values in the assets table
      let validAssetTypes = [];
      try {
        // Query to get the enum values for asset_type
        const { data: enumData, error: enumError } = await supabase.rpc('get_enum_values', {
          enum_name: 'asset_type'
        });
        
        if (enumError) {
          console.error('Error fetching enum values:', enumError);
          // Fallback to checking the assets table directly
          const { data: assetSample, error: assetError } = await supabase
            .from('assets')
            .select('type')
            .limit(10);
            
          if (!assetError && assetSample && assetSample.length > 0) {
            // Extract unique types from the sample
            validAssetTypes = [...new Set(assetSample.map(asset => asset.type).filter(Boolean))];
            console.log('Valid asset types from sample:', validAssetTypes);
          }
        } else if (enumData) {
          validAssetTypes = enumData;
          console.log('Valid asset types from enum:', validAssetTypes);
        }
      } catch (error) {
        console.error('Error checking asset types:', error);
      }
      
      // Map tab names to potential asset types
      const tabToAssetTypeMap = {
        'avatars': ['avatar', 'character', 'model', 'character_model'],
        'environments': ['environment', 'skybox', 'world', 'scene'],
        'emotes': ['emote', 'animation', 'mocap'],
        'stories': ['story', 'narrative'],
        'items': ['item', 'prop', 'object', 'accessory']
      };
      
      // Build query with relational data
      let query = supabase.from('marketplace').select(`
        *,
        assets(*),
        stories(*)
      `);
      
      // Apply filters based on the active tab and available fields
      if (hasTypeField) {
        // If we have a type field, use it directly
        if (activeTab === 'avatars') {
          query = query.eq('type', 'avatar');
        } else if (activeTab === 'environments') {
          query = query.eq('type', 'environment');
        } else if (activeTab === 'emotes') {
          query = query.eq('type', 'emote');
        } else if (activeTab === 'stories') {
          query = query.eq('type', 'story');
        } else if (activeTab === 'items') {
          query = query.eq('type', 'item');
        }
      } else if (hasAssetId && hasStoryId) {
        // If we don't have a type field but have asset_id and story_id,
        // we can infer the type based on which field is populated
        if (activeTab === 'stories') {
          // Stories have story_id but not asset_id
          query = query.not('story_id', 'is', null);
        } else {
          // All other types have asset_id but not story_id
          query = query.not('asset_id', 'is', null);
          
          // We can't differentiate between avatar, environment, emote, and item
          // without additional information, so we'll return all assets
          console.log('Warning: Cannot differentiate between asset types without a type field');
          
          // If we have asset types in the assets table, we can filter by that
          // But we need to check if the type values match our expected values
          if (validAssetTypes.length > 0) {
            const potentialTypes = tabToAssetTypeMap[activeTab] || [];
            const matchingTypes = potentialTypes.filter(type => 
              validAssetTypes.some(validType => 
                validType.toLowerCase() === type.toLowerCase()
              )
            );
            
            if (matchingTypes.length > 0) {
              console.log(`Found matching asset types for ${activeTab}:`, matchingTypes);
              // Use the first matching type
              query = query.eq('assets.type', matchingTypes[0]);
            } else {
              console.log(`No matching asset types found for ${activeTab}, showing all assets`);
            }
          }
        }
      }
      
      // Execute the query
      const { data, error } = await query;
      
      // Log the results
      console.log(`Query results for ${activeTab}:`, data ? `${data.length} items` : 'No data');
      if (error) console.error('Query error:', error);
      
      if (error) {
        // If the error is related to invalid enum value, try again without filtering by type
        if (error.code === '22P02' && error.message && error.message.includes('invalid input value for enum')) {
          console.log('Encountered enum type error, retrying without type filtering');
          
          // Retry the query without type filtering
          const retryQuery = supabase.from('marketplace').select(`
            *,
            assets(*),
            stories(*)
          `);
          
          // Only filter by story_id vs asset_id if needed
          if (hasStoryId && activeTab === 'stories') {
            retryQuery.not('story_id', 'is', null);
          } else if (hasAssetId && activeTab !== 'stories') {
            retryQuery.not('asset_id', 'is', null);
          }
          
          const { data: retryData, error: retryError } = await retryQuery;
          
          if (retryError) {
            console.error('Retry query also failed:', retryError);
            throw retryError;
          }
          
          if (retryData && retryData.length > 0) {
            console.log('Successfully retrieved marketplace data on retry, count:', retryData.length);
            setItems(retryData);
            return;
          }
        }
        
        throw error;
      }
      
      // Check if we have data
      if (data && data.length > 0) {
        console.log('Successfully retrieved marketplace data, count:', data.length);
        console.log('First few items with relational data:', data.slice(0, 3));
        setItems(data);
      } else {
        console.log('No data returned from marketplace table, using mock data');
        setItems(getMockData());
      }
    } catch (error) {
      console.error('Error loading marketplace items:', error);
      setError('Failed to load marketplace items: ' + (error.message || 'Unknown error'));
      setItems(getMockData());
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to check RLS configuration
  const checkRLSConfiguration = async () => {
    try {
      console.log('Checking RLS configuration...');
      
      // Try to get the total count to check if RLS is allowing access
      const { data: countData, error: countError } = await supabase
        .from('marketplace')
        .select('count');
        
      if (countError) {
        console.error('RLS check error:', countError);
        console.log('RLS may be blocking access to the marketplace table.');
        console.log('Please ensure proper RLS policies are configured in Supabase:');
        console.log('1. Enable RLS on the marketplace table');
        console.log('2. Create a policy that allows anonymous read access:');
        console.log(`   CREATE POLICY "Allow anonymous read access" ON "public"."marketplace" FOR SELECT USING (true);`);
        return false;
      }
      
      const hasAccess = countData && countData.length > 0;
      console.log('RLS check result:', hasAccess ? 'Access granted' : 'No access');
      
      if (!hasAccess) {
        console.log('RLS may be blocking access to the marketplace table.');
        console.log('Please ensure proper RLS policies are configured in Supabase.');
      }
      
      return hasAccess;
    } catch (error) {
      console.error('Error checking RLS configuration:', error);
      return false;
    }
  };
  
  // Helper function to get consistent mock data
  const getMockData = () => {
    return [
      {
        id: 1,
        listing_id: 1,
        price: 100,
        description: "A cool avatar model",
        status: "active",
        asset_id: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        listing_id: 2,
        price: 200,
        description: "Another cool avatar model",
        status: "active",
        asset_id: 2,
        created_at: new Date().toISOString()
      }
    ];
  };

  const handleBuyItem = (item) => {
    // Extract name using the relational data
    let itemName;
    
    if (item.story_id && item.stories) {
      // Use story title
      itemName = item.stories.title || "Story";
    } else if (item.asset_id && item.assets) {
      // Use asset name
      const asset = item.assets;
      
      if (asset.name) {
        itemName = asset.name;
      } else if (asset.file_url) {
        // Fall back to extracting from file path
        const fileName = asset.file_url.split('/').pop();
        const nameWithoutExtension = fileName.split('.')[0].replace(/-/g, ' ');
        itemName = nameWithoutExtension
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      } else {
        // Last resort fallback
        itemName = item.type ? `${item.type.charAt(0).toUpperCase() + item.type.slice(1)}` : "Item";
      }
    } else {
      // Fallback if no relational data is available
      itemName = item.description || "Item";
    }
    
    // Show purchase notification
    setNotification(`You purchased ${itemName}!`);
    
    // In a real app, you would handle the purchase transaction here
    console.log('Purchase item:', item);
  };

  // Handle tab click
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div
      ref={paneRef}
      style={styles.paneContainer}
    >
      <div className="vpane-head" ref={headRef} style={styles.header}>
        <ShoppingBagIcon size={16} />
        <div style={styles.title}>My World Marketplace</div>
        <div style={styles.closeButton} onClick={onClose}>
          <XIcon size={20} />
        </div>
      </div>

      <div style={styles.tabs}>
        <TabButton 
          active={activeTab === 'avatars'} 
          onClick={() => handleTabClick('avatars')}
        >
          <UserIcon size={16} />
          <span>Avatars</span>
        </TabButton>
        <TabButton 
          active={activeTab === 'environments'} 
          onClick={() => handleTabClick('environments')}
        >
          <SunIcon size={16} />
          <span>Environments</span>
        </TabButton>
        <TabButton
          active={activeTab === 'emotes'} 
          onClick={() => handleTabClick('emotes')}
        >
          <SmileIcon size={16} />
          <span>Emotes</span>
        </TabButton>
        <TabButton
          active={activeTab === 'stories'} 
          onClick={() => handleTabClick('stories')}
        >
          <BookIcon size={16} />
          <span>Stories</span>
        </TabButton>
        <TabButton
          active={activeTab === 'items'} 
          onClick={() => handleTabClick('items')}
        >
          <SettingsIcon size={16} />
          <span>Items</span>
        </TabButton>
      </div>

      <div style={styles.content}>
        {!supabase ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorMessage}>Database connection not available. Please check your configuration.</p>
          </div>
        ) : loading ? (
          <div style={styles.loadingContainer}>
            <div ref={spinnerRef} style={styles.loadingSpinner} />
            <p>Loading {activeTab}...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorMessage}>{error}</p>
            <button 
              style={styles.retryButton}
              onClick={loadMarketplaceItems}
            >
              Retry
            </button>
          </div>
        ) : items.length > 0 ? (
          <div style={styles.itemsContainer}>
            {items.map(item => (
              <MarketplaceItem
                key={item.listing_id || item.id}
                item={item}
                onBuy={handleBuyItem}
              />
            ))}
          </div>
        ) : (
          <div style={styles.emptyContainer}>
            <p>No {activeTab} available</p>
          </div>
        )}
      </div>
      
      {notification && (
        <div style={styles.notification}>
          <ShoppingBagIcon size={16} />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    style={{
      ...styles.tabButton,
      ...(active ? styles.activeTab : {})
    }}
    onClick={onClick}
  >
    {children}
  </button>
);

const MarketplaceItem = ({ item, onBuy }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [buyHovered, setBuyHovered] = useState(false);
  
  // Determine if this is a story or asset
  const isStory = Boolean(item.story_id);
  
  // Extract name
  let itemName;
  if (isStory && item.stories) {
    itemName = item.stories.title || "Story";
  } else if (item.assets) {
    const asset = item.assets;
    if (asset.name) {
      itemName = asset.name;
    } else if (asset.file_url) {
      // Fall back to extracting from file path
      const fileName = asset.file_url.split('/').pop();
      const nameWithoutExtension = fileName.split('.')[0].replace(/-/g, ' ');
      itemName = nameWithoutExtension
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } else {
      itemName = item.type ? `${item.type.charAt(0).toUpperCase() + item.type.slice(1)}` : "Item";
    }
  } else {
    itemName = item.description || "Item";
  }
  
  // Extract description
  let itemDescription;
  if (isStory && item.stories) {
    itemDescription = item.stories.description || "A story for your world";
  } else if (item.assets) {
    itemDescription = item.assets.description || "An asset for your world";
  } else {
    itemDescription = item.description || "An item for your world";
  }
  
  // Extract image
  let itemImage;
  if (isStory && item.stories && item.stories.cover_image) {
    itemImage = item.stories.cover_image;
  } else if (!isStory && item.assets) {
    itemImage = item.assets.thumbnail_url || item.assets.preview_url;
  }
  
  // Determine price
  const price = item.price ? `$${item.price.toFixed(2)}` : "Free";
  
  // Determine icon based on type
  let icon = "📦"; // Default
  if (isStory) {
    icon = "📖"; // Story
  } else if (item.type) {
    switch(item.type.toLowerCase()) {
      case 'avatar':
        icon = "👤";
        break;
      case 'skybox':
        icon = "🌌";
        break;
      case 'emote':
        icon = "🎭";
        break;
      case 'texture':
        icon = "🖼️";
        break;
      case 'model':
        icon = "🏺";
        break;
      default:
        icon = "📦";
    }
  }
  
  return (
    <div 
      style={{
        ...styles.item,
        ...(isHovered ? styles.itemHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.itemImageContainer}>
        {itemImage ? (
          <img 
            src={itemImage} 
            alt={itemName}
            style={styles.itemImage}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        <div style={{
          ...styles.itemIcon,
          display: itemImage ? 'none' : 'block'
        }}>
          {icon}
        </div>
      </div>
      <div style={styles.itemName} title={itemName}>{itemName}</div>
      <div style={styles.itemDescription} title={itemDescription}>{itemDescription}</div>
      <div style={styles.itemPrice}>{price}</div>
      <button 
        style={{
          ...styles.buyButton,
          ...(buyHovered ? styles.buyButtonHover : {})
        }}
        onMouseEnter={() => setBuyHovered(true)}
        onMouseLeave={() => setBuyHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onBuy(item);
        }}
      >
        {price === "Free" ? "Get" : "Buy"}
      </button>
    </div>
  );
};

// Define styles as plain JavaScript objects
const styles = {
  paneContainer: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '400px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    pointerEvents: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    margin: 0,
    color: 'white',
    fontSize: '18px',
    fontWeight: 600,
    paddingLeft: '7px',
    flex: 1
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    width: '40px',
    height: '40px'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    overflowX: 'auto'
  },
  tabButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '14px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  activeTab: {
    color: 'white',
    borderBottom: '2px solid #3498db',
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    maxHeight: 'calc(80vh - 110px)'
  },
  itemsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '15px',
    padding: '10px',
    overflowY: 'auto',
    height: 'calc(100% - 50px)',
  },
  
  item: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#2a2a2a',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    height: '220px',
  },
  
  itemHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  },
  
  itemImageContainer: {
    position: 'relative',
    width: '100%',
    height: '120px',
    marginBottom: '10px',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  
  itemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  
  itemIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '40px',
    color: '#888',
  },
  
  itemName: {
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  
  itemDescription: {
    fontSize: '12px',
    color: '#aaa',
    marginBottom: '5px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    textOverflow: 'ellipsis',
    height: '30px',
  },
  
  itemPrice: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 'auto',
    fontSize: '14px',
  },
  
  buyButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '5px',
    transition: 'background-color 0.2s',
  },
  
  buyButtonHover: {
    backgroundColor: '#45a049',
  },
  
  notification: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    zIndex: 1000,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  loadingSpinner: {
    width: '30px',
    height: '30px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: '#3498db',
    borderRadius: '50%',
    marginBottom: '15px'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    color: '#e74c3c'
  },
  errorMessage: {
    marginBottom: '15px',
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 15px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#c0392b'
    }
  },
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center'
  }
};

export default MarketplacePane;
