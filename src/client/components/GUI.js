import { css } from '@firebolt-dev/css'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LayoutGridIcon,
  LoaderIcon,
  MessageCircleMoreIcon,
  MicIcon,
  SearchIcon,
  SendHorizonalIcon,
  SettingsIcon,
  StoreIcon,
  UnplugIcon,
  WifiOffIcon,
  ZapIcon,
  LogOutIcon,
  HomeIcon
} from 'lucide-react'
import moment from 'moment'
import * as THREE from 'three'

import { InspectPane } from './InspectPane'
import { CodePane } from './CodePane'
import { AvatarPane } from './AvatarPane'
import { AvatarSelectionPanel } from './AvatarSelectionPanel'
import { MarketplaceButton } from './MarketplaceButton'
import { LandingPageButton } from './LandingPageButton'
import MarketplacePane from './MarketplacePane'
import { useElemSize } from './useElemSize'
import { MouseLeftIcon } from './MouseLeftIcon'
import { MouseRightIcon } from './MouseRightIcon'
import { MouseWheelIcon } from './MouseWheelIcon'
import { buttons, propToLabel } from '../../core/extras/buttons'
import { cls } from '../utils'
import { hasRole } from '../../core/utils'
import { ControlPriorities } from '../../core/extras/ControlPriorities'
import { AppsPane } from './AppsPane'
import { SettingsPane } from './SettingsPane'
import { ErrorBoundary } from './ErrorBoundary'

export function GUI({ world, onExit, worldId }) {
  const [ref, width, height] = useElemSize()
  return (
    <ErrorBoundary>
      <div
        ref={ref}
        css={css`
          position: absolute;
          inset: 0;
        `}
      >
        {width > 0 && <Content world={world} width={width} height={height} onExit={onExit} worldId={worldId} />}
      </div>
    </ErrorBoundary>
  )
}

function Content({ world, width, height, onExit, worldId }) {
  const small = width < 600
  const [ready, setReady] = useState(false)
  const [player, setPlayer] = useState(() => world.entities.player)
  const [inspect, setInspect] = useState(null)
  const [code, setCode] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [disconnected, setDisconnected] = useState(false)
  const [settings, setSettings] = useState(false)
  const [apps, setApps] = useState(false)
  const [currentEmote, setCurrentEmote] = useState(null)
  const [currentSkybox, setCurrentSkybox] = useState('asset://day2.hdr')
  const [showEmoteMenu, setShowEmoteMenu] = useState(false)
  const [showMarketplace, setShowMarketplace] = useState(false)

  useEffect(() => {
    console.log('GUI: Setting up event listeners')
    
    const onReady = () => {
      console.log('GUI: World ready event received')
      setReady(true)
    }
    
    world.on('ready', onReady)
    world.on('player', setPlayer)
    world.on('inspect', setInspect)
    world.on('code', setCode)
    world.on('avatar', setAvatar)
    world.on('disconnect', setDisconnected)

    // Add control binding for B key to toggle emote menu
    const control = world.controls.bind({ priority: ControlPriorities.GUI })
    control.keyB.onPress = () => {
      setShowEmoteMenu(prev => !prev)
    }

    console.log('GUI: Event listeners set up')

    return () => {
      console.log('GUI: Cleaning up event listeners')
      world.off('ready', onReady)
      world.off('player', setPlayer)
      world.off('inspect', setInspect)
      world.off('code', setCode)
      world.off('avatar', setAvatar)
      world.off('disconnect', setDisconnected)
      control.release()
    }
  }, [])

  const handleSelectAvatar = (avatar) => {
    // Update the player's avatar directly
    const player = world.entities.player
    if (player) {
      // Update locally
      player.modify({ 
        avatar: `asset://${avatar.name}`, 
        sessionAvatar: null 
      })
      
      // Update for everyone
      world.network.send('entityModified', {
        id: player.data.id,
        avatar: `asset://${avatar.name}`
      })
    }
  }

  const handleSelectEmote = (emoteUrl) => {
    setCurrentEmote(emoteUrl)
    if (player) {
      // Use the emote directly since it's from the Emotes enum
      player.setEmote(emoteUrl)
    }
  }

  const handleSelectSkybox = (skybox) => {
    setCurrentSkybox(skybox.url)
    
    const sunDirection = new THREE.Vector3(-1, -2, -2).normalize()
    
    // Create or update the sky node
    const sky = world.entities.find(e => e.data.type === 'sky')
    if (sky) {
      // Update existing sky node using the proxy to ensure setters are called
      const proxy = sky.getProxy()
      proxy.hdr = skybox.url
      proxy.sunDirection = sunDirection
      proxy.sunIntensity = 1
      proxy.sunColor = '#ffffff'
    } else {
      // Create a new sky node with initial properties
      world.entities.add({
        type: 'sky',
        data: {
          hdr: skybox.url,
          sunDirection: sunDirection,
          sunIntensity: 1,
          sunColor: '#ffffff'
        }
      }, true)
    }
  }

  const handleShowLandingPage = () => {
    // Remove the skipLandingPage flag from localStorage
    localStorage.removeItem('skipLandingPage')
    // Reload the page to show the landing page
    window.location.reload()
  }

  return (
    <div
      css={css`
        position: absolute;
        inset: 0;
        pointer-events: none;
        user-select: none;
        & > * {
          pointer-events: auto;
        }
      `}
    >
      {/* Exit button */}
      <div
        css={css`
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1000;
        `}
      >
        <button
          onClick={onExit}
          css={css`
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
            &:hover {
              background: rgba(0, 0, 0, 0.7);
            }
          `}
        >
          <HomeIcon size={16} />
          Exit World
        </button>
      </div>
      
      {/* World ID indicator */}
      {worldId && (
        <div
          css={css`
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border-radius: 4px;
            padding: 8px 16px;
            font-size: 14px;
            z-index: 1000;
          `}
        >
          World: {worldId}
        </div>
      )}
      
      {ready && (
        <MarketplaceButton 
          onClick={() => {
            console.log('MarketplaceButton: Clicked')
            setShowMarketplace(!showMarketplace)
            world.toast.show('Opening marketplace...')
            
            // TODO: Add marketplace UI here
            console.log('showMarketplace:', !showMarketplace)
          }} 
        />
      )}
      
      {ready && (
        <LandingPageButton 
          onClick={handleShowLandingPage} 
        />
      )}
      
      {inspect && <InspectPane key={`inspect-${inspect.data.id}`} world={world} entity={inspect} />}
      {inspect && code && <CodePane key={`code-${inspect.data.id}`} world={world} entity={inspect} />}
      {avatar && <AvatarPane key={avatar.hash} world={world} info={avatar} />}
      {disconnected && <Disconnected />}
      {showMarketplace && <MarketplacePane world={world} onClose={() => setShowMarketplace(false)} />}
      <Reticle world={world} />
      {<Toast world={world} />}
      {ready && (
        <Side
          world={world}
          player={player}
          toggleSettings={() => setSettings(!settings)}
          toggleApps={() => setApps(!apps)}
        />
      )}
      {settings && <SettingsPane world={world} player={player} close={() => setSettings(false)} />}
      {apps && <AppsPane world={world} close={() => setApps(false)} />}
      {!ready && <LoadingOverlay />}
      
      {/* Show emote menu when toggled */}
      {showEmoteMenu && (
        <AvatarSelectionPanel 
          onSelectAvatar={handleSelectAvatar}
          onSelectEmote={handleSelectEmote}
          onSelectSkybox={handleSelectSkybox}
          currentEmote={currentEmote}
          currentSkybox={currentSkybox}
          defaultTab="emotes"
        />
      )}
    </div>
  )
}

function Side({ world, player, toggleSettings, toggleApps }) {
  const touch = useMemo(() => navigator.userAgent.match(/OculusBrowser|iPhone|iPad|iPod|Android/i), [])
  const inputRef = useRef()
  const [msg, setMsg] = useState('')
  const [chat, setChat] = useState(false)
  const canBuild = useMemo(() => {
    return player && hasRole(player.data.roles, 'admin', 'builder')
  }, [player])
  useEffect(() => {
    const control = world.controls.bind({ priority: ControlPriorities.GUI })
    control.enter.onPress = () => {
      if (!chat) setChat(true)
    }
    control.mouseLeft.onPress = () => {
      if (control.pointer.locked && chat) {
        setChat(false)
      }
    }
    return () => control.release()
  }, [chat])
  useEffect(() => {
    if (chat) {
      inputRef.current.focus()
    } else {
      inputRef.current.blur()
    }
  }, [chat])
  const send = async e => {
    if (world.controls.pointer.locked) {
      setTimeout(() => setChat(false), 10)
    }
    if (!msg) {
      e.preventDefault()
      return setChat(false)
    }
    setMsg('')
    // check for client commands
    if (msg.startsWith('/')) {
      const [cmd, arg1, arg2] = msg.slice(1).split(' ')
      if (cmd === 'stats') {
        world.stats.toggle()
        return
      }
    }
    // otherwise post it
    const player = world.entities.player
    const data = {
      id: uuid(),
      from: player.data.name,
      fromId: player.data.id,
      body: msg,
      createdAt: moment().toISOString(),
    }
    world.chat.add(data, true)
  }
  return (
    <div
      className='side'
      css={css`
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 100%;
        max-width: 340px;
        padding: 40px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        @media all and (max-width: 700px) {
          max-width: 320px;
          padding: 20px;
        }
        .side-gap {
          flex: 1;
        }
        .bar {
          height: 50px;
          display: flex;
          align-items: stretch;
        }
        .bar-btns {
          pointer-events: auto;
          border-radius: 25px;
          /* background: rgba(22, 22, 28, 1);
          border: 1px solid rgba(255, 255, 255, 0.03);
          box-shadow: rgba(0, 0, 0, 0.5) 0px 10px 30px; */
          background: rgba(22, 22, 28, 0.4);
          backdrop-filter: blur(3px);
          display: none;
          align-items: center;
          &.active {
            display: flex;
          }
        }
        .bar-btn {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          &.darken {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 25px;
          }
          &-vr {
            font-weight: 450;
          }
          &:hover {
            cursor: pointer;
          }
        }
        .bar-chat {
          flex: 1;
          pointer-events: auto;
          padding: 0 0 0 16px;
          border-radius: 25px;
          /* background: rgba(22, 22, 28, 1);
          border: 1px solid rgba(255, 255, 255, 0.03);
          box-shadow: rgba(0, 0, 0, 0.5) 0px 10px 30px; */
          background: rgba(22, 22, 28, 0.4);
          backdrop-filter: blur(3px);
          display: none;
          align-items: center;
          &.active {
            display: flex;
          }
          &-input {
            flex: 1;
            &::placeholder {
              color: #c8c8c8;
            }
          }
          &-send {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.3);
            &.active {
              color: white;
            }
          }
        }
      `}
    >
      {!touch && <Actions world={world} />}
      {touch && <div className='side-gap' />}
      <Messages world={world} active={chat} touch={touch} />
      <div className='bar'>
        <div className={cls('bar-btns', { active: !chat })}>
          <div className='bar-btn darken' onClick={() => setChat(true)}>
            <MessageCircleMoreIcon size={20} />
          </div>
          {world.xr.supportsVR && (
            <div className={'bar-btn'} onClick={() => world.xr.enter()}>
              <div className='bar-btn-vr'>VR</div>
            </div>
          )}
          {/* <div className='bar-btn' onClick={null}>
            <MicIcon size={20} />
          </div> */}
          {/* <div className='bar-btn' onClick={null}>
            <StoreIcon size={20} />
          </div> */}
          <div className='bar-btn' onClick={toggleSettings}>
            <SettingsIcon size={20} />
          </div>
          {canBuild && (
            <div className='bar-btn' onClick={toggleApps}>
              <ZapIcon size={20} />
            </div>
          )}
        </div>
        <label className={cls('bar-chat', { active: chat })}>
          <input
            ref={inputRef}
            className='bar-chat-input'
            type='text'
            placeholder='Say something'
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => {
              if (e.code === 'Escape') {
                setChat(false)
              }
              if (e.code === 'Enter') {
                send(e)
              }
            }}
            onBlur={() => setChat(false)}
          />
          <div className={cls('bar-chat-send', { active: msg })}>
            <SendHorizonalIcon size={20} />
          </div>
        </label>
      </div>
    </div>
  )
}

function Messages({ world, active, touch }) {
  const MESSAGES_REFRESH_RATE = 30 // every x seconds
  const initRef = useRef()
  const contentRef = useRef()
  const spacerRef = useRef()
  const [now, setNow] = useState(() => moment())
  const [msgs, setMsgs] = useState([])
  useEffect(() => {
    return world.chat.subscribe(setMsgs)
  }, [])
  useEffect(() => {
    let timerId
    const updateNow = () => {
      setNow(moment())
      timerId = setTimeout(updateNow, MESSAGES_REFRESH_RATE * 1000)
    }
    timerId = setTimeout(updateNow, MESSAGES_REFRESH_RATE * 1000)
    return () => clearTimeout(timerId)
  }, [])
  useEffect(() => {
    if (!msgs.length) return
    const didInit = !initRef.current
    if (didInit) {
      spacerRef.current.style.height = contentRef.current.offsetHeight + 'px'
    }
    setTimeout(() => {
      contentRef.current.scroll({
        top: 9999999,
        behavior: didInit ? 'instant' : 'smooth',
      })
    }, 10)
    initRef.current = true
  }, [msgs])
  return (
    <div
      ref={contentRef}
      className={cls('messages noscrollbar', { active })}
      css={css`
        padding: 0 8px 8px;
        margin-bottom: 20px;
        flex: 1;
        max-height: ${touch ? '100' : '250'}px;
        border-radius: 10px;
        transition: all 0.15s ease-out;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        overflow-y: auto;
        -webkit-mask-image: linear-gradient(to top, black calc(100% - 50px), black 50px, transparent);
        mask-image: linear-gradient(to top, black calc(100% - 50px), black 50px, transparent);
        &.active {
          pointer-events: auto;
        }
        .messages-spacer {
          flex-shrink: 0;
        }
        .message {
          padding: 4px 0;
          line-height: 1.4;
          font-size: 15px;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
          &-from {
            font-weight: 600;
            margin-right: 4px;
          }
          &-body {
            // ...
          }
        }
      `}
    >
      <div className='messages-spacer' ref={spacerRef} />
      {msgs.map(msg => (
        <Message key={msg.id} msg={msg} now={now} />
      ))}
    </div>
  )
}

function Message({ msg, now }) {
  const timeAgo = useMemo(() => {
    const createdAt = moment(msg.createdAt)
    const age = now.diff(createdAt, 'seconds')
    // up to 10s ago show now
    if (age < 10) return 'now'
    // under a minute show seconds
    if (age < 60) return `${age}s ago`
    // under an hour show minutes
    if (age < 3600) return Math.floor(age / 60) + 'm ago'
    // under a day show hours
    if (age < 86400) return Math.floor(age / 3600) + 'h ago'
    // otherwise show days
    return Math.floor(age / 86400) + 'd ago'
  }, [now])
  return (
    <div className='message'>
      {msg.from && <span className='message-from'>{msg.from}</span>}
      <span className='message-body'>{msg.body}</span>
      {/* <span>{timeAgo}</span> */}
    </div>
  )
}

function Disconnected() {
  return (
    <div
      css={css`
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(22, 22, 28, 1);
        border: 1px solid rgba(255, 255, 255, 0.03);
        box-shadow: rgba(0, 0, 0, 0.5) 0px 10px 30px;
        height: 40px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        padding: 0 14px 0 17px;
        svg {
          margin-left: 8px;
        }
        span {
          font-size: 14px;
        }
      `}
    >
      <span>Disconnected</span>
      <WifiOffIcon size={16} />
    </div>
  )
}

function LoadingOverlay() {
  return (
    <div
      css={css`
        position: absolute;
        inset: 0;
        background: black;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        svg {
          animation: spin 1s linear infinite;
        }
      `}
    >
      <LoaderIcon size={30} />
    </div>
  )
}

function Actions({ world }) {
  const [actions, setActions] = useState(() => world.controls.actions)
  useEffect(() => {
    world.on('actions', setActions)
    return () => world.off('actions', setActions)
  }, [])

  return (
    <div
      className='actions'
      css={css`
        padding-left: 8px;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .actions-item {
          display: flex;
          align-items: center;
          margin: 0 0 8px;
          &-icon {
            // ...
          }
          &-label {
            margin-left: 10px;
            font-weight: 500;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
          }
        }
      `}
    >
      {actions.map(action => (
        <div className='actions-item' key={action.id}>
          <div className='actions-item-icon'>{getActionIcon(action.type)}</div>
          <div className='actions-item-label'>{action.label}</div>
        </div>
      ))}
    </div>
  )
}

function getActionIcon(type) {
  if (type === 'controlLeft') {
    return <ActionPill label='Ctrl' />
  }
  if (type === 'mouseLeft') {
    return <ActionIcon icon={MouseLeftIcon} />
  }
  if (type === 'mouseRight') {
    return <ActionIcon icon={MouseRightIcon} />
  }
  if (type === 'mouseWheel') {
    return <ActionIcon icon={MouseWheelIcon} />
  }
  if (buttons.has(type)) {
    return <ActionPill label={propToLabel[type]} />
  }
  return <ActionPill label='?' />
}

function ActionPill({ label }) {
  return (
    <div
      className='actionpill'
      css={css`
        border: 1.5px solid white;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.1);
        padding: 4px 6px;
        font-weight: 500;
        font-size: 14px;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      `}
    >
      {label}
    </div>
  )
}

function ActionIcon({ icon: Icon }) {
  return (
    <div
      className='actionicon'
      css={css`
        line-height: 0;
        svg {
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.8));
        }
      `}
    >
      <Icon />
    </div>
  )
}

function Reticle({ world }) {
  const [visible, setVisible] = useState(world.controls.pointer.locked)
  useEffect(() => {
    world.on('pointer-lock', setVisible)
    return () => world.off('pointer-lock', setVisible)
  }, [])
  if (!visible) return null
  return (
    <div
      className='reticle'
      css={css`
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        .reticle-item {
          width: 10px;
          height: 10px;
          border-radius: 5px;
          /* border: 1.5px solid rgba(255, 255, 255, 0.8); */
          border: 1.5px solid white;
          /* box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); */
          mix-blend-mode: difference;
        }
      `}
    >
      <div className='reticle-item' />
    </div>
  )
}

function Toast({ world }) {
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    let ids = 0
    const onToast = text => {
      setMsg({ text, id: ++ids })
    }
    world.on('toast', onToast)
    return () => world.off('toast', onToast)
  }, [])
  if (!msg) return null
  return (
    <div
      className='toast'
      css={css`
        position: absolute;
        top: calc(50% - 70px);
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .toast-msg {
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          background: rgba(22, 22, 28, 0.4);
          backdrop-filter: blur(3px);
          border-radius: 25px;
          opacity: 0;
          transform: translateY(10px) scale(0.9);
          transition: all 0.1s ease-in-out;
          &.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
            animation: toastIn 0.1s ease-in-out;
          }
        }
      `}
    >
      {msg && <ToastMsg key={msg.id} text={msg.text} />}
    </div>
  )
}

function ToastMsg({ text }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    setTimeout(() => setVisible(false), 1000)
  }, [])
  return <div className={cls('toast-msg', { visible })}>{text}</div>
}
