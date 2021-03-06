
type IRequestScriptOptions = HTMLScriptElement & { timeout: number, preload: boolean }
export async function requestScript(url: string, opts ?: IRequestScriptOptions): Promise<HTMLScriptElement> {
    const { timeout, preload = false, ...reqOpts } = opts || {} as IRequestScriptOptions
    const script = document.createElement('script');
    Object.assign(script, reqOpts)
	const el = await loadHTMLElement(script, url, timeout)
    if (!preload) {
        document.body.appendChild(el)
    }
    return el
}

type IRequestImageOptions = HTMLImageElement & { timeout: number }
export function requestImage(url: string, opts ?: IRequestImageOptions ): Promise<HTMLImageElement> {
    const { timeout, ...reqOpts } = opts || {} as IRequestImageOptions
    const image = new Image()
    Object.assign(image, reqOpts)
    return loadHTMLElement(image, url)
}

type IRequestFileOptions = XMLHttpRequest & { timeout: number }
export function requestFile(url: string, opts?: IRequestFileOptions) {
    const { timeout, ...reqOpts } = opts || {} as IRequestFileOptions
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        Object.assign(xhr, reqOpts)
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function (data) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200){
                    resolve(data.currentTarget)
                } else {
                    console.log('Error json - XMLHttpRequest status: ' + xhr.status);
                }
            }
        };
        xhr.send();
        if (timeout) {
            setTimeout(() => reject(), timeout)
        }
    })
}

export function loadHTMLElement<T extends HTMLElement & { src: string }>(el: T, src: string, timeout?: number) {
    return new Promise<T>((resolve, reject) => {
        el.onload = () => {
            resolve(el)
        }
        el.onerror = reject
        el.src = src
        if (timeout) {
            setTimeout(() => reject(), timeout)
        }
    })
}

