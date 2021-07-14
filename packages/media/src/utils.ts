import { xTransfer } from "@jsk-std/x"

export function hiddenElement(el: HTMLElement) {
    xTransfer(el.style, {
        opacity: '0',
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: '-1',
        top: '0',
    })
}
