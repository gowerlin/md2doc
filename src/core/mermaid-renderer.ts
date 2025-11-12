/**
 * Mermaid Renderer
 * Renders Mermaid diagrams to PNG/SVG using Puppeteer
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import * as path from 'path';

export interface MermaidRenderOptions {
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
  scale?: number;
  format?: 'png' | 'svg';
  backgroundColor?: string;
}

export class MermaidRenderer {
  private options: Required<MermaidRenderOptions>;
  private browser: Browser | null = null;
  private initialized: boolean = false;

  constructor(options: MermaidRenderOptions = {}) {
    this.options = {
      theme: options.theme || 'default',
      scale: options.scale || 2,
      format: options.format || 'png',
      backgroundColor: options.backgroundColor || 'white'
    };
  }

  /**
   * Initialize Puppeteer browser
   */
  async init(): Promise<void> {
    if (this.initialized && this.browser) {
      return;
    }

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      });
      this.initialized = true;
    } catch (error) {
      console.warn('Puppeteer initialization failed. Using placeholder mode.');
      console.warn('To enable Mermaid rendering, install Chrome/Chromium and set PUPPETEER_EXECUTABLE_PATH');
      // Don't throw - fall back to placeholder mode
      this.initialized = false;
      this.browser = null;
    }
  }

  /**
   * Render Mermaid code to image buffer
   */
  async render(mermaidCode: string): Promise<Buffer> {
    // Ensure browser is initialized
    await this.init();

    if (!this.browser) {
      console.warn('Puppeteer not available, using placeholder');
      return this.createPlaceholderBuffer(mermaidCode);
    }

    const page = await this.browser.newPage();

    try {
      // Set viewport for rendering
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: this.options.scale
      });

      // Create HTML with Mermaid
      const html = this.createMermaidHtml(mermaidCode);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Wait for Mermaid to render
      await page.waitForSelector('#diagram svg', { timeout: 10000 });

      // Get the SVG element
      const svgElement = await page.$('#diagram svg');
      if (!svgElement) {
        throw new Error('Mermaid diagram not rendered');
      }

      // Get bounding box for proper sizing
      const boundingBox = await svgElement.boundingBox();
      if (!boundingBox) {
        throw new Error('Could not get diagram dimensions');
      }

      let result: Buffer;

      if (this.options.format === 'svg') {
        // Get SVG as text
        const svgContent = await page.$eval('#diagram svg', (el: any) => el.outerHTML);
        result = Buffer.from(svgContent, 'utf-8');
      } else {
        // Take screenshot as PNG
        result = await svgElement.screenshot({
          type: 'png',
          omitBackground: this.options.backgroundColor === 'transparent'
        }) as Buffer;
      }

      return result;
    } catch (error) {
      console.error('Failed to render Mermaid diagram:', error);
      // Return placeholder on error
      return this.createPlaceholderBuffer(mermaidCode);
    } finally {
      await page.close();
    }
  }

  /**
   * Create HTML page with Mermaid
   */
  private createMermaidHtml(code: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ 
      startOnLoad: true,
      theme: '${this.options.theme}',
      securityLevel: 'loose'
    });
  </script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: ${this.options.backgroundColor};
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #diagram {
      max-width: 100%;
    }
  </style>
</head>
<body>
  <div id="diagram" class="mermaid">
${code}
  </div>
</body>
</html>`;
  }

  /**
   * Create a placeholder buffer for development or errors
   */
  private createPlaceholderBuffer(code: string): Buffer {
    const lines = code.trim().split('\n').slice(0, 5);
    const preview = lines.join('\n');
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
        Mermaid Diagram Placeholder
      </text>
      <text x="50%" y="60%" text-anchor="middle" font-family="monospace" font-size="12" fill="#999">
        ${preview.substring(0, 50)}${preview.length > 50 ? '...' : ''}
      </text>
    </svg>`;
    
    return Buffer.from(svg, 'utf-8');
  }

  /**
   * Validate Mermaid syntax
   */
  validate(mermaidCode: string): { valid: boolean; error?: string } {
    // Basic validation
    const trimmed = mermaidCode.trim();
    
    if (!trimmed) {
      return { valid: false, error: 'Empty diagram code' };
    }

    // Check for common diagram types
    const validTypes = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
      'stateDiagram', 'erDiagram', 'gantt', 'pie', 'journey'
    ];

    const firstLine = trimmed.split('\n')[0].trim();
    const hasValidType = validTypes.some(type => firstLine.startsWith(type));

    if (!hasValidType) {
      return { 
        valid: false, 
        error: `Unknown diagram type. Expected one of: ${validTypes.join(', ')}` 
      };
    }

    return { valid: true };
  }

  /**
   * Close browser and cleanup
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.initialized = false;
    }
  }
}
