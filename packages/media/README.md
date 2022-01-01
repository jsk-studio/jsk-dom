## for media players
1. 通过 `playAudioUrl` 进行简易播放功能, 返回值为 `HTMLAudioElement`
2. 若有浏览器首次播放时的兼容问题, 需要在点击事件前调用 `presetAudioPlayer`
3. 通过 `visibleMode` 设置浏览器切换时的后台播放状态