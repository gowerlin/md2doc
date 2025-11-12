/**
 * Markdown Parser
 * Converts Markdown text into an Abstract Syntax Tree (AST)
 */

import { marked } from 'marked';
import type { Token, Tokens } from 'marked';
import type { MarkdownAST, ASTNode, HeadingNode, ParagraphNode, ListNode, 
  CodeBlockNode, MermaidNode, BlockquoteNode, TableNode, InlineNode, 
  TextNode, LinkNode, ImageNode, HorizontalRuleNode, ListItemNode } from '../types/ast';

export class MarkdownParser {
  constructor() {
    this.configureMarked();
  }

  /**
   * Parse Markdown text into AST
   */
  parse(markdown: string): MarkdownAST {
    const tokens = marked.lexer(markdown);
    const children = this.processTokens(tokens);
    
    return {
      type: 'document',
      children
    };
  }

  /**
   * Configure marked with custom extensions
   */
  private configureMarked(): void {
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: false,
      pedantic: false,
    });
  }

  /**
   * Process marked tokens into our AST format
   */
  private processTokens(tokens: Token[]): ASTNode[] {
    const nodes: ASTNode[] = [];

    for (const token of tokens) {
      const node = this.processToken(token);
      if (node) {
        nodes.push(node);
      }
    }

    return nodes;
  }

  /**
   * Process a single token
   */
  private processToken(token: Token): ASTNode | null {
    switch (token.type) {
      case 'heading':
        return this.processHeading(token as Tokens.Heading);
      
      case 'paragraph':
        return this.processParagraph(token as Tokens.Paragraph);
      
      case 'list':
        return this.processList(token as Tokens.List);
      
      case 'code':
        return this.processCode(token as Tokens.Code);
      
      case 'blockquote':
        return this.processBlockquote(token as Tokens.Blockquote);
      
      case 'table':
        return this.processTable(token as Tokens.Table);
      
      case 'hr':
        return this.processHr();
      
      case 'space':
        return null; // Skip space tokens
      
      default:
        console.warn(`Unhandled token type: ${token.type}`);
        return null;
    }
  }

  private processHeading(token: Tokens.Heading): HeadingNode {
    return {
      type: 'heading',
      level: token.depth as 1 | 2 | 3 | 4 | 5 | 6,
      children: this.processInlineTokens(token.tokens || [])
    };
  }

  private processParagraph(token: Tokens.Paragraph): ParagraphNode {
    return {
      type: 'paragraph',
      children: this.processInlineTokens(token.tokens || [])
    };
  }

  private processList(token: Tokens.List): ListNode {
    return {
      type: 'list',
      ordered: token.ordered,
      start: typeof token.start === 'number' ? token.start : undefined,
      children: token.items.map(item => this.processListItem(item))
    };
  }

  private processListItem(token: Tokens.ListItem): ListItemNode {
    return {
      type: 'listItem',
      checked: token.checked,
      children: this.processTokens(token.tokens)
    };
  }

  private processCode(token: Tokens.Code): CodeBlockNode | MermaidNode {
    // Check if it's a Mermaid diagram
    if (token.lang === 'mermaid') {
      return {
        type: 'mermaid',
        code: token.text
      };
    }

    return {
      type: 'codeBlock',
      language: token.lang || '',
      code: token.text
    };
  }

  private processBlockquote(token: Tokens.Blockquote): BlockquoteNode {
    return {
      type: 'blockquote',
      children: this.processTokens(token.tokens)
    };
  }

  private processTable(token: Tokens.Table): TableNode {
    return {
      type: 'table',
      header: {
        cells: token.header.map(cell => ({
          children: this.processInlineTokens(cell.tokens)
        }))
      },
      rows: token.rows.map(row => ({
        cells: row.map(cell => ({
          children: this.processInlineTokens(cell.tokens)
        }))
      })),
      align: token.align.map(a => a as 'left' | 'center' | 'right' | null)
    };
  }

  private processHr(): HorizontalRuleNode {
    return {
      type: 'horizontalRule'
    };
  }

  /**
   * Process inline tokens (text, links, images, etc.)
   */
  private processInlineTokens(tokens: Token[]): InlineNode[] {
    const nodes: InlineNode[] = [];

    for (const token of tokens) {
      const node = this.processInlineToken(token);
      if (node) {
        nodes.push(node);
      }
    }

    return nodes;
  }

  private processInlineToken(token: Token): InlineNode | null {
    switch (token.type) {
      case 'text':
        return this.processText(token as Tokens.Text);
      
      case 'strong':
        return this.processStrong(token as Tokens.Strong);
      
      case 'em':
        return this.processEm(token as Tokens.Em);
      
      case 'codespan':
        return this.processCodespan(token as Tokens.Codespan);
      
      case 'del':
        return this.processDel(token as Tokens.Del);
      
      case 'link':
        return this.processLink(token as Tokens.Link);
      
      case 'image':
        return this.processImage(token as Tokens.Image);
      
      default:
        // For other inline types, try to extract text
        if ('text' in token) {
          return {
            type: 'text',
            value: (token as any).text
          };
        }
        return null;
    }
  }

  private processText(token: Tokens.Text): TextNode {
    return {
      type: 'text',
      value: token.text
    };
  }

  private processStrong(token: Tokens.Strong): TextNode {
    const text = this.extractText(token.tokens);
    return {
      type: 'text',
      value: text,
      bold: true
    };
  }

  private processEm(token: Tokens.Em): TextNode {
    const text = this.extractText(token.tokens);
    return {
      type: 'text',
      value: text,
      italic: true
    };
  }

  private processCodespan(token: Tokens.Codespan): TextNode {
    return {
      type: 'text',
      value: token.text,
      code: true
    };
  }

  private processDel(token: Tokens.Del): TextNode {
    const text = this.extractText(token.tokens);
    return {
      type: 'text',
      value: text,
      strikethrough: true
    };
  }

  private processLink(token: Tokens.Link): LinkNode {
    return {
      type: 'link',
      url: token.href,
      title: token.title || undefined,
      children: this.processInlineTokens(token.tokens)
    };
  }

  private processImage(token: Tokens.Image): ImageNode {
    return {
      type: 'image',
      url: token.href,
      alt: token.text,
      title: token.title || undefined
    };
  }

  /**
   * Extract plain text from tokens
   */
  private extractText(tokens: Token[]): string {
    return tokens
      .map(token => {
        if ('text' in token) {
          return (token as any).text;
        }
        if (token.type === 'text') {
          return (token as Tokens.Text).text;
        }
        return '';
      })
      .join('');
  }
}
