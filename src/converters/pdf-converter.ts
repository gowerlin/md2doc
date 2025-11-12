/**
 * PDF Converter
 * Converts AST to PDF format via HTML
 */

import type { MarkdownAST, ASTNode, HeadingNode, ParagraphNode, 
  ListNode, CodeBlockNode, BlockquoteNode, TableNode, InlineNode,
  TextNode, LinkNode, ImageNode } from '../types/ast';
import type { ThemeConfig } from '../types/config';

export class PdfConverter {
  constructor(private theme: ThemeConfig) {}

  /**
   * Convert AST to HTML (which can then be converted to PDF)
   */
  convertToHtml(ast: MarkdownAST): string {
    const bodyContent = this.convertNodes(ast.children);
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${this.generateCss()}
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
  }

  /**
   * Generate CSS based on theme
   */
  private generateCss(): string {
    return `
      body {
        font-family: ${this.theme.fonts?.body || 'Arial'};
        color: ${this.theme.colors?.text || '#000000'};
        background: ${this.theme.colors?.background || '#FFFFFF'};
        line-height: ${this.theme.spacing?.lineHeight || 1.5};
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: ${this.theme.fonts?.heading || 'Arial'};
        color: ${this.theme.colors?.primary || '#333333'};
        margin-top: 24px;
        margin-bottom: 16px;
      }

      h1 { font-size: 32px; }
      h2 { font-size: 24px; }
      h3 { font-size: 20px; }
      h4 { font-size: 16px; }
      h5 { font-size: 14px; }
      h6 { font-size: 12px; }

      p {
        margin-bottom: ${this.theme.spacing?.paragraphSpacing || 10}px;
      }

      code {
        font-family: ${this.theme.fonts?.code || 'Courier New'};
        background: ${this.theme.colors?.code || '#f5f5f5'};
        padding: 2px 6px;
        border-radius: 3px;
      }

      pre {
        background: ${this.theme.colors?.code || '#f5f5f5'};
        padding: 16px;
        border-radius: 4px;
        overflow-x: auto;
      }

      pre code {
        background: none;
        padding: 0;
      }

      blockquote {
        border-left: 4px solid #ddd;
        padding-left: 16px;
        margin-left: 0;
        color: #666;
      }

      table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
      }

      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }

      th {
        background: #f5f5f5;
        font-weight: bold;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 24px 0;
      }

      a {
        color: ${this.theme.colors?.primary || '#0066cc'};
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      ul, ol {
        padding-left: 24px;
        margin-bottom: 16px;
      }

      li {
        margin-bottom: 8px;
      }

      ${this.theme.customCss || ''}
    `;
  }

  /**
   * Convert nodes to HTML
   */
  private convertNodes(nodes: ASTNode[]): string {
    return nodes.map(node => this.convertNode(node)).join('\n');
  }

  /**
   * Convert a single node to HTML
   */
  private convertNode(node: ASTNode): string {
    switch (node.type) {
      case 'heading':
        return this.convertHeading(node as HeadingNode);
      
      case 'paragraph':
        return this.convertParagraph(node as ParagraphNode);
      
      case 'list':
        return this.convertList(node as ListNode);
      
      case 'codeBlock':
        return this.convertCodeBlock(node as CodeBlockNode);
      
      case 'blockquote':
        return this.convertBlockquote(node as BlockquoteNode);
      
      case 'table':
        return this.convertTable(node as TableNode);
      
      case 'horizontalRule':
        return '<hr>';
      
      case 'mermaid':
        return this.convertMermaid(node);
      
      default:
        return '';
    }
  }

  private convertHeading(node: HeadingNode): string {
    const content = this.convertInlineNodes(node.children);
    return `<h${node.level}>${content}</h${node.level}>`;
  }

  private convertParagraph(node: ParagraphNode): string {
    const content = this.convertInlineNodes(node.children);
    return `<p>${content}</p>`;
  }

  private convertList(node: ListNode): string {
    const tag = node.ordered ? 'ol' : 'ul';
    const items = node.children.map(item => {
      const content = item.children
        .map(child => this.convertNode(child))
        .join('');
      return `<li>${content}</li>`;
    }).join('\n');
    
    return `<${tag}>\n${items}\n</${tag}>`;
  }

  private convertCodeBlock(node: CodeBlockNode): string {
    const escaped = this.escapeHtml(node.code);
    return `<pre><code class="language-${node.language}">${escaped}</code></pre>`;
  }

  private convertBlockquote(node: BlockquoteNode): string {
    const content = this.convertNodes(node.children);
    return `<blockquote>${content}</blockquote>`;
  }

  private convertTable(node: TableNode): string {
    const headerCells = node.header.cells
      .map(cell => `<th>${this.convertInlineNodes(cell.children)}</th>`)
      .join('');
    
    const rows = node.rows
      .map(row => {
        const cells = row.cells
          .map(cell => `<td>${this.convertInlineNodes(cell.children)}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('\n');

    return `<table>
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  private convertMermaid(node: any): string {
    // If mermaid has been rendered to an image, display it
    if (node.renderedImage) {
      return `<img src="${node.renderedImage}" alt="Mermaid diagram">`;
    }
    
    // Otherwise show the code
    return `<pre><code class="language-mermaid">${this.escapeHtml(node.code)}</code></pre>`;
  }

  /**
   * Convert inline nodes to HTML
   */
  private convertInlineNodes(nodes: InlineNode[]): string {
    return nodes.map(node => this.convertInlineNode(node)).join('');
  }

  private convertInlineNode(node: InlineNode): string {
    if (node.type === 'text') {
      const textNode = node as TextNode;
      let html = this.escapeHtml(textNode.value);
      
      if (textNode.bold) html = `<strong>${html}</strong>`;
      if (textNode.italic) html = `<em>${html}</em>`;
      if (textNode.code) html = `<code>${html}</code>`;
      if (textNode.strikethrough) html = `<del>${html}</del>`;
      
      return html;
    } else if (node.type === 'link') {
      const linkNode = node as LinkNode;
      const content = this.convertInlineNodes(linkNode.children);
      const title = linkNode.title ? ` title="${this.escapeHtml(linkNode.title)}"` : '';
      return `<a href="${this.escapeHtml(linkNode.url)}"${title}>${content}</a>`;
    } else if (node.type === 'image') {
      const imgNode = node as ImageNode;
      const title = imgNode.title ? ` title="${this.escapeHtml(imgNode.title)}"` : '';
      const src = imgNode.data 
        ? `data:image/png;base64,${imgNode.data.toString('base64')}`
        : this.escapeHtml(imgNode.url);
      return `<img src="${src}" alt="${this.escapeHtml(imgNode.alt)}"${title}>`;
    }
    
    return '';
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
