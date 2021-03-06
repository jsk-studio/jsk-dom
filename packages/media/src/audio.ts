import { xArray, xTypeOf } from "@jsk-std/x"
import { hiddenElement } from './utils'

type IAudioElementExtend = {
    stop?: () => void,
    onplayerror?: (e: any) => void,
}

let audioPlayer: HTMLAudioElement & IAudioElementExtend | null = null
let prepreload = false

function createMockEvent(name: string, opts?: any) {
    let mockEvent: undefined | CustomEvent | Event
    mockEvent = window.CustomEvent && new window.CustomEvent(name)
    if (!mockEvent) {
        mockEvent = document.createEvent && document.createEvent('Event');
        mockEvent.initEvent('ended', true, true)
    }
    return mockEvent
}

function stopPlayer() {
    const mockMediaEnd = createMockEvent('ended')
    if (audioPlayer && !audioPlayer.ended) {
        if (audioPlayer.onended) {
            audioPlayer.onended(mockMediaEnd)
        } else {
            audioPlayer.dispatchEvent(mockMediaEnd)
        }
    }
    if (audioPlayer) {
        audioPlayer.pause()
        audioPlayer.currentTime = 0.0
        audioPlayer = null
    }
}

type IReturnUrls = string | string[]
type IPlayUrls = IReturnUrls | (() => IReturnUrls) | (() => Promise<IReturnUrls> )

async function getUrls(url: IPlayUrls) {
    if (typeof url !== 'function') {
        return url
    }
    await preplayAudio()
    return await url()
}

export async function playAudioUrl(url: IPlayUrls, opts ?: HTMLAudioElement) {
    const urls = await getUrls(url)
    if (audioPlayer) {
        audioPlayer.stop!()
    }
    presetAudioPlayer(opts)
    if (!audioPlayer) {
        return
    }
    for (let i = 0; i < audioPlayer.children.length; i++) {
        const child = audioPlayer.children.item(i)!
        audioPlayer.removeChild(child)
    }
    for (const src of xArray(urls)) {
        const ms = document.createElement('source')
        ms.src = src
        ms.type = 'audio/mpeg'
        audioPlayer!.append(ms)
    }
    audioPlayer.load()
    audioPlayer.pause()
    audioPlayer?.play()
        .catch(e => {
            if (audioPlayer && audioPlayer.onplayerror) {
                audioPlayer.onplayerror(e)
            } else if (audioPlayer) {
                const mockPlayerror = createMockEvent('playerror')
                audioPlayer.dispatchEvent(mockPlayerror)
            }
        })

    return audioPlayer
}

export function getAudioPlayer() {
    return audioPlayer
}

// LEGACY: ????????? export api
export function preplayAudio() {
    return new Promise((resolve) => {
        if (audioPlayer && !prepreload) {
            audioPlayer.play()
                .then(resolve)
                .catch(resolve)

            audioPlayer.pause()
            audioPlayer.onerror = resolve
            audioPlayer.onabort = resolve
            prepreload = true
        }
        resolve(null)
    })
}

export type IPresetOptions = HTMLAudioElement & { 
    visibleMode?: 'stop' | 'pause' | 'suspend'
}

export function presetAudioPlayer(options ?: IPresetOptions) {
    const { visibleMode, ...opts } = options || {} as IPresetOptions
    const id = opts.id || 'jsk-audio'
    audioPlayer = document.getElementById(id) as HTMLAudioElement
    if (audioPlayer) {
        Object.assign(audioPlayer, opts)
        return
    }
    audioPlayer = document.createElement('audio')
    audioPlayer.controls = false
    audioPlayer.preload = 'auto'
    audioPlayer.id = id
    Object.assign(audioPlayer, opts)
    hiddenElement(audioPlayer)
    audioPlayer.constructor.prototype.stop = stopPlayer
    document.body.appendChild(audioPlayer)

    const ms = document.createElement('source')
    ms.type = 'audio/mpeg'
    audioPlayer!.append(ms)

    if (visibleMode) {
        document.addEventListener('visibilitychange', () => {
            if (visibleMode === 'stop') {
                audioPlayer?.stop!()
            } else if (visibleMode === 'pause') {
                audioPlayer?.pause()
            } else if (visibleMode == 'suspend') {
                } if (document.visibilityState === 'visible') {
                    audioPlayer?.play();
                } else {
                    audioPlayer?.pause();
                }
        })
    }
}

