/**
 * PDF Generator using Puppeteer
 * Converts HTML to PDF with proper formatting
 */

import puppeteer, { Browser, PDFOptions } from 'puppeteer';
import type { Md2DocConfig } from '../types/config';

export interface PdfGeneratorOptions {
  pageSize?: 'A4' | 'Letter';
  margin?: string;
  headerFooter?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

export class PdfGenerator {
  private browser: Browser | null = null;
  private initialized: boolean = false;

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
      console.warn('Puppeteer initialization failed for PDF generation.');
      console.warn('To enable PDF generation, install Chrome/Chromium and set PUPPETEER_EXECUTABLE_PATH');
      throw new Error('PDF generation not available. Please ensure Puppeteer is properly configured.');
    }
  }

  /**
   * Generate PDF from HTML
   */
  async generatePdf(html: string, outputPath: string, options: PdfGeneratorOptions = {}): Promise<void> {
    await this.init();

    if (!this.browser) {
      throw new Error('Puppeteer browser not initialized');
    }

    const page = await this.browser.newPage();

    try {
      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      // Prepare PDF options
      const pdfOptions: PDFOptions = {
        path: outputPath,
        format: options.pageSize || 'A4',
        printBackground: true,
        margin: this.parseMargin(options.margin || '2cm'),
        displayHeaderFooter: options.displayHeaderFooter || false
      };

      // Add header/footer if requested
      if (options.displayHeaderFooter) {
        pdfOptions.headerTemplate = options.headerTemplate || this.getDefaultHeaderTemplate();
        pdfOptions.footerTemplate = options.footerTemplate || this.getDefaultFooterTemplate();
      }

      // Generate PDF
      await page.pdf(pdfOptions);

      console.log(`PDF generated: ${outputPath}`);
    } finally {
      await page.close();
    }
  }

  /**
   * Parse margin string to object
   */
  private parseMargin(marginStr: string): { top: string; right: string; bottom: string; left: string } {
    // If it's a single value, use it for all sides
    const parts = marginStr.split(' ');
    
    if (parts.length === 1) {
      return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    } else if (parts.length === 2) {
      return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
    } else if (parts.length === 4) {
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    }
    
    return { top: marginStr, right: marginStr, bottom: marginStr, left: marginStr };
  }

  /**
   * Default header template
   */
  private getDefaultHeaderTemplate(): string {
    return `<div style="font-size: 9px; text-align: center; width: 100%; margin: 0 20px;">
      <span class="title"></span>
    </div>`;
  }

  /**
   * Default footer template with page numbers
   */
  private getDefaultFooterTemplate(): string {
    return `<div style="font-size: 9px; text-align: center; width: 100%; margin: 0 20px;">
      <span class="pageNumber"></span> / <span class="totalPages"></span>
    </div>`;
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
