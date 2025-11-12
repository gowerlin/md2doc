# Story 1.0: Markdown 多格式轉換工具（md2doc）

## Story Description

開發一個跨平台的 Markdown 轉換工具，支援將 Markdown 文件轉換為 Word（.docx）和 PDF 格式，並完整保留格式與 Mermaid 圖表。工具提供三種使用模式：CLI 命令列工具（優先級 1）、VSCode 延伸套件（優先級 2）、以及 MCP Server/Claude SKILL（優先級 3）。支援離線使用、批次處理、主題自訂，並能處理大型文檔（>1MB）。

核心價值主張：開發者和技術寫作者可以使用熟悉的 Markdown 格式撰寫文檔，一鍵生成專業的 Word/PDF 文件，無需手動排版，支援複雜的 Mermaid 圖表和自訂主題。

## Tasks

### Task 1: 核心轉換引擎開發
**目標**：建立可重用的 Markdown 解析與格式轉換核心

- [ ] **Subtask 1.1**: 實作 Markdown 解析器 (`src/core/parser.ts`)
  - 支援完整 CommonMark 規範
  - 擴展支援 GFM（表格、刪除線、任務列表）
  - 解析 Mermaid 代碼塊（```mermaid）
  - 處理圖片路徑（相對/絕對/網路）
  - 錯誤處理：無效語法時發出警告並繼續

- [ ] **Subtask 1.2**: 實作 Mermaid 渲染引擎 (`src/core/mermaid-renderer.ts`)
  - 使用 Puppeteer + 內嵌 Chrome 實現離線渲染
  - Word 輸出：轉為 PNG（可配置 DPI）
  - PDF 輸出：轉為 SVG（向量圖）
  - 失敗處理：保留原始代碼並標記錯誤
  - 支援配置背景色、縮放比例

- [ ] **Subtask 1.3**: 實作圖片處理模組 (`src/core/image-handler.ts`)
  - 相對路徑解析（基於 Markdown 檔案位置）
  - 網路圖片下載（可配置超時）
  - Base64 嵌入選項
  - 失敗處理：顯示佔位符（灰色方塊 + 錯誤文字）
  - 支援配置檔定義預設行為

- [ ] **Subtask 1.4**: 實作 Word 生成器 (`src/converters/word-converter.ts`)
  - 使用 `docx` 庫（支援完整格式）
  - 主題系統：支援自訂樣式（標題、正文、代碼）
  - 正確處理表格、列表巢狀、代碼高亮
  - 嵌入圖片與 Mermaid 圖表
  - 生成目錄（可選）

- [ ] **Subtask 1.5**: 實作 PDF 生成器 (`src/converters/pdf-converter.ts`)
  - 使用 Puppeteer 轉換（HTML → PDF）
  - 主題系統：CSS-based 樣式定義
  - 支援分頁、頁首頁尾
  - 嵌入向量圖（Mermaid SVG）
  - 超連結保留

- [ ] **Subtask 1.6**: 實作主題系統 (`src/themes/`)
  - 5 個預設主題：
    - `default.theme.json`：簡潔現代風格
    - `github.theme.json`：GitHub README 風格
    - `academic.theme.json`：學術論文風格
    - `professional.theme.json`：商務文件風格
    - `minimal.theme.json`：極簡黑白風格
  - 主題格式：JSON 定義顏色、字體、間距
  - 支援使用者自訂主題（放在 `~/.md2doc/themes/`）

### Task 2: CLI 工具實作（優先級 1）
**目標**：提供穩定高效的命令列介面

- [ ] **Subtask 2.1**: 實作 CLI 框架 (`src/cli/index.ts`)
  - 使用 `commander` 或 `yargs` 解析參數
  - 支援以下命令：
    ```bash
    md2doc <input> [options]
    md2doc init          # 生成配置檔
    md2doc themes        # 列出可用主題
    md2doc --version
    ```
  - 參數：`--format/-f`、`--theme/-t`、`--force`、`--no-overwrite`、`--config/-c`

- [ ] **Subtask 2.2**: 實作批次處理 (`src/cli/batch-processor.ts`)
  - 支援 glob 模式：`md2doc *.md`、`md2doc docs/**/*.md`
  - 平行處理（worker pool，預設 4 個 worker）
  - 進度條顯示（使用 `cli-progress`）
  - 錯誤摘要報告

- [ ] **Subtask 2.3**: 實作配置檔系統 (`src/config/config-loader.ts`)
  - 支援 `.md2docrc.yml`、`.md2docrc.json`、`package.json` 中的 `md2doc` 欄位
  - 優先級：CLI 參數 > 專案配置 > 全域配置 (`~/.md2docrc.yml`)
  - 配置項目：
    ```yaml
    format: both          # word, pdf, both
    theme: github
    mermaid:
      background: white
      scale: 2
    images:
      relative: embed      # embed, copy, link
      remote: download     # download, link, ask
    overwrite: ask         # ask, force, rename
    ```

- [ ] **Subtask 2.4**: 實作互動式提示 (`src/cli/prompts.ts`)
  - 檔案覆蓋確認（使用 `inquirer`）
  - 圖片處理選項（當配置為 `ask`）
  - 主題預覽與選擇

- [ ] **Subtask 2.5**: 打包為單一執行檔 (`scripts/build.sh`)
  - 使用 `@vercel/ncc` 或 `pkg` 打包
  - 內嵌 Chromium（puppeteer-core）
  - 目標平台：Windows (x64)、macOS (arm64/x64)、Linux (x64)
  - 檔案大小控制 < 150MB

### Task 3: VSCode 延伸套件開發（優先級 2）
**目標**：提供流暢的編輯器整合體驗

- [ ] **Subtask 3.1**: 延伸套件基礎架構 (`extension/src/extension.ts`)
  - 註冊命令：`md2doc.convertToWord`、`md2doc.convertToPdf`、`md2doc.convertToBoth`
  - 右鍵選單整合（`.md` 檔案）
  - 命令面板整合

- [ ] **Subtask 3.2**: 實作預覽功能 (`extension/src/preview.ts`)
  - Webview 面板顯示轉換預覽
  - 即時更新（檔案變更時）
  - 主題切換預覽

- [ ] **Subtask 3.3**: 狀態列整合 (`extension/src/statusbar.ts`)
  - 顯示當前主題
  - 轉換進度指示器
  - 點擊快速轉換

- [ ] **Subtask 3.4**: 設定頁面 (`extension/package.json` contributions)
  - 預設格式選擇
  - 預設主題選擇
  - 圖片處理策略
  - Mermaid 渲染選項

- [ ] **Subtask 3.5**: 延伸套件發布 (`extension/README.md`)
  - 撰寫文檔與 GIF 示範
  - 發布到 VSCode Marketplace
  - 設定自動更新

### Task 4: MCP Server / Claude SKILL 整合（優先級 3）
**目標**：讓 AI 助手能夠直接呼叫轉換功能

- [ ] **Subtask 4.1**: 實作 MCP Server (`src/mcp/server.ts`)
  - 遵循 MCP 協議規範
  - 提供工具：
    - `convert_markdown`: 轉換單一檔案
    - `batch_convert`: 批次轉換
    - `list_themes`: 列出可用主題
    - `preview`: 生成預覽
  - 參數驗證與錯誤處理

- [ ] **Subtask 4.2**: Claude SKILL 包裝 (`skill/SKILL.md`)
  - 撰寫 Skill 描述與使用範例
  - 定義輸入/輸出格式
  - 提供 prompt 模板
  - 測試與 Claude Desktop 整合

- [ ] **Subtask 4.3**: CLI AI 工具整合 (`src/integrations/`)
  - 支援 stdin/stdout 模式（管道操作）
  - JSON 輸入/輸出格式
  - 與 `aider`、`cursor`、`continue` 等工具整合測試

### Task 5: 測試與品質保證
**目標**：確保穩定性與可靠性

- [ ] **Subtask 5.1**: 單元測試 (`tests/unit/`)
  - Parser 測試（各種 Markdown 語法）
  - Mermaid 渲染測試
  - 圖片處理測試
  - 主題系統測試
  - 配置載入測試
  - 測試覆蓋率 > 80%

- [ ] **Subtask 5.2**: 整合測試 (`tests/integration/`)
  - 端到端轉換測試（Markdown → Word/PDF）
  - 批次處理測試
  - 大型文檔測試（>1MB，100+ 圖片）
  - 錯誤處理測試

- [ ] **Subtask 5.3**: 效能測試 (`tests/performance/`)
  - 轉換速度基準測試
  - 記憶體使用監控
  - 並行處理效率測試
  - 目標：1MB 文檔 < 10秒轉換

- [ ] **Subtask 5.4**: 相容性測試
  - 跨平台測試（Windows/macOS/Linux）
  - Word 版本相容性（Office 2016+、LibreOffice）
  - PDF 閱讀器測試（Adobe、Preview、Chrome）

### Task 6: 文檔與發布
**目標**：完善的使用文檔與生態系統

- [ ] **Subtask 6.1**: 撰寫文檔 (`docs/`)
  - README.md：快速開始、安裝指南
  - CLI-GUIDE.md：完整命令參考
  - THEMES.md：主題開發指南
  - CONFIG.md：配置檔詳解
  - API.md：程式化呼叫 API

- [ ] **Subtask 6.2**: 範例與模板 (`examples/`)
  - 各種 Markdown 範例檔案
  - 自訂主題範例
  - 配置檔範例

- [ ] **Subtask 6.3**: CI/CD 設定 (`.github/workflows/`)
  - 自動測試（GitHub Actions）
  - 跨平台建置
  - 自動發布到 npm、GitHub Releases
  - VSCode Marketplace 自動發布

- [ ] **Subtask 6.4**: 官網與展示 (`website/`)
  - 線上試用（WASM 版本）
  - 主題預覽畫廊
  - 使用案例展示

## Testing Requirements

### Unit Tests
- **Markdown 解析器**：測試所有支援的語法元素（標題、列表、表格、代碼、引用、連結、圖片）
- **Mermaid 渲染**：測試各種 Mermaid 圖表類型（flowchart、sequence、class、state、gantt）
- **圖片處理**：測試相對路徑、絕對路徑、網路圖片、Base64、失效連結
- **主題系統**：測試主題載入、切換、自訂、錯誤處理
- **配置系統**：測試配置檔解析、合併、驗證、優先級

### Integration Tests
- **CLI 端到端**：從 Markdown 輸入到 Word/PDF 輸出的完整流程
- **批次處理**：測試多檔案轉換、glob 模式、錯誤處理
- **VSCode 延伸套件**：測試命令執行、預覽、設定同步
- **MCP Server**：測試工具呼叫、參數驗證、錯誤回應
- **大型文檔**：測試 >1MB 文檔、100+ 圖片、50+ Mermaid 圖表

### E2E Tests
- **跨平台測試**：在 Windows、macOS、Linux 上執行完整測試套件
- **版本相容性**：測試與 Word 2016/2019/365、LibreOffice 7.x 的相容性
- **瀏覽器測試**：驗證 PDF 在不同閱讀器中的顯示一致性
- **AI 工具整合**：測試與 Claude Desktop、aider、cursor 的整合

### Performance Tests
- **轉換速度**：
  - 小檔案（<10KB）：< 1 秒
  - 中型檔案（100KB）：< 3 秒
  - 大型檔案（1MB）：< 10 秒
- **記憶體使用**：峰值 < 500MB（處理 1MB 文檔時）
- **並行處理**：4 個 worker 處理 100 個檔案 < 2 分鐘

## Acceptance Criteria

- [ ] **AC1**: CLI 工具可在 Windows/macOS/Linux 上執行，單一執行檔 < 150MB
- [ ] **AC2**: 支援所有 CommonMark 和 GFM 語法，格式保留度 > 95%
- [ ] **AC3**: Mermaid 圖表成功渲染率 > 98%（失敗時保留代碼）
- [ ] **AC4**: 5 個預設主題完整實作，可自訂主題
- [ ] **AC5**: 配置檔系統正常運作，支援 YAML/JSON 格式
- [ ] **AC6**: 批次處理支援 glob 模式，平行處理 4+ 檔案
- [ ] **AC7**: 圖片處理支援相對/絕對/網路路徑，失敗時顯示佔位符
- [ ] **AC8**: 無效 Markdown 語法時發出警告並繼續轉換
- [ ] **AC9**: 檔案覆蓋時提示使用者（可透過 `--force` 跳過）
- [ ] **AC10**: 離線可用（Mermaid 本地渲染，無需網路）
- [ ] **AC11**: 處理大型文檔（>1MB，100+ 圖片）無記憶體溢出
- [ ] **AC12**: VSCode 延伸套件包含右鍵選單、命令面板、預覽、狀態列、設定頁面
- [ ] **AC13**: MCP Server 遵循協議規範，與 Claude Desktop 正常整合
- [ ] **AC14**: 測試覆蓋率 > 80%，所有測試通過
- [ ] **AC15**: 文檔完整（README、CLI Guide、API、主題開發指南）

## Dev Notes

### Architecture

**整體架構**：
```
md2doc/
├── src/
│   ├── core/                 # 核心轉換引擎
│   │   ├── parser.ts         # Markdown 解析
│   │   ├── mermaid-renderer.ts
│   │   ├── image-handler.ts
│   │   └── theme-loader.ts
│   ├── converters/           # 格式轉換器
│   │   ├── word-converter.ts
│   │   └── pdf-converter.ts
│   ├── cli/                  # CLI 工具
│   │   ├── index.ts
│   │   ├── batch-processor.ts
│   │   └── prompts.ts
│   ├── config/               # 配置系統
│   │   └── config-loader.ts
│   ├── mcp/                  # MCP Server
│   │   └── server.ts
│   └── integrations/         # 外部整合
├── extension/                # VSCode 延伸套件
│   └── src/
│       ├── extension.ts
│       ├── preview.ts
│       └── statusbar.ts
├── skill/                    # Claude SKILL
│   └── SKILL.md
├── themes/                   # 主題檔案
│   ├── default.theme.json
│   ├── github.theme.json
│   ├── academic.theme.json
│   ├── professional.theme.json
│   └── minimal.theme.json
├── tests/
├── docs/
└── examples/
```

**技術棧選擇**：
- **語言**：TypeScript（跨平台、生態豐富、易整合）
- **Word 生成**：`docx` 庫（支援完整格式）
- **PDF 生成**：Puppeteer（HTML → PDF，支援 CSS）
- **Mermaid 渲染**：Puppeteer + mermaid.js（本地渲染）
- **CLI 框架**：Commander.js
- **打包工具**：@vercel/ncc + pkg（單一執行檔）
- **測試框架**：Vitest + Playwright

### Dependencies

**核心依賴**：
```json
{
  "dependencies": {
    "docx": "^8.5.0",                    // Word 生成
    "puppeteer-core": "^21.0.0",         // PDF + Mermaid 渲染
    "mermaid": "^10.6.0",                // Mermaid 圖表
    "marked": "^11.0.0",                 // Markdown 解析
    "commander": "^11.1.0",              // CLI 框架
    "yaml": "^2.3.4",                    // YAML 配置
    "inquirer": "^9.2.12",               // 互動式提示
    "cli-progress": "^3.12.0",           // 進度條
    "glob": "^10.3.10",                  // 檔案匹配
    "sharp": "^0.33.0"                   // 圖片處理
  },
  "devDependencies": {
    "@vercel/ncc": "^0.38.1",            // 打包
    "pkg": "^5.8.1",                     // 單一執行檔
    "vitest": "^1.0.4",                  // 測試框架
    "@vscode/vsce": "^2.22.0"            // VSCode 延伸套件打包
  }
}
```

**VSCode 延伸套件依賴**：
- `vscode`：API 整合
- 重用核心轉換邏輯（import from `../src/core`）

**MCP Server 依賴**：
- `@modelcontextprotocol/sdk`：MCP 協議實作

### File Structure

**預期的檔案結構**（最終產品）：

```
安裝後的目錄結構：

~/.md2doc/
├── themes/                   # 使用者自訂主題
├── config.yml                # 全域配置
└── cache/                    # 渲染快取

專案目錄：
project/
├── .md2docrc.yml             # 專案配置
├── docs/
│   ├── guide.md              # 輸入檔案
│   ├── guide.docx            # 輸出檔案
│   └── guide.pdf
└── ...
```

### Performance Considerations

- **Mermaid 渲染快取**：相同的 Mermaid 代碼快取圖片，避免重複渲染
- **平行處理**：批次轉換時使用 worker pool
- **增量轉換**：檢查檔案修改時間，跳過未變更的檔案
- **記憶體管理**：大型文檔分段處理，避免一次載入全部內容
- **Puppeteer 優化**：重用 browser instance，減少啟動開銷

### Security Considerations

- **圖片下載**：限制檔案大小（< 10MB）、超時控制（10 秒）
- **Mermaid 渲染**：沙箱環境執行，防止惡意代碼
- **檔案系統**：驗證輸入路徑，防止路徑遍歷攻擊
- **配置檔**：驗證 YAML/JSON 結構，防止注入攻擊

### Future Enhancements

- **匯出格式擴展**：EPUB、HTML、Markdown to Slides
- **即時協作**：多人同時編輯 Markdown，同步轉換
- **雲端整合**：Google Drive、Dropbox 同步
- **AI 輔助**：自動生成目錄、摘要、關鍵字
- **模板市場**：社群分享主題與模板
- **Web 版本**：瀏覽器內轉換（WASM）

## File List

**New Files**:
- `src/core/parser.ts`
- `src/core/mermaid-renderer.ts`
- `src/core/image-handler.ts`
- `src/core/theme-loader.ts`
- `src/converters/word-converter.ts`
- `src/converters/pdf-converter.ts`
- `src/cli/index.ts`
- `src/cli/batch-processor.ts`
- `src/cli/prompts.ts`
- `src/config/config-loader.ts`
- `src/mcp/server.ts`
- `src/integrations/stdin-handler.ts`
- `extension/src/extension.ts`
- `extension/src/preview.ts`
- `extension/src/statusbar.ts`
- `skill/SKILL.md`
- `themes/default.theme.json`
- `themes/github.theme.json`
- `themes/academic.theme.json`
- `themes/professional.theme.json`
- `themes/minimal.theme.json`
- `tests/unit/parser.test.ts`
- `tests/unit/mermaid-renderer.test.ts`
- `tests/unit/image-handler.test.ts`
- `tests/unit/theme-loader.test.ts`
- `tests/integration/cli.test.ts`
- `tests/integration/vscode.test.ts`
- `tests/integration/mcp.test.ts`
- `tests/performance/benchmark.test.ts`
- `docs/README.md`
- `docs/CLI-GUIDE.md`
- `docs/THEMES.md`
- `docs/CONFIG.md`
- `docs/API.md`
- `examples/basic.md`
- `examples/advanced.md`
- `examples/.md2docrc.yml`
- `scripts/build.sh`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `package.json`
- `tsconfig.json`

**Modified Files**:
（無，這是全新專案）

## Dev Agent Record

**實作順序建議**：

1. **Phase 1**（2-3 天）：核心引擎 + CLI 基礎
   - Task 1.1 - 1.6：轉換引擎與主題系統
   - Task 2.1 - 2.3：CLI 基礎功能

2. **Phase 2**（1-2 天）：CLI 完善 + 測試
   - Task 2.4 - 2.5：互動功能與打包
   - Task 5.1 - 5.2：單元與整合測試

3. **Phase 3**（2-3 天）：VSCode 延伸套件
   - Task 3.1 - 3.5：完整延伸套件功能

4. **Phase 4**（1-2 天）：MCP / SKILL 整合
   - Task 4.1 - 4.3：MCP Server 與 AI 工具整合

5. **Phase 5**（1 天）：文檔與發布
   - Task 6.1 - 6.4：完整文檔與 CI/CD

**總預估時間**：7-11 天（單人全職開發）

---

**版本號**：1.0.0  
**最後更新**：2025-11-12  
**文檔格式**：BMAD Story Format  
**AI-Ready 品質評估**：待驗證（預估 95%+）
