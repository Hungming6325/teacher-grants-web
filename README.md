# Teacher Grants Web

校內教師獎補助與研究成果分析儀表板，使用 Next.js App Router 建置。

## 功能

- `/grants`：獎補助分析
- `/teaching`：教學精進分析
- `/papers`：論文發表分析
- `/projects`：計畫承接分析
- `/teachers`：教師聘任與研究成果分析

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
- `data/papers_112_114.csv`：論文發表資料
- `data/projects_112_114.csv`：計畫承接資料
- `data/teachers_114_2.csv`：教師聘任主資料
- `data/patent.csv`：專利資料
- `data/transfer.csv`：技術移轉資料

目前頁面採伺服器端直接讀取 `data/` 內的 CSV，再轉成畫面所需資料。
