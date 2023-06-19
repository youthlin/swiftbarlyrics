# swiftbarlyrics
[Mac]网易云音乐网页版歌词显示到菜单栏

迁移自 [Gist](https://gist.github.com/youthlin/be34fa9bb50b37ac39aa0ce59265632b)

```sh
# 安装菜单栏自定义显示工具，打开后设置一个插件目录
brew install swiftbar
# 下载启动 歌词推送服务器
# go install github.com/youthlin/swiftbarlyrics@latest # 源码安装
# 或直接下载可执行二进制文件
open https://raw.githubusercontent.com/youthlin/swiftbarlyrics/main/swiftbarlyrics
# 启动
nohup swiftbarlyrics > ~/lyrics.log &
# 下载 油猴脚本-推送歌词到歌词服务器
open https://raw.githubusercontent.com/youthlin/swiftbarlyrics/main/lyrics.user.js
# 下载 Swiftbar 插件到设置好的目录
open https://raw.githubusercontent.com/youthlin/swiftbarlyrics/main/lyrics.sh
```

---

PS: [Web Scrobbler](https://web-scrobbler.com/) 一个浏览器插件，支持将网页中正在播放的音乐提交到 [Last.fm](https://www.last.fm/).
(Web Scrobbler 在 Edge 商店版本审核较慢，推荐从 Chrome 商店下载。当然它也支持 Firefox.)
