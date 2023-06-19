package main

import (
	"fmt"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

func main() {
	type Client struct {
		ID string
		Ch chan string
	}
	var (
		nextID   = atomic.Int64{}
		title    = ""         // 标题
		by       = ""         // 艺术家
		clients  = sync.Map{} // 读取端 string -> *Client
		actionCh = make(chan string, 1)
	)

	// 动作指令
	http.HandleFunc("/action/send", func(w http.ResponseWriter, r *http.Request) {
		var q = r.URL.Query()
		var action = q.Get("action")
		fmt.Printf(">> action = %v\n", action)
		select {
		case actionCh <- action:
		default:
		}
	})

	http.HandleFunc("/action/get", func(w http.ResponseWriter, r *http.Request) {
		var action = "nop"
		select {
		case action = <-actionCh:
		case <-time.After(10 * time.Second): // 10s 超时
		}
		fmt.Fprintln(w, action)
	})

	// 接收推送的歌词
	http.HandleFunc("/set", func(w http.ResponseWriter, r *http.Request) {
		var q = r.URL.Query()
		if q.Has("title") { // 标题
			title = q.Get("title")
			by = q.Get("by")
			fmt.Println()
			fmt.Println()
			fmt.Println(title + " - " + by)
			fmt.Println()
		}
		if q.Has("current") { // 歌词
			var lyrics = r.URL.Query().Get("current")
			lyrics = strings.TrimSpace(lyrics)
			fmt.Println(lyrics)
			clients.Range(func(_, value any) bool { // 推送给所有的读取端
				client := value.(*Client)
				select {
				case client.Ch <- lyrics:
				default: // 推送失败忽略
				}
				return true
			})
		}
	})

	// 获取当前歌词
	http.HandleFunc("/next", func(w http.ResponseWriter, r *http.Request) {
		var (
			lyrics = ""
			client = &Client{
				ID: fmt.Sprintf("%d", nextID.Add(1)),
				Ch: make(chan string, 1),
			}
		)
		clients.Store(client.ID, client)
		defer func() {
			clients.Delete(client.ID)
		}()

		select {
		case lyrics = <-client.Ch: // 获取歌词
		case <-time.After(10 * time.Second): // 10s 超时
		}

		fmt.Fprintln(w, "~~~") // 提醒 Swiftbar 刷新内容
		if lyrics != "" {      // 拿到了歌词就输出
			fmt.Fprintln(w, lyrics)
			if title != "" { // 如果有标题一起输出 点击歌词可以看到
				fmt.Fprintln(w, "---")
				fmt.Fprintln(w, title)
				fmt.Fprintln(w, by)
			}
		} else { // 超时了
			if title != "" {
				fmt.Fprintln(w, title+" - "+by)
			} else {
				fmt.Fprintln(w, "未在播放")
			}
		}
	})

	fmt.Printf("服务已启动\n")
	http.ListenAndServe(":51917", nil)
}

func log(format string, args ...any) {
	fmt.Printf(format+"\n", args...)
}
