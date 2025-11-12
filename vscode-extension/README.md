# md2doc VSCode Extension

Convert Markdown files to Word (.docx) and PDF formats directly from VSCode with full Mermaid diagram support.

## Features

- **Right-Click Conversion**: Convert Markdown files from the explorer or editor context menu
- **Command Palette**: Access all conversion commands via Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
- **Multiple Formats**: Convert to Word (.docx), PDF, or both
- **Theme Support**: Choose from 5 built-in themes (default, modern, academic, minimal, dark)
- **Batch Conversion**: Convert multiple files at once using glob patterns
- **Mermaid Diagrams**: Full support for all 8 Mermaid diagram types
- **Configuration**: Extensive configuration options
- **Status Bar**: Quick access from the status bar when editing Markdown files

## Installation

### From VSIX (Manual)

1. Download the `.vsix` file
2. Open VSCode
3. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
4. Click "..." menu → "Install from VSIX"
5. Select the downloaded file

### From Source

```bash
cd vscode-extension
npm install
npm run compile
npm run package
```

Then install the generated `.vsix` file.

## Usage

### Convert Single File

**Method 1: Context Menu**
1. Right-click a `.md` file in the Explorer
2. Select "Convert to Word (.docx)" or "Convert to PDF"

**Method 2: Command Palette**
1. Open a Markdown file
2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
3. Type "md2doc" and select a conversion command

**Method 3: Status Bar**
1. Open a Markdown file
2. Click the "md2doc" button in the status bar

### Batch Convert

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "md2doc: Batch Convert Files"
3. Enter glob pattern (e.g., `docs/**/*.md`)
4. Select output format
5. Specify output directory

### Select Theme

1. Open Command Palette
2. Type "md2doc: Select Theme"
3. Choose from available themes
4. Theme will be used for future conversions

### Initialize Configuration

1. Open Command Palette
2. Type "md2doc: Initialize Configuration"
3. A `.md2docrc.yml` file will be created in your workspace

## Configuration

Access settings via File → Preferences → Settings, then search for "md2doc".

### Available Settings

- **md2doc.defaultFormat**: Default output format (`docx`, `pdf`, or `both`)
- **md2doc.defaultTheme**: Default theme for styling documents
- **md2doc.outputDirectory**: Default output directory (empty = same as source)
- **md2doc.autoSave**: Automatically save file before conversion
- **md2doc.showNotifications**: Show success/error notifications
- **md2doc.puppeteerExecutablePath**: Path to Chrome/Chromium (for PDF and Mermaid)
- **md2doc.pdfPageSize**: PDF page size (`A4` or `Letter`)
- **md2doc.pdfMargin**: PDF page margins (e.g., `2cm`)
- **md2doc.mermaidTheme**: Theme for Mermaid diagrams

### Example settings.json

```json
{
  "md2doc.defaultFormat": "docx",
  "md2doc.defaultTheme": "modern",
  "md2doc.outputDirectory": "output/",
  "md2doc.autoSave": true,
  "md2doc.showNotifications": true,
  "md2doc.puppeteerExecutablePath": "/usr/bin/google-chrome",
  "md2doc.pdfPageSize": "A4",
  "md2doc.pdfMargin": "2cm",
  "md2doc.mermaidTheme": "default"
}
```

## Commands

All commands are available in the Command Palette:

- `md2doc: Convert to Word (.docx)` - Convert current file to Word
- `md2doc: Convert to PDF` - Convert current file to PDF
- `md2doc: Convert to Both (Word & PDF)` - Convert to both formats
- `md2doc: Batch Convert Files` - Batch convert multiple files
- `md2doc: Select Theme` - Choose conversion theme
- `md2doc: Initialize Configuration` - Create configuration file

## Themes

### Built-in Themes

- **default**: Standard theme with Arial font
- **modern**: Modern design with Calibri and blue accents
- **academic**: Formal academic style with Times New Roman
- **minimal**: Clean minimalist design with Helvetica
- **dark**: Dark mode theme

## Puppeteer Setup

For PDF generation and Mermaid diagram rendering, Chrome/Chromium is required.

### Installation

**Ubuntu/Debian:**
```bash
sudo apt-get install chromium-browser
```

**macOS:**
```bash
brew install --cask google-chrome
```

**Windows:**
Download from https://www.google.com/chrome/

### Configuration

Set the executable path in VSCode settings:
```json
{
  "md2doc.puppeteerExecutablePath": "/usr/bin/google-chrome"
}
```

Or set environment variable:
```bash
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

## Supported Markdown Features

- Headings (H1-H6)
- Paragraphs with inline formatting (bold, italic, code, strikethrough)
- Lists (ordered and unordered)
- Tables with alignment
- Code blocks with syntax highlighting
- Blockquotes
- Images (local and remote)
- Links
- Horizontal rules
- **Mermaid diagrams** (8 types: flowchart, sequence, class, state, ER, gantt, pie, journey)

## Troubleshooting

### PDF Generation Fails

**Problem**: "Failed to launch Chrome"

**Solution**: Install Chrome/Chromium and set `puppeteerExecutablePath` in settings

### Mermaid Diagrams Not Rendering

**Problem**: Diagrams show as placeholders

**Solution**: Ensure Chrome/Chromium is installed and configured

### Conversion Takes Too Long

**Problem**: Large files are slow to convert

**Solution**: 
- Use batch conversion for multiple files
- Optimize images in your Markdown
- Consider splitting large documents

## Requirements

- VSCode 1.80.0 or higher
- Node.js 18.0.0 or higher (bundled with extension)
- Chrome/Chromium (for PDF and Mermaid features)

## Known Issues

- Large Mermaid diagrams may take time to render
- Remote images require internet connection
- PDF generation requires Chrome/Chromium installation

## Release Notes

### 0.4.0

Initial release with:
- Right-click conversion from explorer
- Command palette integration
- Status bar integration
- Batch conversion support
- Theme selection
- Configuration management
- Full Mermaid diagram support

## Contributing

Issues and pull requests are welcome at: https://github.com/gowerlin/md2doc

## License

MIT License

## Links

- [md2doc CLI Documentation](../README.md)
- [Puppeteer Setup Guide](../PUPPETEER_SETUP.md)
- [MCP Server Guide](../MCP_SETUP.md)
