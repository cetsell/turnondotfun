import { css } from '@firebolt-dev/css'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BoxIcon,
  BrickWall,
  BrickWallIcon,
  CrosshairIcon,
  EyeIcon,
  FileCode2Icon,
  HardDriveIcon,
  HashIcon,
  LayoutGridIcon,
  PencilIcon,
  RotateCcwIcon,
  SearchIcon,
  SettingsIcon,
  TargetIcon,
  TriangleIcon,
  XIcon,
  ZapIcon,
  ShoppingCartIcon,
} from 'lucide-react'

import { usePane } from './usePane'
import { cls } from './cls'
import { orderBy } from 'lodash-es'
import { formatBytes } from '../../core/extras/formatBytes'
import { supabase } from '../lib/supabase'

export function AppsPane({ world, close }) {
  const paneRef = useRef()
  const headRef = useRef()
  usePane('apps', paneRef, headRef)
  const [query, setQuery] = useState('')
  const [refresh, setRefresh] = useState(0)
  return (
    <div
      ref={paneRef}
      className='apane'
      css={css`
        position: absolute;
        top: 20px;
        left: 20px;
        width: 540px;
        background: rgba(22, 22, 28, 1);
        border: 1px solid rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        box-shadow: rgba(0, 0, 0, 0.5) 0px 10px 30px;
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        .apane-head {
          height: 50px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          padding: 0 13px 0 20px;
          &-title {
            padding-left: 7px;
            font-weight: 500;
            flex: 1;
          }
          &-search {
            width: 150px;
            display: flex;
            align-items: center;
            svg {
              margin-right: 5px;
            }
            input {
              flex: 1;
              font-size: 14px;
            }
          }
          &-btn {
            width: 30px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.5);
            &:hover {
              cursor: pointer;
              color: white;
            }
          }
        }
      `}
    >
      <div className='apane-head' ref={headRef}>
        <ZapIcon size={16} />
        <div className='apane-head-title'>Apps</div>
        <div className='apane-head-search'>
          <SearchIcon size={16} />
          <input type='text' placeholder='Search' value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className='apane-head-btn' onClick={() => setRefresh(n => n + 1)}>
          <RotateCcwIcon size={16} />
        </div>
        <div className='apane-head-btn' onClick={close}>
          <XIcon size={20} />
        </div>
      </div>
      <AppsPaneContent world={world} query={query} refresh={refresh} />
    </div>
  )
}

function AppsPaneContent({ world, query, refresh }) {
  const [sort, setSort] = useState('created_at')
  const [asc, setAsc] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMarketplace, setShowMarketplace] = useState(false)

  useEffect(() => {
    async function fetchMarketplaceItems() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('marketplace')
          .select(`
            listing_id,
            price,
            created_at,
            status,
            assets (
              asset_id,
              type,
              file_url,
              quality
            ),
            users (
              username
            )
          `)
          .eq('status', 'active')

        if (error) throw error

        const formattedItems = data.map(item => ({
          id: item.listing_id,
          name: item.assets?.file_url.split('/').pop() || 'Unnamed Asset',
          price: item.price,
          type: item.assets?.type || 'unknown',
          quality: item.assets?.quality || 'unknown',
          seller: item.users?.username || 'Unknown Seller',
          created_at: item.created_at
        }))

        setItems(formattedItems)
      } catch (error) {
        console.error('Error fetching marketplace items:', error)
      } finally {
        setLoading(false)
      }
    }

    if (showMarketplace) {
      fetchMarketplaceItems()
    }
  }, [refresh, showMarketplace])

  const filteredItems = useMemo(() => {
    let filtered = items
    if (query) {
      query = query.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.seller.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      )
    }
    return orderBy(filtered, sort, asc ? 'asc' : 'desc')
  }, [items, sort, asc, query])

  const reorder = key => {
    if (sort === key) {
      setAsc(!asc)
    } else {
      setSort(key)
      setAsc(false)
    }
  }

  const toggleMarketplace = () => {
    setShowMarketplace(!showMarketplace)
    if (!showMarketplace) {
      world.toast('Opening marketplace...')
    }
  }

  return (
    <div
      className='asettings'
      css={css`
        flex: 1;
        padding: 20px 20px 0;
        overflow-y: auto;
        .asettings-head {
          position: sticky;
          top: 0;
          background: rgba(22, 22, 28, 1);
          display: flex;
          align-items: center;
          margin: 0 0 5px;
          padding-right: 10px;
        }
        .asettings-headitem {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          cursor: pointer;
          &:hover {
            color: white;
          }
          &.name {
            flex: 1;
          }
          &.type {
            width: 100px;
          }
          &.quality {
            width: 80px;
          }
          &.price {
            width: 80px;
            text-align: right;
          }
          &.seller {
            width: 120px;
          }
          &.date {
            width: 100px;
          }
        }
        .asettings-item {
          display: flex;
          align-items: center;
          padding: 5px 10px;
          border-radius: 5px;
          margin-bottom: 5px;
          &:hover {
            background: rgba(255, 255, 255, 0.05);
          }
          .name {
            flex: 1;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .type {
            width: 100px;
            text-transform: capitalize;
          }
          .quality {
            width: 80px;
            text-transform: capitalize;
          }
          .price {
            width: 80px;
            text-align: right;
          }
          .seller {
            width: 120px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .date {
            width: 100px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
          }
        }
      `}
    >
      <div className='asettings-head'>
        <div className='asettings-headitem' onClick={toggleMarketplace}>
          <ShoppingCartIcon size={16} style={{ marginRight: '8px' }} />
          Marketplace
        </div>
      </div>

      {showMarketplace && (
        <>
          <div className='asettings-head'>
            <div className='asettings-headitem name' onClick={() => reorder('name')}>Name</div>
            <div className='asettings-headitem type' onClick={() => reorder('type')}>Type</div>
            <div className='asettings-headitem quality' onClick={() => reorder('quality')}>Quality</div>
            <div className='asettings-headitem price' onClick={() => reorder('price')}>Price</div>
            <div className='asettings-headitem seller' onClick={() => reorder('seller')}>Seller</div>
            <div className='asettings-headitem date' onClick={() => reorder('created_at')}>Date</div>
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading marketplace items...</div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>No items found</div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className='asettings-item'>
                <div className='name'>{item.name}</div>
                <div className='type'>{item.type}</div>
                <div className='quality'>{item.quality}</div>
                <div className='price'>${item.price}</div>
                <div className='seller'>{item.seller}</div>
                <div className='date'>{new Date(item.created_at).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
