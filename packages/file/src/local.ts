let uploader: HTMLInputElement | null = null

export function getInputFile(opts?: HTMLInputElement) {
    return new Promise((resolve, reject) => {
        if (uploader) {
            uploader.remove()
            uploader = null
        }
        const id = opts?.id || 'jsk-file'
        document.getElementById(id)?.remove()
        
        uploader = document.createElement('input')
        Object.assign(uploader, opts)
        uploader.type = 'file'
        hiddenElement(uploader)

        uploader.onchange = function(e) {
            resolve(e)
            uploader?.remove()
        }
        uploader.click()
        document.body.appendChild(uploader)
    })
}

function hiddenElement(el: HTMLElement) {
    Object.assign(el.style, {
        opacity: '0',
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: '-1',
        top: '0',
    })
}