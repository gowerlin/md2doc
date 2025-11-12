/**
 * AST Node Types for Markdown Document
 */

export interface MarkdownAST {
  type: 'document';
  children: ASTNode[];
}

export type ASTNode =
  | HeadingNode
  | ParagraphNode
  | ListNode
  | ListItemNode
  | TableNode
  | CodeBlockNode
  | ImageNode
  | LinkNode
  | BlockquoteNode
  | MermaidNode
  | TextNode
  | HorizontalRuleNode;

export interface HeadingNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
}

export interface ParagraphNode {
  type: 'paragraph';
  children: InlineNode[];
}

export interface ListNode {
  type: 'list';
  ordered: boolean;
  start?: number;
  children: ListItemNode[];
}

export interface ListItemNode {
  type: 'listItem';
  checked?: boolean; // for task lists
  children: ASTNode[];
}

export interface TableNode {
  type: 'table';
  header: TableRow;
  rows: TableRow[];
  align: ('left' | 'center' | 'right' | null)[];
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableCell {
  children: InlineNode[];
}

export interface CodeBlockNode {
  type: 'codeBlock';
  language: string;
  code: string;
}

export interface MermaidNode {
  type: 'mermaid';
  code: string;
  renderedImage?: string; // base64 or file path after rendering
}

export interface ImageNode {
  type: 'image';
  url: string;
  alt: string;
  title?: string;
  data?: Buffer; // processed image data
}

export interface LinkNode {
  type: 'link';
  url: string;
  title?: string;
  children: InlineNode[];
}

export interface BlockquoteNode {
  type: 'blockquote';
  children: ASTNode[];
}

export interface TextNode {
  type: 'text';
  value: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strikethrough?: boolean;
}

export interface HorizontalRuleNode {
  type: 'horizontalRule';
}

export type InlineNode = TextNode | LinkNode | ImageNode;
