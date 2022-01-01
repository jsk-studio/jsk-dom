import { loadHTMLElement } from "./remote"

export async function fetchToObjectURL(url: string, opts?: RequestInit) {
    const resp = await fetch(url, opts)
    return URL.createObjectURL(await resp.blob())
}

export async function fetchToImage(url: string, opts?: RequestInit) {
    const imgUrl = await fetchToObjectURL(url, opts)
    const image = new Image()
    return await loadHTMLElement(image, imgUrl)
}

export async function fetchToJSON<T = any>(url: string, opts?: RequestInit) {
    const resp = await fetch(url, opts)
    return resp.json() as Promise<T>
}

export async function fetchToScript(url: string, opts?: RequestInit & { preload: boolean }) {
    const { preload = false, ...reqOpts } = opts || {} as RequestInit & { preload: boolean }
    const scriptUrl = await fetchToObjectURL(url, reqOpts)
    const script = document.createElement('script');
    const el = await loadHTMLElement(script, scriptUrl)
    if (!preload) {
        document.body.appendChild(el)
    }
    return el
}