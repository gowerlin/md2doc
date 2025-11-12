# md2doc

Markdown 多格式轉換工具 - 將 Markdown 轉換為 Word、PDF 等格式

## 功能特點

- ✅ **Markdown 解析**：支援 CommonMark 和 GitHub Flavored Markdown (GFM)
- ✅ **Word 轉換**：生成 .docx 格式文檔
- ✅ **PDF 轉換**：通過 HTML 生成 PDF（需要 Puppeteer）
- ✅ **Mermaid 支援**：渲染 Mermaid 圖表
- ✅ **主題系統**：5 個預設主題（default, modern, academic, minimal, dark）
- ✅ **圖片處理**：支援本地和遠程圖片
- ✅ **CLI 工具**：簡單易用的命令列介面

## 安裝

```bash
npm install
npm run build
```

## 使用方式

### 轉換 Markdown 為 Word

```bash
node dist/cli/index.js convert input.md -o output.docx
```

### 轉換 Markdown 為 PDF

```bash
node dist/cli/index.js convert input.md -f pdf -o output.pdf
```

### 使用主題

```bash
node dist/cli/index.js convert input.md -t modern -o output.docx
```

### 查看可用主題

```bash
node dist/cli/index.js themes
```

## 程式化使用

```typescript
import { Converter } from 'md2doc';

const converter = new Converter();

await converter.convert({
  inputPath: 'input.md',
  outputPath: 'output.docx',
  theme: 'modern',
  output: {
    format: 'docx'
  }
});
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

