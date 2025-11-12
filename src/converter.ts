/**
 * Main Converter
 * Orchestrates the conversion process
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Packer } from 'docx';
import { MarkdownParser } from './core/parser';
import { ImageHandler } from './core/image-handler';
import { MermaidRenderer } from './core/mermaid-renderer';
import { ThemeLoader } from './core/theme-loader';
import { WordConverter } from './converters/word-converter';
import { PdfConverter } from './converters/pdf-converter';
import type { ConversionOptions } from './types/config';
import type { MarkdownAST, ImageNode, MermaidNode } from './types/ast';

export class Converter {
  private parser: MarkdownParser;
  private imageHandler: ImageHandler;
  private mermaidRenderer: MermaidRenderer;
  private themeLoader: ThemeLoader;

  constructor() {
    this.parser = new MarkdownParser();
    this.imageHandler = new ImageHandler();
    this.mermaidRenderer = new MermaidRenderer();
    this.themeLoader = new ThemeLoader();
  }

  /**
   * Convert Markdown file to specified format
   */
  async convert(options: ConversionOptions): Promise<void> {
    // Read input file
    const markdown = await fs.readFile(options.inputPath, 'utf-8');

    // Parse to AST
    let ast = this.parser.parse(markdown);

    // Process images
    ast = await this.processImages(ast, options.inputPath);

    // Process Mermaid diagrams
    ast = await this.processMermaid(ast);

    // Load theme
    const theme = this.themeLoader.loadTheme(options.theme || 'default');

    // Determine output format and path
    const format = options.output?.format || 'docx';
    const outputPath = options.outputPath || this.generateOutputPath(options.inputPath, format);

    // Convert to target format
    if (format === 'docx' || format === 'both') {
      await this.convertToWord(ast, outputPath.replace(/\.(pdf|docx)$/, '.docx'), theme);
    }

    if (format === 'pdf' || format === 'both') {
      await this.convertToPdf(ast, outputPath.replace(/\.(pdf|docx)$/, '.pdf'), theme);
    }

    console.log(`Conversion complete: ${outputPath}`);
  }

  /**
   * Process images in AST
   */
  private async processImages(ast: MarkdownAST, basePath: string): Promise<MarkdownAST> {
    const processNode = async (node: any): Promise<any> => {
      if (node.type === 'image') {
        const imageNode = node as ImageNode;
        const imageData = await this.imageHandler.processImage(imageNode.url, basePath);
        if (imageData) {
          imageNode.data = imageData;
        }
        return imageNode;
      }

      if (node.children) {
        node.children = await Promise.all(
          node.children.map((child: any) => processNode(child))
        );
      }

      return node;
    };

    const processedChildren = await Promise.all(
      ast.children.map(child => processNode(child))
    );

    return {
      ...ast,
      children: processedChildren
    };
  }

  /**
   * Process Mermaid diagrams in AST
   */
  private async processMermaid(ast: MarkdownAST): Promise<MarkdownAST> {
    const processNode = async (node: any): Promise<any> => {
      if (node.type === 'mermaid') {
        const mermaidNode = node as MermaidNode;
        try {
          const imageBuffer = await this.mermaidRenderer.render(mermaidNode.code);
          const dataUri = this.imageHandler.toDataUri(imageBuffer, 'image/svg+xml');
          mermaidNode.renderedImage = dataUri;
        } catch (error) {
          console.error('Failed to render Mermaid diagram:', error);
        }
        return mermaidNode;
      }

      if (node.children) {
        node.children = await Promise.all(
          node.children.map((child: any) => processNode(child))
        );
      }

      return node;
    };

    const processedChildren = await Promise.all(
      ast.children.map(child => processNode(child))
    );

    return {
      ...ast,
      children: processedChildren
    };
  }

  /**
   * Convert AST to Word document
   */
  private async convertToWord(ast: MarkdownAST, outputPath: string, theme: any): Promise<void> {
    const converter = new WordConverter(theme);
    const doc = converter.convert(ast);

    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outputPath, buffer);

    console.log(`Word document created: ${outputPath}`);
  }

  /**
   * Convert AST to PDF document
   */
  private async convertToPdf(ast: MarkdownAST, outputPath: string, theme: any): Promise<void> {
    const converter = new PdfConverter(theme);
    const html = converter.convertToHtml(ast);

    // For now, just save the HTML
    // In production, use puppeteer to convert HTML to PDF
    const htmlPath = outputPath.replace('.pdf', '.html');
    await fs.writeFile(htmlPath, html);

    console.log(`HTML created (PDF conversion requires puppeteer): ${htmlPath}`);
    console.log(`Note: Full PDF support will be added in next iteration`);
  }

  /**
   * Generate output path based on input path and format
   */
  private generateOutputPath(inputPath: string, format: string): string {
    const ext = format === 'both' ? 'docx' : format;
    return inputPath.replace(/\.md$/, `.${ext}`);
  }
}
