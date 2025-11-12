#!/usr/bin/env node

/**
 * MCP Server for md2doc
 * Implements Model Context Protocol for AI assistant integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Converter } from '../converter.js';
import { BatchProcessor } from '../cli/batch-processor.js';
import { ThemeLoader, DEFAULT_THEMES } from '../core/theme-loader.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * MCP Server for md2doc
 */
class Md2docMCPServer {
  private server: Server;
  private converter: Converter;
  private batchProcessor: BatchProcessor;
  private themeLoader: ThemeLoader;

  constructor() {
    this.server = new Server(
      {
        name: 'md2doc',
        version: '0.3.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.converter = new Converter();
    this.batchProcessor = new BatchProcessor();
    this.themeLoader = new ThemeLoader();

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * Setup tool request handlers
   */
  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'convert_markdown':
            return await this.handleConvert(args);
          
          case 'batch_convert':
            return await this.handleBatchConvert(args);
          
          case 'list_themes':
            return await this.handleListThemes(args);
          
          case 'preview':
            return await this.handlePreview(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Get available tools
   */
  private getTools(): Tool[] {
    return [
      {
        name: 'convert_markdown',
        description: 'Convert a Markdown file to Word (.docx) or PDF format. Supports full Markdown syntax including tables, code blocks, and Mermaid diagrams.',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'Path to the input Markdown file',
            },
            output: {
              type: 'string',
              description: 'Path for the output file (optional, defaults to same name with new extension)',
            },
            format: {
              type: 'string',
              enum: ['docx', 'pdf', 'both'],
              description: 'Output format: docx (Word), pdf, or both',
              default: 'docx',
            },
            theme: {
              type: 'string',
              enum: ['default', 'modern', 'academic', 'minimal', 'dark'],
              description: 'Theme to use for styling',
              default: 'default',
            },
          },
          required: ['input'],
        },
      },
      {
        name: 'batch_convert',
        description: 'Convert multiple Markdown files at once using glob patterns. Supports batch processing with progress reporting.',
        inputSchema: {
          type: 'object',
          properties: {
            patterns: {
              type: 'array',
              items: { type: 'string' },
              description: 'File patterns to match (e.g., ["*.md", "docs/**/*.md"])',
            },
            outputDir: {
              type: 'string',
              description: 'Output directory for converted files',
            },
            format: {
              type: 'string',
              enum: ['docx', 'pdf', 'both'],
              description: 'Output format',
              default: 'docx',
            },
            theme: {
              type: 'string',
              description: 'Theme to use',
            },
            force: {
              type: 'boolean',
              description: 'Overwrite existing files without prompting',
              default: false,
            },
          },
          required: ['patterns'],
        },
      },
      {
        name: 'list_themes',
        description: 'List all available themes with their descriptions. Themes control the styling and appearance of generated documents.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'preview',
        description: 'Generate a preview of how the Markdown will be converted. Returns HTML preview.',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'Path to the Markdown file or markdown content',
            },
            theme: {
              type: 'string',
              description: 'Theme to use for preview',
              default: 'default',
            },
          },
          required: ['input'],
        },
      },
    ];
  }

  /**
   * Handle convert_markdown tool call
   */
  private async handleConvert(args: any): Promise<any> {
    const { input, output, format = 'docx', theme = 'default' } = args;

    // Validate input file exists
    if (!fs.existsSync(input)) {
      throw new Error(`Input file not found: ${input}`);
    }

    await this.converter.convert({
      inputPath: input,
      outputPath: output,
      output: { format },
      theme,
    });

    const outputFile = output || input.replace(/\.md$/, `.${format === 'both' ? 'docx' : format}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `✓ Successfully converted ${input} to ${outputFile}\nFormat: ${format}\nTheme: ${theme}`,
        },
      ],
    };
  }

  /**
   * Handle batch_convert tool call
   */
  private async handleBatchConvert(args: any): Promise<any> {
    const { patterns, outputDir, format = 'docx', theme, force = false } = args;

    const result = await this.batchProcessor.processBatch({
      patterns,
      outputDir,
      format,
      theme,
      force,
      quiet: true, // Run quietly for MCP
    });

    return {
      content: [
        {
          type: 'text',
          text: `✓ Batch conversion complete\n` +
                `Total files: ${result.total}\n` +
                `Successful: ${result.successful}\n` +
                `Failed: ${result.failed}\n` +
                `Skipped: ${result.skipped}`,
        },
      ],
    };
  }

  /**
   * Handle list_themes tool call
   */
  private async handleListThemes(args: any): Promise<any> {
    const themes = this.themeLoader.listThemes();
    const themeDescriptions: Record<string, string> = {
      default: 'Standard theme with Arial font, suitable for general documents',
      modern: 'Modern design with Calibri font and blue accents',
      academic: 'Formal academic style with Times New Roman',
      minimal: 'Clean and minimalist design with Helvetica',
      dark: 'Dark mode theme for better readability in low-light environments',
    };

    const themeList = themes.map(t => {
      const info = this.themeLoader.getThemeInfo(t);
      return `- ${t}: ${themeDescriptions[t] || 'Custom theme'}`;
    }).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `Available themes:\n\n${themeList}\n\nUse any of these themes with the 'theme' parameter in convert_markdown or batch_convert.`,
        },
      ],
    };
  }

  /**
   * Handle preview tool call
   */
  private async handlePreview(args: any): Promise<any> {
    const { input, theme = 'default' } = args;

    // Check if input is a file or content
    let markdown: string;
    if (fs.existsSync(input)) {
      markdown = fs.readFileSync(input, 'utf-8');
    } else {
      markdown = input;
    }

    // Parse and generate preview
    const { MarkdownParser } = await import('../core/parser.js');
    const { PdfConverter } = await import('../converters/pdf-converter.js');
    
    const parser = new MarkdownParser();
    const ast = parser.parse(markdown);
    
    const themeConfig = this.themeLoader.loadTheme(theme);
    const pdfConverter = new PdfConverter(themeConfig);
    const html = pdfConverter.convertToHtml(ast);

    return {
      content: [
        {
          type: 'text',
          text: `Preview generated with theme: ${theme}\n\nHTML Preview:\n${html.substring(0, 500)}...\n\n(Showing first 500 characters)`,
        },
      ],
    };
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('md2doc MCP server running on stdio');
  }
}

// Start server
const server = new Md2docMCPServer();
server.start().catch(console.error);
