# 技術實作計劃

## 技術棧選擇

### 核心技術

**語言與執行環境**：
- **TypeScript 5.3+**：類型安全、優秀的 IDE 支援、跨平台
- **Node.js 18+**：LTS 版本、穩定的 API、豐富的生態系統

**核心依賴**：

| 套件 | 版本 | 用途 |
|------|------|------|
| `marked` | ^11.0.0 | Markdown 解析（輕量、可擴展） |
| `docx` | ^8.5.0 | Word 文件生成 |
| `puppeteer-core` | ^21.0.0 | PDF 生成 + Mermaid 渲染 |
| `mermaid` | ^10.6.0 | Mermaid 圖表庫 |
| `sharp` | ^0.33.0 | 圖片處理與轉換 |
| `commander` | ^11.1.0 | CLI 框架 |
| `yaml` | ^2.3.4 | YAML 配置解析 |
| `inquirer` | ^9.2.12 | 互動式提示 |
| `cli-progress` | ^3.12.0 | 進度條顯示 |
| `glob` | ^10.3.10 | 檔案匹配 |

### 替代方案評估

**Markdown 解析器比較**：

| 選項 | 優點 | 缺點 | 選擇 |
|------|------|------|------|
| `marked` | 輕量（30KB）、快速、可擴展 | 功能較基本 | ✅ 推薦 |
| `markdown-it` | 功能豐富、插件多 | 較重（100KB+） | 備選 |
| `remark` | 強大的 AST、可組合 | 學習曲線陡峭 | ❌ |

**PDF 生成比較**：

| 選項 | 優點 | 缺點 | 選擇 |
|------|------|------|------|
| `puppeteer` | CSS 完全可控、支援 SVG | 體積大（~120MB）、記憶體消耗高 | ✅ 推薦 |
| `wkhtmltopdf` | 快速、體積小 | CSS 支援有限 | 備選 |
| `pdfkit` | 輕量、程式化控制 | 需要手動排版 | ❌ |

**Mermaid 渲染比較**：

| 選項 | 優點 | 缺點 | 選擇 |
|------|------|------|------|
| `puppeteer + mermaid.js` | 離線渲染、完整支援 | 體積大 | ✅ 推薦 |
| `mermaid-cli` | 官方工具 | 需要 Chromium | 同上 |
| `Kroki API` | 無需本地安裝 | 需要網路 | ❌ |

## 架構設計

### 整體架構圖

```
┌─────────────────────────────────────────────────────────┐
│                      CLI Interface                       │
│  (Commander, Inquirer, CLI-Progress)                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│                    Config Loader                         │
│  (YAML/JSON parsing, Priority resolution)               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│                   Core Converter                         │
│                                                          │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Markdown  │→ │   Mermaid    │→ │     Image      │  │
│  │   Parser   │  │   Renderer   │  │    Handler     │  │
│  └────────────┘  └──────────────┘  └────────────────┘  │
│         │                │                  │           │
│         └────────────────┴──────────────────┘           │
│                         ↓                                │
│            ┌────────────────────────────┐               │
│            │     Theme Loader           │               │
│            └────────────────────────────┘               │
│                         ↓                                │
│        ┌────────────────┴─────────────────┐             │
│        │                                   │             │
│  ┌───────────┐                      ┌───────────┐       │
│  │   Word    │                      │    PDF    │       │
│  │ Generator │                      │ Generator │       │
│  └───────────┘                      └───────────┘       │
└─────────────────────────────────────────────────────────┘
```

### 模組劃分

**src/core/** - 核心轉換邏輯
- `parser.ts`: Markdown AST 解析
- `mermaid-renderer.ts`: Mermaid → PNG/SVG
- `image-handler.ts`: 圖片下載、處理、嵌入
- `theme-loader.ts`: 主題檔案載入與合併

**src/converters/** - 格式轉換器
- `word-converter.ts`: AST → Word（docx）
- `pdf-converter.ts`: AST → HTML → PDF

**src/cli/** - 命令列介面
- `index.ts`: CLI 入口、參數解析
- `batch-processor.ts`: 批次處理、平行化
- `prompts.ts`: 互動式提示

**src/config/** - 配置系統
- `config-loader.ts`: 配置檔載入、合併、驗證
- `schema.ts`: 配置結構定義（Zod）

**src/mcp/** - MCP Server
- `server.ts`: MCP 協議實作
- `tools.ts`: 工具定義

**src/integrations/** - 外部整合
- `stdin-handler.ts`: stdin/stdout 模式

### 資料流

```
Input: guide.md
       ↓
[Parser] → AST (Abstract Syntax Tree)
       ↓
[Mermaid Renderer] → Replace mermaid code blocks with images
       ↓
[Image Handler] → Resolve & embed images
       ↓
[Theme Loader] → Apply styles
       ↓
      ┌┴┐
      │ │
[Word Gen]  [PDF Gen]
      │        │
      ↓        ↓
guide.docx  guide.pdf
```

## 實作細節

### 1. Markdown 解析器 (`parser.ts`)

```typescript
interface MarkdownAST {
  type: 'document';
  children: ASTNode[];
}

type ASTNode = 
  | HeadingNode
  | ParagraphNode
  | ListNode
  | TableNode
  | CodeBlockNode
  | ImageNode
  | MermaidNode;

class MarkdownParser {
  parse(markdown: string): MarkdownAST {
    // 使用 marked + 自訂 extension
    const tokens = marked.lexer(markdown);
    return this.buildAST(tokens);
  }
  
  private buildAST(tokens: Token[]): MarkdownAST {
    // 轉換 marked tokens → 自訂 AST
  }
}
```

**Extension 處理**：
```typescript
marked.use({
  extensions: [
    {
      name: 'mermaid',
      level: 'block',
      start(src) { return src.match(/^```mermaid/)?.index; },
      tokenizer(src) {
        const match = src.match(/^```mermaid\n([\s\S]*?)\n```/);
        if (match) {
          return {
            type: 'mermaid',
            raw: match[0],
            code: match[1]
          };
        }
      }
    }
  ]
});
```

### 2. Mermaid 渲染器 (`mermaid-renderer.ts`)

```typescript
class MermaidRenderer {
  private browser: Browser;
  private cache: Map<string, Buffer> = new Map();
  
  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      executablePath: this.getChromiumPath()
    });
  }
  
  async render(code: string, format: 'png' | 'svg'): Promise<Buffer> {
    // 檢查快取
    const cacheKey = `${code}-${format}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const page = await this.browser.newPage();
    
    try {
      // 載入 mermaid.js
      await page.addScriptTag({ 
        path: require.resolve('mermaid/dist/mermaid.min.js') 
      });
      
      // 初始化並渲染
      await page.evaluate((code) => {
        mermaid.initialize({ startOnLoad: false });
        return mermaid.render('diagram', code);
      }, code);
      
      // 截圖或取得 SVG
      const result = format === 'png'
        ? await page.screenshot({ type: 'png' })
        : await page.$eval('#diagram', el => el.innerHTML);
        
      this.cache.set(cacheKey, result);
      return result;
    } finally {
      await page.close();
    }
  }
  
  async close() {
    await this.browser.close();
  }
}
```

### 3. Word 轉換器 (`word-converter.ts`)

```typescript
import { Document, Paragraph, TextRun, HeadingLevel } from 'docx';

class WordConverter {
  constructor(private theme: Theme) {}
  
  convert(ast: MarkdownAST): Document {
    const sections = [];
    
    for (const node of ast.children) {
      switch (node.type) {
        case 'heading':
          sections.push(this.createHeading(node));
          break;
        case 'paragraph':
          sections.push(this.createParagraph(node));
          break;
        case 'table':
          sections.push(this.createTable(node));
          break;
        // ... 其他類型
      }
    }
    
    return new Document({
      sections: [{ children: sections }],
      styles: this.theme.word.styles
    });
  }
  
  private createHeading(node: HeadingNode): Paragraph {
    return new Paragraph({
      text: node.text,
      heading: HeadingLevel[`HEADING_${node.level}`],
      style: this.theme.word.headingStyle(node.level)
    });
  }
}
```

### 4. 配置系統 (`config-loader.ts`)

```typescript
import { z } from 'zod';

const ConfigSchema = z.object({
  format: z.enum(['word', 'pdf', 'both']).default('both'),
  theme: z.string().default('default'),
  mermaid: z.object({
    background: z.string().default('white'),
    scale: z.number().default(2),
    timeout: z.number().default(30000)
  }),
  images: z.object({
    relative: z.enum(['embed', 'copy', 'link']).default('embed'),
    remote: z.enum(['download', 'link', 'ask']).default('download')
  }),
  overwrite: z.enum(['ask', 'force', 'rename']).default('ask')
});

type Config = z.infer<typeof ConfigSchema>;

class ConfigLoader {
  load(cliArgs: Partial<Config>): Config {
    const configs = [
      this.loadDefaults(),
      this.loadGlobal(),
      this.loadProject(),
      cliArgs
    ];
    
    const merged = configs.reduce((acc, cfg) => ({ ...acc, ...cfg }), {});
    return ConfigSchema.parse(merged);
  }
  
  private loadGlobal(): Partial<Config> {
    const path = join(homedir(), '.md2docrc.yml');
    return existsSync(path) ? yaml.load(readFileSync(path, 'utf8')) : {};
  }
}
```

## 打包與分發

### 單一執行檔打包

**使用 pkg**：
```json
{
  "pkg": {
    "targets": [
      "node18-win-x64",
      "node18-macos-arm64",
      "node18-macos-x64",
      "node18-linux-x64"
    ],
    "assets": [
      "themes/**/*",
      "node_modules/puppeteer-core/.local-chromium/**/*"
    ],
    "outputPath": "dist"
  }
}
```

**建置腳本**：
```bash
#!/bin/bash
# scripts/build.sh

# 1. 編譯 TypeScript
npm run build

# 2. 打包為單一執行檔
pkg . --compress GZip

# 3. 壓縮與命名
for file in dist/md2doc-*; do
  tar -czf "${file}.tar.gz" "$file"
done
```

### VSCode 延伸套件打包

```bash
# 1. 編譯延伸套件
cd extension
npm run compile

# 2. 打包 .vsix
vsce package

# 3. 發布
vsce publish
```

## 效能優化策略

### 1. 平行處理

```typescript
class BatchProcessor {
  async process(files: string[], config: Config) {
    const pool = new WorkerPool(config.batch.parallel || 4);
    
    return Promise.all(
      files.map(file => pool.exec(async () => {
        const converter = new Converter(config);
        return converter.convert(file);
      }))
    );
  }
}
```

### 2. 快取機制

- **Mermaid 快取**：相同代碼重用圖片（基於 MD5 hash）
- **圖片快取**：下載的網路圖片快取到 `~/.md2doc/cache/`
- **增量轉換**：比對檔案 mtime，跳過未變更的檔案

### 3. 記憶體管理

- Stream 處理：大型檔案分段讀取
- Buffer pool：重用 Buffer 物件
- 及時釋放：轉換完成後立即關閉 Puppeteer page

## 測試策略

### 單元測試（Vitest）

```typescript
describe('MarkdownParser', () => {
  it('should parse headings', () => {
    const ast = parser.parse('# Title\n## Subtitle');
    expect(ast.children).toHaveLength(2);
    expect(ast.children[0].type).toBe('heading');
  });
  
  it('should handle mermaid blocks', () => {
    const ast = parser.parse('```mermaid\ngraph TD\nA-->B\n```');
    expect(ast.children[0].type).toBe('mermaid');
  });
});
```

### 整合測試（Playwright）

```typescript
test('CLI converts markdown to word', async () => {
  const result = await exec('md2doc test.md --format word');
  expect(result.exitCode).toBe(0);
  expect(fs.existsSync('test.docx')).toBe(true);
});
```

### 效能測試

```typescript
benchmark('convert 1MB markdown', async () => {
  const start = Date.now();
  await converter.convert('large.md');
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(10000); // < 10 秒
});
```

## CI/CD 流程

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      
      - run: npm ci
      - run: npm test
      - run: npm run build
  
  release:
    needs: test
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    
    steps:
      - run: npm run build:all
      - uses: softprops/action-gh-release@v1
        with:
          files: dist/*
```

## 風險與緩解

| 風險 | 影響 | 機率 | 緩解措施 |
|------|------|------|----------|
| Puppeteer 體積過大 | 執行檔 >150MB | 高 | 使用 puppeteer-core + 壓縮 |
| Mermaid 渲染失敗率高 | 用戶體驗差 | 中 | 完整測試 + 保留原始代碼 |
| 跨平台字體不一致 | 輸出不一致 | 中 | 使用通用字體 + fallback |
| Word 版本相容性 | 無法開啟 | 低 | 測試多版本 Office |

## 時程規劃

| 階段 | 任務 | 預估時間 | 負責人 |
|------|------|----------|--------|
| Phase 1 | 核心引擎 + CLI 基礎 | 2-3 天 | Dev |
| Phase 2 | CLI 完善 + 測試 | 1-2 天 | Dev |
| Phase 3 | VSCode 延伸套件 | 2-3 天 | Dev |
| Phase 4 | MCP/SKILL 整合 | 1-2 天 | Dev |
| Phase 5 | 文檔與發布 | 1 天 | All |
| **總計** | | **7-11 天** | |

---

**文檔版本**：1.0  
**最後更新**：2025-11-12
