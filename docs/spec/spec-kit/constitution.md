# md2doc - Markdown 多格式轉換工具

## 專案憲章（Project Constitution）

### 專案願景（Vision）

打造一個開發者友善、跨平台、離線可用的 Markdown 轉換工具，讓技術寫作者和開發者能夠輕鬆將 Markdown 文件轉換為專業的 Word 和 PDF 文件，無需手動排版，完整支援 Mermaid 圖表和自訂主題。

### 核心價值（Core Values）

1. **開發者體驗優先**：命令列工具設計簡潔直觀，提供預設值，減少配置負擔
2. **離線可用**：所有功能（包括 Mermaid 渲染）不依賴網路
3. **跨平台支援**：Windows、macOS、Linux 一致的使用體驗
4. **格式保真**：Markdown → Word/PDF 轉換保留度 > 95%
5. **可擴展性**：支援自訂主題、插件系統、多種使用模式（CLI、VSCode、MCP）

### 專案範圍（Scope）

**包含（In Scope）**：
- Markdown 到 Word（.docx）和 PDF 格式的轉換
- 完整的 CommonMark 和 GFM 語法支援
- Mermaid 圖表渲染（本地離線）
- 5 個預設主題 + 自訂主題系統
- CLI 工具（單一執行檔）
- VSCode 延伸套件
- MCP Server / Claude SKILL 整合
- 批次處理與大型文檔支援（>1MB）

**不包含（Out of Scope）**：
- 即時協作編輯功能（未來考慮）
- 雲端儲存整合（Google Drive、Dropbox）
- Markdown 編輯器（只負責轉換）
- 其他輸出格式（EPUB、HTML、Slides）在 1.0 版本

### 目標用戶（Target Users）

1. **技術寫作者**：撰寫技術文檔、教學文章、API 文件
2. **開發者**：生成專案文檔、README、設計文件
3. **學生/研究人員**：撰寫論文、報告、筆記
4. **產品經理**：撰寫規格文件、PRD、會議記錄

### 技術原則（Technical Principles）

1. **單一職責**：每個模組專注於一項任務（解析、渲染、轉換）
2. **配置優於慣例**：提供合理預設值，允許完全自訂
3. **優雅降級**：遇到錯誤時繼續處理，不中斷整個流程
4. **效能優先**：使用平行處理、快取機制，確保大型文檔處理速度
5. **測試驅動**：所有核心功能有對應的單元測試和整合測試

### 品質標準（Quality Standards）

- **測試覆蓋率**：> 80%
- **格式保真度**：> 95%
- **Mermaid 渲染成功率**：> 98%
- **轉換速度**：1MB 文檔 < 10 秒
- **記憶體使用**：峰值 < 500MB
- **跨平台一致性**：100%（所有平台行為一致）

### 發布策略（Release Strategy）

- **版本規則**：Semantic Versioning（SemVer 2.0）
- **發布頻率**：
  - 主版本（Major）：破壞性更新，每年最多 1 次
  - 次版本（Minor）：新功能，每季 1 次
  - 修補版本（Patch）：錯誤修復，視需要發布
- **支援週期**：最新 2 個主版本提供維護

### 社群與貢獻（Community）

- **開源授權**：MIT License
- **貢獻指南**：歡迎 PR，需通過 CI 測試和 code review
- **溝通管道**：GitHub Issues、Discussions
- **行為準則**：遵循 Contributor Covenant

### 成功指標（Success Metrics）

**1.0 版本目標**（6 個月內）：
- GitHub Stars：> 500
- npm 週下載量：> 1,000
- VSCode 延伸套件安裝量：> 500
- 轉換成功率：> 99%
- 用戶滿意度：> 4.5/5.0

---

**文檔版本**：1.0  
**最後更新**：2025-11-12  
**維護者**：md2doc Team
