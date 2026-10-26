# Front-end

貨比三家 × PChome DEMO 前端，來源為本機「作業/app/static」。

## 檔案

- `index.html`：搜尋表單、資料庫紀錄選單、結果區與分頁。
- `style.css`：頁面樣式與手機排版。
- `script.js`：呼叫後端 API、顯示商品與歷史紀錄，每頁顯示 10 筆。

## 功能

搜尋時最多要求抓取 PChome 100 個來源頁面，實際筆數依來源回應而定。歷史紀錄由後端 SQLite 查詢取得。

## 執行需求

本 repo 只有前端，不包含 Python 爬蟲、SQLite 資料庫或後端啟動程式。GitHub 上傳成功不代表網站已部署。直接開啟 HTML 或僅部署 GitHub Pages，無法使用搜尋與歷史查詢。

前端使用同來源 API：

- `GET /api/products?keyword=滑鼠&max_pages=100`
- `GET /api/history`
- `GET /api/history/{search_id}`

使用既有「作業」FastAPI 後端時，可將這三個檔案放入其 `app/static`，並把 HTML 的 CSS/JS 引用調整為 `/static/style.css` 與 `/static/script.js`。啟動後端後透過 `http://127.0.0.1:8010` 使用。

HTML 以相對路徑載入 CSS/JS，方便獨立檢視畫面；API 仍需由同一來源提供。未上傳本機虛擬環境、資料庫或搜尋結果檔。
