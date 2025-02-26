import { css } from '@firebolt-dev/css'
import { useEffect, useRef, useState } from 'react'
import { UserIcon, XIcon } from 'lucide-react'

import { usePane } from './usePane'
import { AvatarPreview } from '../AvatarPreview'
import { AvatarSelectionPanel } from './AvatarSelectionPanel'

export function AvatarPane({ world, info }) {
  const paneRef = useRef()
  const headRef = useRef()
  const viewportRef = useRef()
  const previewRef = useRef()
  const [stats, setStats] = useState(null)
  const [currentEmote, setCurrentEmote] = useState(null)
  const [currentSkybox, setCurrentSkybox] = useState(null)
  const [error, setError] = useState(null)
  usePane('avatar', paneRef, headRef)

  useEffect(() => {
    const viewport = viewportRef.current
    const preview = new AvatarPreview(world, viewport)
    previewRef.current = preview
    preview.load(info.file, info.url).then(stats => {
      setStats(stats)
      setError(null)
    }).catch(err => {
      console.error('Failed to load avatar:', err)
      setError('Failed to load avatar. Please try another one.')
    })
    return () => preview.destroy()
  }, [])

  const handleSelectAvatar = (avatar) => {
    setError(null)
    if (previewRef.current) {
      previewRef.current.load(null, avatar.url).then(stats => {
        setStats(stats)
      }).catch(err => {
        console.error('Failed to load avatar:', err)
        setError('Failed to load avatar. Please try another one.')
      })
    }
  }

  const handleSelectEmote = (emote) => {
    setCurrentEmote(emote)
    if (previewRef.current?.node?.instance) {
      try {
        previewRef.current.node.instance.setEmote(emote)
      } catch (err) {
        console.error('Failed to set emote:', err)
      }
    }
  }

  const handleSelectSkybox = (skybox) => {
    setCurrentSkybox(skybox.id)
    if (previewRef.current?.scene) {
      try {
        previewRef.current.world.loader.load('hdr', skybox.url).then(texture => {
          if (previewRef.current?.scene) {
            texture.mapping = THREE.EquirectangularReflectionMapping
            previewRef.current.scene.environment = texture
          }
        }).catch(err => {
          console.error('Failed to load skybox:', err)
        })
      } catch (err) {
        console.error('Failed to set skybox:', err)
      }
    }
  }

  return (
    <>
      <div
        ref={paneRef}
        className='vpane'
        css={css`
          position: absolute;
          top: 20px;
          left: 20px;
          width: 320px;
          background: rgba(22, 22, 28, 1);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          box-shadow: rgba(0, 0, 0, 0.5) 0px 10px 30px;
          pointer-events: auto;
          display: flex;
          flex-direction: column;
          
          .vpane-head {
            height: 50px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            padding: 0 7px 0 20px;
            &-title {
              padding-left: 7px;
              font-weight: 500;
              flex: 1;
            }
            &-close {
              width: 40px;
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
          .vpane-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
          }
          .vpane-viewport {
            height: 300px;
            background: #1f1f2a;
            border-radius: 10px;
            overflow: hidden;
            margin: 0 0 20px;
          }
          .vpane-actions {
            display: flex;
            gap: 10px;
          }
          .vpane-action {
            flex-basis: 50%;
            background: #252630;
            border-radius: 10px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            cursor: pointer;
            
            &:hover {
              background: #2a2b36;
            }
          }
          .vpane-error {
            color: #ff4444;
            margin: -10px 0 15px;
            font-size: 14px;
            text-align: center;
          }
        `}
      >
        <div className='vpane-head' ref={headRef}>
          <UserIcon size={16} />
          <div className='vpane-head-title'>Avatar</div>
          <div className='vpane-head-close' onClick={() => world.emit('avatar', null)}>
            <XIcon size={20} />
          </div>
        </div>
        <div className='vpane-content noscrollbar'>
          <div className='vpane-viewport' ref={viewportRef} />
          {error && (
            <div className='vpane-error'>
              {error}
            </div>
          )}
          <div className='vpane-actions'>
            <div className='vpane-action' onClick={info.onEquip}>
              <span>Equip</span>
            </div>
            <div className='vpane-action' onClick={info.onPlace}>
              <span>Place</span>
            </div>
          </div>
        </div>
      </div>
      
      <AvatarSelectionPanel 
        onSelectAvatar={handleSelectAvatar}
        onSelectEmote={handleSelectEmote}
        onSelectSkybox={handleSelectSkybox}
        currentEmote={currentEmote}
        currentSkybox={currentSkybox}
      />
    </>
  )
}
