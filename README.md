# md2doc

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
- ✅ **CLI 工具**：簡單易用的命令列介面

## 安裝

```bash
npm install
npm run build
```

## 使用方式

### 基本轉換

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

