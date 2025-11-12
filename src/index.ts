/**
 * md2doc - Markdown 多格式轉換工具
 * 將 Markdown 轉換為 Word、PDF 等格式
 */

export { Converter } from './converter';
export { MarkdownParser } from './core/parser';
export { ImageHandler } from './core/image-handler';
export { MermaidRenderer } from './core/mermaid-renderer';
export { ThemeLoader, DEFAULT_THEMES } from './core/theme-loader';
export { WordConverter } from './converters/word-converter';
export { PdfConverter } from './converters/pdf-converter';
export { BatchProcessor } from './cli/batch-processor';
export { ConfigLoader } from './config/config-loader';

export type { 
  MarkdownAST, 
  ASTNode, 
  HeadingNode, 
  ParagraphNode,
  ListNode,
  TableNode,
  CodeBlockNode,
  ImageNode,
  LinkNode
} from './types/ast';

export type {
  Md2DocConfig,
  ThemeConfig,
  ConversionOptions
} from './types/config';
