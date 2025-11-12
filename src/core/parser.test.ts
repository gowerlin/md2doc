/**
 * Parser Tests
 */

import { MarkdownParser } from '../core/parser';

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  test('parses simple heading', () => {
    const markdown = '# Hello World';
    const ast = parser.parse(markdown);

    expect(ast.type).toBe('document');
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('heading');
    expect((ast.children[0] as any).level).toBe(1);
  });

  test('parses paragraph', () => {
    const markdown = 'This is a paragraph.';
    const ast = parser.parse(markdown);

    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('paragraph');
  });

  test('parses code block', () => {
    const markdown = '```javascript\nconsole.log("hello");\n```';
    const ast = parser.parse(markdown);

    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('codeBlock');
    expect((ast.children[0] as any).language).toBe('javascript');
  });

  test('parses mermaid diagram', () => {
    const markdown = '```mermaid\ngraph TD\nA-->B\n```';
    const ast = parser.parse(markdown);

    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('mermaid');
  });

  test('parses list', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3';
    const ast = parser.parse(markdown);

    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('list');
    expect((ast.children[0] as any).ordered).toBe(false);
    expect((ast.children[0] as any).children).toHaveLength(3);
  });

  test('parses ordered list', () => {
    const markdown = '1. First\n2. Second\n3. Third';
    const ast = parser.parse(markdown);

    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('list');
    expect((ast.children[0] as any).ordered).toBe(true);
  });

  test('parses table', () => {
    const markdown = `| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |`;
    const ast = parser.parse(markdown);

    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('table');
  });

  test('parses blockquote', () => {
    const markdown = '> This is a quote';
    const ast = parser.parse(markdown);

    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('blockquote');
  });

  test('parses horizontal rule', () => {
    const markdown = '---';
    const ast = parser.parse(markdown);

    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('horizontalRule');
  });

  test('parses mixed content', () => {
    const markdown = `# Title

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
const x = 42;
\`\`\`
`;
    const ast = parser.parse(markdown);

    expect(ast.children.length).toBeGreaterThan(3);
    expect(ast.children[0].type).toBe('heading');
    expect(ast.children[1].type).toBe('paragraph');
  });
});
