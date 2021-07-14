import { xArray, xTransfer } from "@jsk-std/x"
import { hiddenElement } from './utils'

type IAudioElementExtend = {
    stop?: () => void
}

let audioPlayer: HTMLAudioElement & IAudioElementExtend | null = null

function stopPlayer() {
    let MockMediaEnded: undefined | CustomEvent | Event
    MockMediaEnded = window.CustomEvent && new window.CustomEvent('ended')
    if (!MockMediaEnded) {
        MockMediaEnded = document.createEvent && document.createEvent('Event');
        MockMediaEnded.initEvent('ended', true, true)
    }
    if (audioPlayer && !audioPlayer.ended) {
        if (MockMediaEnded) {
            audioPlayer.dispatchEvent(MockMediaEnded)
        } else if (audioPlayer.duration) {
            audioPlayer.currentTime = audioPlayer.duration
        }
        if (audioPlayer) {
            audioPlayer.remove()
        }
        audioPlayer = null
    }
}

export function playAudioUrl(url: string | string[], opts ?: HTMLAudioElement) {
    if (audioPlayer) {
        audioPlayer.stop!()
        audioPlayer = null
    }
    const id = opts?.id || 'jsk-audio'
    document.getElementById(id)?.remove()

    audioPlayer = document.createElement('audio')
    audioPlayer.preload = 'auto'
    audioPlayer.controls = false
    audioPlayer.id = id

    for (const src of xArray(url)) {
        const ms = document.createElement('source')
        ms.src = src
        ms.type = 'audio/mpeg'
        audioPlayer.append(ms)
    }
    xTransfer(audioPlayer, opts)
    hiddenElement(audioPlayer)
    document.body.appendChild(audioPlayer)
    audioPlayer.play()
    audioPlayer.constructor.prototype.stop = stopPlayer
    return audioPlayer
}

export function getAudioPlayer() {
    return audioPlayer
}

