# Teacher Grants Web

校內教師獎補助與期刊論文分析儀表板，使用 Next.js App Router 建置。

## 功能

- `/`：教師獎補助分析
- `/papers`：期刊論文發表概況

## 開發

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看畫面。

## 專案結構

```text
app/                    路由頁面
src/components/         儀表板、圖表、共用 UI 元件
src/lib/                CSV 解析、統計與資料載入
src/types/              型別定義
data/                   原始資料檔
```

## 資料檔

- `data/grants_112_114.csv`：獎補助資料
- `data/teaching_awards_114_115.csv`：教學精進資料
- `data/papers_112_114.csv`：期刊論文資料
- `data/projects_112_114.csv`：計畫承接資料
- `data/teachers_114_2.csv`：教師聘任資料
- `data/patient.csv`、`data/transfer.csv`：論文頁研究資產資料

目前頁面採伺服器端直接讀取 `data/` 內的 CSV，再轉成畫面所需資料。
