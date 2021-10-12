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
    const urls = url()
    if (xTypeOf(urls, 'promise')) {
        return await urls
    }
    return urls
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
        resolve(1)
    })
}

export type IPresetOptions = HTMLAudioElement & { autopause?: boolean }

export function presetAudioPlayer(options ?: IPresetOptions) {
    const { autopause, ...opts } = options || {} as IPresetOptions
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

    if (autopause) {
         document.addEventListener('visibilitychange', () => {
            audioPlayer?.stop!()
        })
    }
}

