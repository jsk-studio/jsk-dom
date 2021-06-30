export function canvasReszie(cvs: HTMLCanvasElement, callback?: (resize?: boolean) => void) {
    const resizeCanvas = (e: any) => {
        const style = window.getComputedStyle(cvs)
        const height = parseInt(style.height.replace('px', ''))
        const width = parseInt(style.width.replace('px', ''))
        
        if (cvs.height !== height || cvs.width !== width) {
            cvs.height = height
            cvs.width = width
            callback?.(e === 'first' ? false : true)
        }
    }
    resizeCanvas('first')
    window.addEventListener('resize', resizeCanvas)
}

export function getImageContext(cvs: HTMLCanvasElement, img: HTMLImageElement) {
    const ctx = cvs.getContext('2d')!
    const box = [0, 0, cvs.width, cvs.height] as const
    const imgContain = containRect(...box, img.width, img.height);
    const imgContainRate = [imgContain.dw / img.width, imgContain.dh / img.height]
    const imgCover = coverRect(cvs.width, cvs.height, img.width, img.height)
    const imgCoverRate = [cvs.width / img.width, cvs.height / img.height]

    const presetPaths = (paths: number[][], dx: number, dy: number, rw: number, rh: number) => {
        ctx.beginPath()
        const [sx, sy] = paths[0] 
        ctx.moveTo(sx * rw + dx, sy * rh + dy);
        for (const [x, y] of paths.slice(1)) {
            ctx.lineTo(x * rw + dx, y * rh + dy);
        }
        ctx.closePath();
    }

    const drawContain = () => {
        ctx.drawImage(img, imgContain.dx, imgContain.dy, imgContain.dw, imgContain.dh);
    }
    const drawCover = () => {
        ctx.drawImage(img, imgCover.sx, imgCover.sy, imgCover.dw, imgCover.dh, 0, 0, cvs.width, cvs.height);
    }
    const presetContainPaths = (paths: number[][]) => {
        const [rw, rh] = imgContainRate
        presetPaths(paths, imgContain.dx, imgContain.dy, rw, rh)
    }
    const presetCoverPaths = (paths: number[][]) => {
        const [rw, rh] = imgCoverRate
        const r = Math.max(rw, rh)
        presetPaths(paths, -imgCover.sx * r, -imgCover.sy * r, r, r)
    }
    const getContainPoint = (point: number[]) => {
        const [rw, rh] = imgContainRate
        return [point[0] * rw + imgContain.dx, point[1] * rh + imgContain.dy]
    }
    const getCoverPoint = (point: number[]) => {
        const [rw, rh] = imgCoverRate
        const r = Math.max(rw, rh)
        return [point[0] * r, point[1] * r]
    }
    const contentBox = {
        rect: box,
        fillRect: () => {
            ctx.fillRect(...box)
        },
        strokeRect: () => {
            ctx.strokeRect(...box)
        },
        cleanRect: () => {
            ctx.clearRect(...box)
        },
    }

    return {
        box: contentBox,
        drawContain, 
        drawCover, 
        presetPaths,
        presetContainPaths,
        presetCoverPaths,
        getContainPoint,
        getCoverPoint,
    }
}

export function containRect(sx: number, sy: number, box_w: number, box_h:number, source_w: number, source_h: number){
    let dx = sx,
        dy = sy,
        dw = box_w,
        dh = box_h,
        source_r = source_w / source_h,
        box_r = box_w / box_h;

    if (box_r < source_r) {
        dh = source_h * dw / source_w;
        dy = sy + (box_h - dh) / 2;
    } else if(box_r > source_r) {
        dw = source_w * dh / source_h;
        dx = sx + (box_w - dw) / 2;
    }
    return { dx, dy, dw, dh }
}


export function coverRect(box_w: number, box_h:number, source_w: number, source_h: number){
    let sx = 0,
        sy = 0,
        dw = source_w,
        dh = source_h,
        source_r = source_w / source_h,
        box_r = box_w / box_h;

    if (box_r < source_r) {
        dw = box_w * dh / box_h
        sx = (source_w - dw) / 2
    } else if(box_r > source_r) {
        dh = box_h * dw / box_w
        sy = (source_h - dh) / 2
    }

    return { sx, sy, dw, dh }
}