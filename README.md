# md2doc

[![CI](https://github.com/gowerlin/md2doc/actions/workflows/ci.yml/badge.svg)](https://github.com/gowerlin/md2doc/actions/workflows/ci.yml)
[![Release](https://github.com/gowerlin/md2doc/actions/workflows/release.yml/badge.svg)](https://github.com/gowerlin/md2doc/actions/workflows/release.yml)
[![CodeQL](https://github.com/gowerlin/md2doc/actions/workflows/codeql.yml/badge.svg)](https://github.com/gowerlin/md2doc/actions/workflows/codeql.yml)
[![Docker](https://github.com/gowerlin/md2doc/actions/workflows/docker.yml/badge.svg)](https://github.com/gowerlin/md2doc/actions/workflows/docker.yml)
[![Nightly Build](https://github.com/gowerlin/md2doc/actions/workflows/nightly.yml/badge.svg)](https://github.com/gowerlin/md2doc/actions/workflows/nightly.yml)
[![npm version](https://badge.fury.io/js/md2doc.svg)](https://www.npmjs.com/package/md2doc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Markdown 多格式轉換工具 - 將 Markdown 轉換為 Word、PDF 等格式

## 功能特點

- ✅ **Markdown 解析**：支援 CommonMark 和 GitHub Flavored Markdown (GFM)
- ✅ **Word 轉換**：生成 .docx 格式文檔
- ✅ **PDF 轉換**：通過 HTML 生成 PDF（需要 Puppeteer）
- ✅ **Mermaid 支援**：渲染 Mermaid 圖表
- ✅ **主題系統**：5 個預設主題（default, modern, academic, minimal, dark）
- ✅ **圖片處理**：支援本地和遠程圖片
- ✅ **批次處理**：支援 glob 模式批次轉換多個文件
- ✅ **配置系統**：YAML/JSON 配置檔支援
- ✅ **MCP Server**：Claude Desktop 整合，AI 助手可直接調用
- ✅ **VSCode Extension**：VS Code 編輯器整合
- ✅ **CLI 工具**：簡單易用的命令列介面

## 安裝

### 方式 1: 從 NPM 安裝（推薦）

```bash
npm install -g md2doc
```

### 方式 2: 從 Docker Hub 使用

```bash
docker pull ghcr.io/gowerlin/md2doc:latest
```

### 方式 3: 從原始碼建置

```bash
git clone https://github.com/gowerlin/md2doc.git
cd md2doc
npm install
npm run build
```

### 方式 4: VSCode Extension

在 VS Code 中搜索 "md2doc" 並安裝，或從 [Releases](https://github.com/gowerlin/md2doc/releases) 下載 .vsix 文件手動安裝。

### Puppeteer 設定（PDF 和 Mermaid 功能）

md2doc 使用 Puppeteer 來：
- 渲染 Mermaid 圖表
- 生成 PDF 文件

**選項 1：自動下載 Chromium（最簡單）**
```bash
npm install  # Puppeteer 會自動下載 Chromium (~170MB)
```

**選項 2：使用系統 Chrome**
```bash
# 跳過 Chromium 下載
PUPPETEER_SKIP_DOWNLOAD=true npm install

# 設定 Chrome 路徑
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome  # Linux
# or
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"  # macOS
```

**安裝系統 Chrome：**
- Ubuntu/Debian: `sudo apt-get install chromium-browser`
- macOS: `brew install --cask google-chrome`
- Windows: 從 https://www.google.com/chrome/ 下載

詳細設定說明請參閱 [PUPPETEER_SETUP.md](./PUPPETEER_SETUP.md)

**注意**：如果沒有 Puppeteer，工具仍可運行，但：
- Mermaid 圖表將使用佔位符
- PDF 輸出將生成 HTML 文件

## 使用方式

### CLI 使用（已安裝 NPM 包）

```bash
# 轉換單一文件
md2doc convert input.md -o output.docx

# 使用主題
md2doc convert input.md -t modern -o output.docx

# 轉換為 PDF
md2doc convert input.md -f pdf -o output.pdf

# 查看所有主題
md2doc themes

# 初始化配置
md2doc init
```

### Docker 使用

```bash
# 轉換單一文件
docker run -v $(pwd):/workspace ghcr.io/gowerlin/md2doc:latest convert example.md -o output.docx

# 批次轉換
docker run -v $(pwd):/workspace ghcr.io/gowerlin/md2doc:latest batch "docs/**/*.md" -o output/

# 查看主題
docker run ghcr.io/gowerlin/md2doc:latest themes
```

### 從原始碼使用

```bash
# 轉換單一文件
node dist/cli/index.js convert input.md -o output.docx

# 使用主題
node dist/cli/index.js convert input.md -t modern -o output.docx

# 轉換為 PDF（HTML）
node dist/cli/index.js convert input.md -f pdf -o output.pdf
```

### 批次轉換

```bash
# 轉換多個文件
node dist/cli/index.js convert file1.md file2.md file3.md -o output/

# 使用 glob 模式
node dist/cli/index.js convert "docs/**/*.md" -o output/

# 使用 batch 命令
node dist/cli/index.js batch "*.md" -o output/ -t academic

# 平行處理（更快）
node dist/cli/index.js batch "docs/**/*.md" -o output/ --parallel
```

### 配置系統

```bash
# 初始化配置文件
node dist/cli/index.js init

# 使用配置文件
node dist/cli/index.js convert input.md -c .md2docrc.yml

# 強制覆蓋現有文件
node dist/cli/index.js convert input.md --force

# 靜默模式
node dist/cli/index.js batch "*.md" -o output/ --quiet
```

### 查看主題

```bash
node dist/cli/index.js themes
```

## 配置文件範例

創建 `.md2docrc.yml`:

```yaml
# 輸出設定
output:
  format: docx              # 輸出格式：docx, pdf, both
  directory: .              # 輸出目錄
  overwrite: false          # 是否覆蓋現有文件

# 主題
theme: default              # 可選：default, modern, academic, minimal, dark

# PDF 設定
pdf:
  pageSize: A4              # 頁面大小：A4, Letter
  margin: 2cm               # 頁面邊距
  headerFooter: false       # 是否包含頁首頁尾

# Word 設定
docx:
  pageSize: A4              # 頁面大小：A4, Letter

# Mermaid 圖表設定
mermaid:
  theme: default            # 主題：default, dark, forest, neutral
  scale: 2                  # 縮放比例

# 圖片處理設定
images:
  maxWidth: 800             # 最大寬度（像素）
  quality: 85               # 圖片品質 (1-100)
  embedLocal: true          # 是否嵌入本地圖片
```

## CLI 選項

### convert 命令

```bash
md2doc convert <input...> [options]
```

**選項：**
- `-o, --output <path>` - 輸出路徑（單文件）或目錄（多文件）
- `-f, --format <format>` - 輸出格式 (docx/pdf/both，預設：docx)
- `-t, --theme <theme>` - 主題名稱（預設：default）
- `-c, --config <path>` - 配置文件路徑
- `--force` - 強制覆蓋現有文件
- `-q, --quiet` - 靜默模式（不顯示進度）
- `--verbose` - 詳細輸出模式

### batch 命令

```bash
md2doc batch <patterns...> [options]
```

**選項：**
- `-o, --output <dir>` - 輸出目錄
- `-f, --format <format>` - 輸出格式
- `-t, --theme <theme>` - 主題名稱
- `--force` - 強制覆蓋
- `-q, --quiet` - 靜默模式
- `--parallel` - 使用平行處理

### init 命令

```bash
md2doc init [-o <path>]
```

創建預設配置文件。

### themes 命令

```bash
md2doc themes
```

列出所有可用主題。

## MCP Server 整合

md2doc 支援 Model Context Protocol (MCP)，可與 Claude Desktop 整合，讓 AI 助手直接調用轉換功能。

### 設定

在 Claude Desktop 配置文件中添加：

**macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "md2doc": {
      "command": "md2doc-mcp",
      "env": {
        "PUPPETEER_EXECUTABLE_PATH": "/usr/bin/google-chrome"
      }
    }
  }
}
```

### 使用範例

在 Claude Desktop 中，您可以自然地請求轉換：

```
User: 請將我的 report.md 轉換為 Word 文件，使用 modern 主題。
Claude: 我來幫您轉換...
✓ 成功將 report.md 轉換為 report.docx

User: 批次轉換 docs 資料夾中的所有 Markdown 文件為 PDF。
Claude: 開始批次轉換...
✓ 批次轉換完成：5 個文件成功轉換
```

詳細設定請參閱 [MCP_SETUP.md](./MCP_SETUP.md)

## VSCode 延伸套件

md2doc 提供 VSCode 延伸套件，直接在編輯器中轉換 Markdown 文件。

### 安裝

```bash
cd vscode-extension
npm install
npm run compile
npm run package
```

然後在 VSCode 中安裝生成的 `.vsix` 文件。

### 功能

- **右鍵選單轉換**：從檔案總管或編輯器右鍵選單直接轉換
- **命令面板整合**：通過命令面板訪問所有轉換功能
- **狀態列整合**：編輯 Markdown 時快速訪問轉換功能
- **批次轉換**：使用 glob 模式批次轉換多個文件
- **主題選擇**：圖形化介面選擇主題
- **配置管理**：完整的 VSCode 設定整合

### 使用範例

1. 開啟 Markdown 文件
2. 按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）
3. 輸入 "md2doc" 並選擇轉換命令
4. 或直接右鍵點擊文件選擇 "Convert to Word" / "Convert to PDF"

詳細說明請參閱 [vscode-extension/README.md](./vscode-extension/README.md)

## 程式化使用

```typescript
import { Converter, BatchProcessor, ConfigLoader } from 'md2doc';

// 單文件轉換
const converter = new Converter();
await converter.convert({
  inputPath: 'input.md',
  outputPath: 'output.docx',
  theme: 'modern',
  output: {
    format: 'docx'
  }
});

// 批次處理
const batchProcessor = new BatchProcessor();
const result = await batchProcessor.processBatch({
  patterns: ['docs/**/*.md'],
  outputDir: 'output/',
  format: 'docx',
  theme: 'academic'
});

// 配置載入
const configLoader = new ConfigLoader();
const config = await configLoader.loadConfig('.md2docrc.yml');
```

## 開發

### 建置

```bash
npm run build
```

### 測試

```bash
npm test
```

### 開發模式

```bash
npm run dev
```

## 支援的 Markdown 語法

- 標題 (H1-H6)
- 段落
- **粗體** 和 *斜體*
- `行內代碼`
- 代碼區塊
- 列表（有序和無序）
- 表格
- 引用區塊
- 圖片
- 連結
- 水平線
- Mermaid 圖表

## 專案結構

```
md2doc/
├── src/
│   ├── core/              # 核心功能
│   │   ├── parser.ts      # Markdown 解析器
│   │   ├── image-handler.ts
│   │   ├── mermaid-renderer.ts
│   │   └── theme-loader.ts
│   ├── converters/        # 格式轉換器
│   │   ├── word-converter.ts
│   │   └── pdf-converter.ts
│   ├── cli/               # CLI 工具
│   │   ├── index.ts
│   │   └── batch-processor.ts
│   ├── config/            # 配置系統
│   │   └── config-loader.ts
│   ├── types/             # TypeScript 類型定義
│   └── index.ts           # 主入口
├── docs/                  # 文檔
│   └── spec/              # 規格文檔
└── tests/                 # 測試文件
```

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

本專案採用 Git Flow 分支模型：
- 請從 `develop` 分支建立功能分支
- Pull Request 應該對 `develop` 分支提出
- 詳細指南請參閱 [CONTRIBUTING.md](./CONTRIBUTING.md)

快速開始：
```bash
git checkout develop
git checkout -b feature/your-feature
# 進行開發...
git push origin feature/your-feature
# 然後對 develop 分支建立 Pull Request
```

