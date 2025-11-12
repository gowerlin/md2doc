/**
 * Word Converter
 * Converts AST to Word (.docx) format
 */

import { 
  Document, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  ImageRun, ExternalHyperlink
} from 'docx';
import type { MarkdownAST, ASTNode, HeadingNode, ParagraphNode, 
  ListNode, TableNode, CodeBlockNode, BlockquoteNode, InlineNode, 
  TextNode, LinkNode, ImageNode } from '../types/ast';
import type { ThemeConfig } from '../types/config';

export class WordConverter {
  constructor(private theme: ThemeConfig) {}

  /**
   * Convert AST to Word Document
   */
  convert(ast: MarkdownAST): Document {
    const sections = [{
      properties: {},
      children: this.convertNodes(ast.children)
    }];

    return new Document({
      sections
    });
  }

  /**
   * Convert AST nodes to docx elements
   */
  private convertNodes(nodes: ASTNode[]): Paragraph[] {
    const elements: Paragraph[] = [];

    for (const node of nodes) {
      const converted = this.convertNode(node);
      elements.push(...converted);
    }

    return elements;
  }

  /**
   * Convert a single AST node
   */
  private convertNode(node: ASTNode): Paragraph[] {
    switch (node.type) {
      case 'heading':
        return [this.convertHeading(node as HeadingNode)];
      
      case 'paragraph':
        return [this.convertParagraph(node as ParagraphNode)];
      
      case 'list':
        return this.convertList(node as ListNode);
      
      case 'codeBlock':
        return [this.convertCodeBlock(node as CodeBlockNode)];
      
      case 'blockquote':
        return this.convertBlockquote(node as BlockquoteNode);
      
      case 'table':
        return [this.convertTable(node as TableNode)];
      
      case 'horizontalRule':
        return [this.convertHorizontalRule()];
      
      default:
        console.warn(`Unhandled node type: ${(node as any).type}`);
        return [];
    }
  }

  private convertHeading(node: HeadingNode): Paragraph {
    const headingLevels: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
      1: HeadingLevel.HEADING_1,
      2: HeadingLevel.HEADING_2,
      3: HeadingLevel.HEADING_3,
      4: HeadingLevel.HEADING_4,
      5: HeadingLevel.HEADING_5,
      6: HeadingLevel.HEADING_6
    };

    return new Paragraph({
      heading: headingLevels[node.level],
      children: this.convertInlineNodes(node.children),
      spacing: {
        before: 240,
        after: 120
      }
    });
  }

  private convertParagraph(node: ParagraphNode): Paragraph {
    return new Paragraph({
      children: this.convertInlineNodes(node.children),
      spacing: {
        after: this.theme.spacing?.paragraphSpacing ? 
          this.theme.spacing.paragraphSpacing * 20 : 200
      }
    });
  }

  private convertList(node: ListNode): Paragraph[] {
    return node.children.map((item, index) => {
      // Get first paragraph from list item
      const firstPara = item.children.find(c => c.type === 'paragraph') as ParagraphNode | undefined;
      
      if (!firstPara) {
        return new Paragraph({ text: '' });
      }

      return new Paragraph({
        children: this.convertInlineNodes(firstPara.children),
        bullet: node.ordered ? undefined : { level: 0 },
        numbering: node.ordered ? {
          reference: 'default-numbering',
          level: 0
        } : undefined
      });
    });
  }

  private convertCodeBlock(node: CodeBlockNode): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: node.code,
          font: this.theme.fonts?.code || 'Courier New',
          size: 20
        })
      ],
      shading: {
        fill: 'F5F5F5'
      },
      spacing: {
        before: 120,
        after: 120
      }
    });
  }

  private convertBlockquote(node: BlockquoteNode): Paragraph[] {
    const paragraphs = this.convertNodes(node.children);
    
    // Add left border and indent to simulate blockquote
    return paragraphs.map(p => 
      new Paragraph({
        ...p,
        indent: {
          left: 720 // 0.5 inch
        },
        border: {
          left: {
            color: 'CCCCCC',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        }
      })
    );
  }

  private convertTable(node: TableNode): Paragraph {
    // Simplified table conversion
    // For production, use the Table class from docx properly
    const rows = [node.header, ...node.rows];
    const text = rows.map(row => 
      row.cells.map(cell => 
        this.extractPlainText(cell.children)
      ).join(' | ')
    ).join('\n');

    return new Paragraph({
      children: [new TextRun(text)],
      spacing: {
        before: 120,
        after: 120
      }
    });
  }

  private convertHorizontalRule(): Paragraph {
    return new Paragraph({
      border: {
        bottom: {
          color: 'CCCCCC',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6
        }
      },
      spacing: {
        before: 120,
        after: 120
      }
    });
  }

  /**
   * Convert inline nodes to TextRuns
   */
  private convertInlineNodes(nodes: InlineNode[]): (TextRun | ExternalHyperlink)[] {
    const runs: (TextRun | ExternalHyperlink)[] = [];

    for (const node of nodes) {
      if (node.type === 'text') {
        const textNode = node as TextNode;
        runs.push(new TextRun({
          text: textNode.value,
          bold: textNode.bold,
          italics: textNode.italic,
          font: textNode.code ? this.theme.fonts?.code : this.theme.fonts?.body
        }));
      } else if (node.type === 'link') {
        const linkNode = node as LinkNode;
        const linkText = this.extractPlainText(linkNode.children);
        runs.push(
          new ExternalHyperlink({
            link: linkNode.url,
            children: [new TextRun({
              text: linkText,
              style: 'Hyperlink'
            })]
          })
        );
      } else if (node.type === 'image') {
        // Images would require actual image data
        const imgNode = node as ImageNode;
        runs.push(new TextRun({
          text: `[Image: ${imgNode.alt}]`
        }));
      }
    }

    return runs;
  }

  /**
   * Extract plain text from inline nodes
   */
  private extractPlainText(nodes: InlineNode[]): string {
    return nodes
      .map(node => {
        if (node.type === 'text') {
          return (node as TextNode).value;
        } else if (node.type === 'link') {
          return this.extractPlainText((node as LinkNode).children);
        } else if (node.type === 'image') {
          return (node as ImageNode).alt;
        }
        return '';
      })
      .join('');
  }
}
