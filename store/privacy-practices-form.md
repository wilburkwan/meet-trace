# 「隱私權實務」分頁填寫內容

> 開發人員資訊主頁 → 你的項目 →「隱私權實務」（Privacy practices）。審核員會看這一頁，請照實填寫；以下內容可直接貼上（英文欄位審核較快）。

## 單一用途說明（Single purpose）
Meet Trace captures the live captions of Google Meet and Microsoft Teams meetings, translates them on-device with Chrome's built-in translator, and saves them locally as a meeting record. It can also read the transcript of a YouTube video the user is watching.

## 權限理由（Permission justification）

| 權限 | 貼上的說明 |
|---|---|
| `storage` | Saves the user's settings and meeting history (captions, translations, notes) locally in chrome.storage.local. |
| `unlimitedStorage` | Meeting history can grow beyond Chrome's default 10 MB local limit; the extension enforces its own 25 MB cap and lets users back up and delete old meetings. |
| `activeTab` | When the user opens the toolbar popup, it checks whether the current tab is a YouTube video or a meeting, so it can offer "Read transcript" or "Start Meet Trace here" for that tab only. |
| Host permission `https://meet.google.com/*` | Reads the meeting's caption text from the page and shows the floating caption/translation window inside Google Meet. |
| Content scripts on `teams.live.com`, `teams.microsoft.com`, `teams.cloud.microsoft` | Same as above, for Microsoft Teams on the web. |
| Content script on `www.youtube.com` | Opens and reads the video's "Show transcript" panel, only when the user clicks "Read transcript" in the popup. |

## 遠端程式碼（Remote code）
選 **否，我不使用遠端程式碼**（No, I am not using remote code）。
說明：All JavaScript is bundled in the package. No external scripts or eval are used.

## 資料使用（Data usage）
建議勾選：**網站內容（Website content）**。理由是擴充功能會讀取並在本機保存會議字幕；使用者按「用 ChatGPT 摘要」時，也會把內容帶到 chatgpt.com。

其餘類別（個人識別資訊、健康、財務、驗證資訊、個人通訊、位置、網頁瀏覽記錄、使用者活動）**都不要勾**。

下面三項聲明**全部勾選**：
- ☑ 不會將使用者資料出售或轉移給第三方（核准用途除外）
- ☑ 不會將使用者資料用於與單一用途無關的目的
- ☑ 不會將使用者資料用於判斷信用或放款

## 隱私權政策網址（Privacy policy URL）
```
https://github.com/wilburkwan/meet-trace/blob/main/store/privacy-policy.md
```
（程式碼推上 GitHub 之後，這個網址就能打開。）
