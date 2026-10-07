# Meet Trace 上架資料包

上架 Chrome 線上應用程式商店需要的所有檔案都在這個資料夾。

## 📦 檔案清單

| 檔案 | 用途 | 上傳到哪裡 |
|---|---|---|
| `meet-trace-1.0.0-chrome.zip` | 擴充功能本體（已壓縮，附 LICENSE） | 「套件」→ 上傳新套件 |
| `images/store-icon-128.png` | 商店圖示 128×128 | 商店資訊 → 商店圖示 |
| `images/screenshot-1-live-translation.png` | 截圖：會議中即時翻譯 | 商店資訊 → 螢幕擷取畫面 |
| `images/screenshot-2-settings.png` | 截圖：設定頁 | 同上 |
| `images/screenshot-3-history.png` | 截圖：會議紀錄 | 同上 |
| `images/screenshot-4-transcript.png` | 截圖：原文譯文對照 | 同上 |
| `images/screenshot-5-youtube.png` | 截圖：YouTube 逐字稿 | 同上 |
| `images/promo-small-440x280.png` | 小型宣傳圖塊 440×280 | 商店資訊 → 宣傳圖片 |
| `images/promo-marquee-1400x560.png` | 大型宣傳橫幅 1400×560（選填） | 商店資訊 → 宣傳圖片 |
| `listing-zh-TW.md` | 繁中名稱、簡短說明、詳細說明 | 商店資訊（中文） |
| `listing-en.md` | 英文版說明 | 商店資訊（新增英文語言） |
| `privacy-practices-form.md` | 單一用途、權限理由、資料使用 | 隱私權實務 |
| `privacy-policy.md` | 隱私權政策全文（中英） | 用 GitHub 網址填入隱私權政策欄位 |

## 🚀 上架步驟

1. **註冊開發人員帳號**：到 https://chrome.google.com/webstore/devconsole ，用 Google 帳號登入，支付一次性註冊費 US$5，並完成身分驗證。
2. **新增項目**：按「新增項目」，上傳 `meet-trace-1.0.0-chrome.zip`。
3. **商店資訊**：
   - 從 `listing-zh-TW.md` 複製簡短說明、詳細說明，類別選「生產力 › 溝通」。
   - 上傳商店圖示、5 張截圖、小型宣傳圖塊（大型橫幅選填）。
   - 想讓外國用戶看到英文，再新增「English」語言，貼上 `listing-en.md`。
4. **隱私權實務**：依 `privacy-practices-form.md` 逐欄貼上；隱私權政策網址填 GitHub 上的 `privacy-policy.md`。
5. **發佈範圍**：建議第一次選「不公開（Unlisted）」，只有拿到連結的人能安裝，自己測一輪沒問題再改「公開」。
6. **提交審核**：按「提交審核」。通常幾天內會有結果，期間可在主頁看到狀態。

## ✅ 提交前檢查

- [ ] 用 `.output/chrome-mv3` 載入未封裝版本，在**真正的** Google Meet、Teams 網頁版、YouTube 各測一次
- [ ] 設定頁下載翻譯模型 → 會議中打開翻譯，確認譯文正常
- [ ] 自動開啟字幕在 Meet 與 Teams 都能運作
- [ ] 會議紀錄、匯出、備份還原正常
- [ ] `package.json` 的 `author` 欄位填上你的名字（目前空白）
- [ ] 確認 GitHub 上的隱私權政策網址打得開

## 🔄 之後更新版本

1. 把 `package.json` 的 `version` 加一號，例如 `1.0.0` → `1.0.1`
2. 重新打包（`pnpm zip`），在主頁「套件」上傳新的 zip，再提交審核

## ⚠️ 審核可能被問到的地方

- **名稱含「Meet」**：說明中已加上「與 Google、Microsoft、YouTube 無關」的聲明。若仍被要求修改，可改成例如「MeetTrace」或「Trace」。
- **權限**：每個權限的用途都已寫在 `privacy-practices-form.md`，照抄即可。
