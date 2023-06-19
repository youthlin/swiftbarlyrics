#!/usr/bin/env bash
# <bitbar.title>网易云音乐网页版歌词显示</bitbar.title>
# <bitbar.version>v1.1</bitbar.version>
# <bitbar.author>Youth．霖</bitbar.author>
# <bitbar.author.github>youthlin</bitbar.author.github>
# <bitbar.desc>网易云音乐网页版歌词显示</bitbar.desc>
# <bitbar.abouturl>https://gist.github.com/youthlin/be34fa9bb50b37ac39aa0ce59265632b/</bitbar.abouturl>
# <bitbar.droptypes>Supported UTI's for dropping things on menu bar</bitbar.droptypes>
# <swiftbar.runInBash>false</swiftbar.runInBash>
# <swiftbar.hideRunInTerminal>true</swiftbar.hideRunInTerminal>
# <swiftbar.hideLastUpdated>true</swiftbar.hideLastUpdated>
# <swiftbar.hideDisablePlugin>true</swiftbar.hideDisablePlugin>
# <swiftbar.type>streamable</swiftbar.type>

# 如果带参数 就执行动作 通过menu生成的菜单 点击时触发
if [[ "$1" = "action" ]]; then
    # 发送控制指令
    curl http://localhost:51917/action/send?action=$2 >/dev/null 2>&1
    exit
fi

menu() { # 输出菜单
    echo "上一曲    | terminal=false bash=$0 param0=action param1=prev"
    echo "暂停/播放 | terminal=false bash=$0 param0=action param1=toggle"
    echo "下一曲    | terminal=false bash=$0 param0=action param1=next"
}

refresh() { # 更新歌词
    # 服务器总是以 ~~~ 开头 10s超时
    curl http://localhost:51917/next 2>/dev/null && menu # 输出歌词、曲名、艺术家
    # 如果输出歌词成功 补充菜单
}

fallback() {   # 如果更新歌词失败
    echo '~~~' # 刷新
    echo '歌词推送服务器未启动'
    sleep 1 # 1s后重试(外层调用时死循环)
}

echo '~~~'
echo '播放以显示歌词'
menu

while true; do
    # streamable 表示该脚本会不断输出 遇到 ~~~ 表示刷新
    refresh || fallback
done
