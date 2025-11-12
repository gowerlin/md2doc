# Task 01: 核心轉換引擎開發

## 任務概述

建立可重用的 Markdown 解析與格式轉換核心引擎，包含 Markdown 解析器、Mermaid 渲染器、圖片處理模組、Word 生成器、PDF 生成器和主題系統。

## 優先級

🔴 **P0 - 關鍵**（必須完成才能進行其他開發）

## 預估時間

2-3 天

## 前置條件

- Node.js 18+ 已安裝
- TypeScript 5.3+ 已設定
- 專案結構已建立

## 可執行子任務

### ✅ Subtask 1.1: 實作 Markdown 解析器

**檔案**: `src/core/parser.ts`

**目標**: 解析 Markdown 文件為 AST（Abstract Syntax Tree）

**實作步驟**:

1. 安裝依賴
```bash
npm install marked @types/marked
```

2. 定義 AST 結構
```typescript
// src/types/ast.ts
export interface MarkdownAST {
  type: 'document';
  children: ASTNode[];
}

export type ASTNode = 
  | HeadingNode
  | ParagraphNode
  | ListNode
  | TableNode
  | CodeBlockNode
  | ImageNode
  | LinkNode
  | BlockquoteNode
  | MermaidNode;

export interface HeadingNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  children: InlineNode[];
}

export interface MermaidNode {
  type: 'mermaid';
  code: string;
  language: 'mermaid';
}

// ... 其他 Node 定義
```

3. 實作解析器
```typescript
// src/core/parser.ts
import { marked, Tokens } from 'marked';

export class MarkdownParser {
  private extensions: MarkedExtension[] = [];
  
  constructor() {
    this.registerExtensions();
  }
  
  parse(markdown: string): MarkdownAST {
    const tokens = marked.lexer(markdown);
    return this.buildAST(tokens);
  }
  
  private registerExtensions() {
    // Mermaid extension
    marked.use({
      extensions: [{
        name: 'mermaid',
        level: 'block',
        start(src) { 
          return src.match(/^```mermaid/)?.index; 
        },
        tokenizer(src) {
          const match = src.match(/^```mermaid\n([\s\S]*?)\n```/);
          if (match) {
            return {
              type: 'mermaid',
              raw: match[0],
              code: match[1]
            };
          }
        },
        renderer(token) {
          return `<div class="mermaid">${token.code}</div>`;
        }
      }]
    });
  }
  
  private buildAST(tokens: Token[]): MarkdownAST {
    return {
      type: 'document',
      children: tokens.map(token => this.tokenToNode(token))
    };
  }
  
  private tokenToNode(token: Token): ASTNode {
    switch (token.type) {
      case 'heading':
        return {
          type: 'heading',
          level: token.depth,
          text: token.text,
          children: this.parseInline(token.text)
        };
      
      case 'mermaid':
        return {
          type: 'mermaid',
          code: token.code,
          language: 'mermaid'
        };
      
      // ... 其他類型
      
      default:
        console.warn(`Unsupported token type: ${token.type}`);
        return null;
    }
  }
}
```

4. 測試
```typescript
// tests/unit/parser.test.ts
import { MarkdownParser } from '@/core/parser';

describe('MarkdownParser', () => {
  const parser = new MarkdownParser();
  
  it('should parse headings', () => {
    const ast = parser.parse('# H1\n## H2');
    expect(ast.children).toHaveLength(2);
    expect(ast.children[0].type).toBe('heading');
    expect(ast.children[0].level).toBe(1);
  });
  
  it('should parse mermaid blocks', () => {
    const markdown = '```mermaid\ngraph TD\nA-->B\n```';
    const ast = parser.parse(markdown);
    expect(ast.children[0].type).toBe('mermaid');
    expect(ast.children[0].code).toContain('graph TD');
  });
});
```

**驗收標準**:
- [ ] 解析所有 CommonMark 語法
- [ ] 解析 GFM 表格、刪除線、任務列表
- [ ] 識別 Mermaid 代碼塊
- [ ] 單元測試覆蓋率 > 80%

---

### ✅ Subtask 1.2: 實作 Mermaid 渲染引擎

**檔案**: `src/core/mermaid-renderer.ts`

**目標**: 將 Mermaid 代碼渲染為 PNG/SVG 圖片

**實作步驟**:

1. 安裝依賴
```bash
npm install puppeteer-core mermaid
```

2. 實作渲染器
```typescript
// src/core/mermaid-renderer.ts
import puppeteer, { Browser, Page } from 'puppeteer-core';
import crypto from 'crypto';

export class MermaidRenderer {
  private browser: Browser | null = null;
  private cache = new Map<string, Buffer>();
  
  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      executablePath: this.getChromiumPath(),
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  
  async render(
    code: string, 
    format: 'png' | 'svg',
    options: MermaidOptions = {}
  ): Promise<Buffer> {
    const cacheKey = this.getCacheKey(code, format, options);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    if (!this.browser) {
      await this.init();
    }
    
    const page = await this.browser!.newPage();
    
    try {
      await this.setupPage(page, options);
      const result = await this.renderOnPage(page, code, format);
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Mermaid render failed:', error);
      throw new MermaidRenderError(code, error);
    } finally {
      await page.close();
    }
  }
  
  private async setupPage(page: Page, options: MermaidOptions) {
    await page.setViewport({ width: 1920, height: 1080 });
    
    const mermaidPath = require.resolve('mermaid/dist/mermaid.min.js');
    await page.addScriptTag({ path: mermaidPath });
    
    await page.evaluate((opts) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: opts.theme || 'default',
        themeVariables: {
          primaryColor: opts.primaryColor || '#3498DB',
          background: opts.background || 'white'
        }
      });
    }, options);
  }
  
  private async renderOnPage(
    page: Page, 
    code: string, 
    format: 'png' | 'svg'
  ): Promise<Buffer> {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="diagram"></div>
        </body>
      </html>
    `);
    
    const { svg } = await page.evaluate(async (code) => {
      return await mermaid.render('diagram', code);
    }, code);
    
    if (format === 'svg') {
      return Buffer.from(svg);
    }
    
    // PNG: 截圖
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body style="margin:0">${svg}</body>
      </html>
    `);
    
    const element = await page.$('svg');
    return await element!.screenshot({ type: 'png' });
  }
  
  private getCacheKey(
    code: string, 
    format: string, 
    options: MermaidOptions
  ): string {
    const hash = crypto.createHash('md5');
    hash.update(code + format + JSON.stringify(options));
    return hash.digest('hex');
  }
  
  private getChromiumPath(): string {
    // 根據平台返回內嵌的 Chromium 路徑
    return process.env.PUPPETEER_EXECUTABLE_PATH || 
           require('puppeteer-core').executablePath();
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export class MermaidRenderError extends Error {
  constructor(public code: string, public cause: any) {
    super(`Failed to render Mermaid diagram`);
  }
}
```

3. 測試
```typescript
// tests/unit/mermaid-renderer.test.ts
describe('MermaidRenderer', () => {
  let renderer: MermaidRenderer;
  
  beforeAll(async () => {
    renderer = new MermaidRenderer();
    await renderer.init();
  });
  
  afterAll(async () => {
    await renderer.close();
  });
  
  it('should render flowchart to PNG', async () => {
    const code = 'graph TD\nA-->B';
    const png = await renderer.render(code, 'png');
    expect(png).toBeInstanceOf(Buffer);
    expect(png.length).toBeGreaterThan(0);
  });
  
  it('should cache renders', async () => {
    const code = 'graph TD\nA-->B';
    const png1 = await renderer.render(code, 'png');
    const png2 = await renderer.render(code, 'png');
    expect(png1).toBe(png2); // 相同引用
  });
});
```

**驗收標準**:
- [ ] 成功渲染 8 種 Mermaid 圖表類型
- [ ] PNG 和 SVG 格式都支援
- [ ] 快取機制運作正常
- [ ] 錯誤處理：渲染失敗拋出 MermaidRenderError

---

### ✅ Subtask 1.3: 實作圖片處理模組

**檔案**: `src/core/image-handler.ts`

**目標**: 處理 Markdown 中的圖片（本地、網路、Base64）

**實作步驟**:

1. 安裝依賴
```bash
npm install sharp axios
```

2. 實作圖片處理器
```typescript
// src/core/image-handler.ts
import sharp from 'sharp';
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

export class ImageHandler {
  constructor(
    private baseDir: string,
    private config: ImageConfig
  ) {}
  
  async processImage(
    src: string,
    alt: string = ''
  ): Promise<ProcessedImage> {
    if (this.isBase64(src)) {
      return this.handleBase64(src, alt);
    }
    
    if (this.isRemote(src)) {
      return this.handleRemote(src, alt);
    }
    
    return this.handleLocal(src, alt);
  }
  
  private async handleLocal(
    src: string,
    alt: string
  ): Promise<ProcessedImage> {
    const resolvedPath = path.resolve(this.baseDir, src);
    
    if (!await this.fileExists(resolvedPath)) {
      return this.createPlaceholder(`圖片未找到: ${src}`);
    }
    
    const buffer = await fs.readFile(resolvedPath);
    
    switch (this.config.relative) {
      case 'embed':
        return {
          type: 'embedded',
          data: buffer,
          alt,
          format: this.getImageFormat(resolvedPath)
        };
      
      case 'copy':
        // 複製到輸出目錄（稍後實作）
        return { type: 'copied', path: resolvedPath, alt };
      
      case 'link':
        return { type: 'linked', url: src, alt };
    }
  }
  
  private async handleRemote(
    url: string,
    alt: string
  ): Promise<ProcessedImage> {
    if (this.config.remote === 'link') {
      return { type: 'linked', url, alt };
    }
    
    if (this.config.remote === 'ask') {
      // 互動式詢問（CLI 層處理）
      throw new ImageProcessingError('Remote image requires user input');
    }
    
    // download
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: this.config.timeout || 10000,
        maxContentLength: this.config.max_size || 10 * 1024 * 1024
      });
      
      const buffer = Buffer.from(response.data);
      
      return {
        type: 'embedded',
        data: buffer,
        alt,
        format: this.detectFormat(buffer)
      };
    } catch (error) {
      console.warn(`Failed to download image: ${url}`, error);
      return this.createPlaceholder(`下載失敗: ${url}`);
    }
  }
  
  private createPlaceholder(message: string): ProcessedImage {
    // 生成 300x200 灰色佔位符
    const svg = `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#ddd"/>
        <text x="150" y="100" text-anchor="middle" 
              font-family="Arial" font-size="14" fill="#666">
          ${message}
        </text>
      </svg>
    `;
    
    return {
      type: 'embedded',
      data: Buffer.from(svg),
      alt: message,
      format: 'svg'
    };
  }
  
  private async convertWebP(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).png().toBuffer();
  }
  
  private isBase64(src: string): boolean {
    return src.startsWith('data:image/');
  }
  
  private isRemote(src: string): boolean {
    return src.startsWith('http://') || src.startsWith('https://');
  }
  
  private getImageFormat(filepath: string): ImageFormat {
    const ext = path.extname(filepath).toLowerCase();
    return ext.slice(1) as ImageFormat;
  }
  
  private detectFormat(buffer: Buffer): ImageFormat {
    // 根據 magic number 偵測格式
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'jpg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'png';
    return 'unknown';
  }
}
```

**驗收標準**:
- [ ] 處理相對路徑、絕對路徑、網路圖片
- [ ] 三種策略（embed/copy/link）正確實作
- [ ] 失效圖片顯示佔位符
- [ ] WebP 自動轉 PNG

---

### ✅ Subtask 1.4-1.6: 實作 Word/PDF 生成器與主題系統

**檔案**: 
- `src/converters/word-converter.ts`
- `src/converters/pdf-converter.ts`
- `src/themes/theme-loader.ts`

**實作詳見技術計劃文檔**

## 驗收標準

- [ ] 所有子任務完成
- [ ] 單元測試通過（覆蓋率 > 80%）
- [ ] 整合測試：Markdown → Word/PDF 完整流程
- [ ] 效能測試：1MB 文檔 < 10 秒

## 相依性

- **阻塞**: 無（可獨立開發）
- **被阻塞**: Task 02（CLI 工具）、Task 03（VSCode 延伸套件）

## 風險

- **Puppeteer 安裝問題**：可能因為網路問題無法下載 Chromium
  - 緩解：提供離線安裝包
  
- **Mermaid 渲染失敗率**：複雜圖表可能渲染失敗
  - 緩解：完整測試 + 保留原始代碼

---

**任務版本**：1.0  
**最後更新**：2025-11-12
