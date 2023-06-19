// ==UserScript==
// @name        网易云音乐歌词推送
// @namespace   https://youthlin.com/
// @match       *://music.163.com/*
// @noframes    true
// @grant       GM.xmlHttpRequest
// @version     1.0
// @author      Youth．霖
// @description 需要保持播放列表打开状态。创建于 2023/5/19 16:41:26
// ==/UserScript==
(function () {
    'use strict';
    // https://github.com/youthlin/swiftbarlyrics

    setTimeout(() => {// 延迟 1s 启动
        console.log('网易云音乐歌词推送启动中...')

        function makeSureLyricsShow() {
            if (!document.querySelector('#g_playlist')) {// 确保播放列表开启
                document.querySelector('[data-action="panel"]')?.click();
            }
        }
        setInterval(makeSureLyricsShow, 1000)

        function send(data) {
            if (data.lyrics) {// 推送当前歌词
                GM.xmlHttpRequest({ // 需要 @grant GM.xmlHttpRequest 授权
                    method: "GET",
                    url: `http://localhost:51917/set?current=${encodeURI(data.lyrics)}`,
                });
            }
            if (data.title && data.by) {// 推送当前播放曲目 - 艺术家
                GM.xmlHttpRequest({ // 需要 @grant GM.xmlHttpRequest 授权
                    method: "GET",
                    url: `http://localhost:51917/set?title=${encodeURI(data.title)}&by=${encodeURI(data.by)}`,
                });
            }
        }

        function addTitleObserver() {// 监听播放曲目变动
            // 当前播放
            const title = document.querySelector('.words .name')?.innerText
            const by = document.querySelector('.words .by')?.innerText
            if (title && by) {
                console.log('当前播放', title, by)
                send({ title, by })
            }
            // 监听后续变动
            new MutationObserver(records => {
                for (let record of records) {
                    let title = ''
                    let by = ''
                    for (let node of record.addedNodes) {
                        if (node.classList?.contains('name')) {
                            title = node.innerText
                        }
                        if (node.classList?.contains('by')) {
                            by = node.innerText
                        }
                    }
                    console.log(`检测到切歌 ${title} - ${by}`)
                    send({ title, by })
                }
            }).observe(document.querySelector('.words'), {
                childList: true,
                characterData: true,// node 的文本内容变动
            })
        }

        let foundLyricsNode = false
        function addLyricsObserver() {// 监听歌词变动
            if (foundLyricsNode) return
            const node = document.querySelector('.listlyric');
            if (node) {
                let last = '';
                new MutationObserver(records => {
                    for (let record of records) {
                        if (record.target.classList.contains('z-sel')) {
                            const lyrics = record.target.innerText
                            if (lyrics != last) {
                                last = lyrics
                                console.log(lyrics)
                                send({ lyrics })
                            }
                            break
                        }
                    }
                }).observe(node, {
                    childList: true,  // 直接子节点
                    subtree: true,    // 所有后代
                    attributes: true, // 属性
                    attributeFilter: ['class'],
                })
                foundLyricsNode = true
                addTitleObserver()
                console.log('歌词监听节点:', node)
            } else {
                console.log('歌词监听节点未找到 1s 后重试')
                setTimeout(addLyricsObserver, 1000)// 1s 后重试
            }
        }
        addLyricsObserver()

        // 切割控制
        function handleAction() {
            GM.xmlHttpRequest({
                method: "GET",
                url: `http://localhost:51917/action/get`,
                onerror: r => {
                    setTimeout(handleAction, 1000)
                },
                onloadend: r => {
                    const action = r.response.trim()
                    console.log(action)
                    switch (action) {
                        case 'nop': break;
                        case 'prev':
                            document.querySelector('a[data-action="prev"]')?.click()
                            break;
                        case 'toggle':
                            let node = document.querySelector('a[data-action="play"]')
                            if (!node) {
                                node = document.querySelector('a[data-action="pause"]')
                            }
                            console.log('toggle node', node)
                            if (node) {
                                node.click()
                            }
                            break;
                        case 'next':
                            document.querySelector('a[data-action="next"]')?.click()
                            break;
                    }
                    setTimeout(handleAction, 0)
                },
            });
        }
        handleAction()

        console.log('网易云音乐歌词推送已启动')
    }, 1000);
})()