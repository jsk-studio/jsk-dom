
export function hiddenElement(el: HTMLElement) {
    Object.assign(el.style, {
        opacity: '0',
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: '-1',
        top: '0',
    })
}
