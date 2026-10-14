# Aris 網站書架

正式入口： https://arislee1979-afk.github.io/

**全部網頁清單： https://arislee1979-afk.github.io/pages/**

首頁沿用 Homer v26.08.3，清單頁提供可直接閱讀的表格、搜尋、分類、發布／HTML 首次入庫日期、Repo 與最近健康檢查。手機以可閱讀的分列方式顯示同一份清單。即使 JavaScript 關閉也能閱讀全部列。

## 唯一資料來源

`arislee1979-afk/50_github_learn` 的 `site-directory/allowlist.json` 是唯一人工核准登錄資料。`site/sites.json`、`site/export.json` 與 HTML 是衍生快照，不是另一份可編輯 registry。只輸出六筆既有核准 URL；404 新網址遷移仍待獨立人工接受。私人候選、approval_basis 與未知欄位不匯出。

## 更新

在管理 Repo 的已接受版本執行 `python3 -B site-directory/scripts/test_build.py` 與 `python3 -B site-directory/scripts/build.py`。將 `site-directory/dist/` 的內容更新到此 Repo 的 `site/`，驗證後提交工作分支並建立或更新同一 Draft PR。保留 `site/export.json` 的 allowlist hash，review 時與管理 Repo canonical allowlist 核對。不從公開 Repo 讀取私人 registry，也不新增 PAT、secret 或輪詢服務。

## 驗證與發布

執行 `python3 -B scripts/verify.py`。PR 只驗證，不部署。人類明示 MERGE 並合併後，main push 觸發 GitHub Pages Actions；只上傳 `site/`，不上傳工作文件。Pages Source 為 GitHub Actions。

正式流程為管理 Repo PR #16 接受後，核對本站快照的 allowlist hash，再接受本站 PR。不能以 Draft PR 或測試通過代替合併批准。合併後確認 Actions 成功，實際讀回首頁、`/pages/`、CSS、JS、`sites.json` 與 `export.json`。

Homer 為 Apache 2.0；授權與 NOTICE 保存在 `site/`。原研究 Repo 與 ACP 發布契約未更動。
