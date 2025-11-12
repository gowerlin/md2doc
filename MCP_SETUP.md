# md2doc MCP Server Configuration for Claude Desktop

This guide explains how to integrate md2doc with Claude Desktop using the Model Context Protocol (MCP).

## What is MCP?

Model Context Protocol (MCP) allows Claude Desktop to call external tools and services. By configuring md2doc as an MCP server, Claude can convert Markdown files to Word/PDF formats directly.

## Installation

### 1. Install md2doc

```bash
npm install -g md2doc
# or use npx: npx md2doc-mcp
```

### 2. Configure Claude Desktop

Add md2doc to your Claude Desktop configuration file:

**macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "md2doc": {
      "command": "md2doc-mcp",
      "env": {
        "PUPPETEER_EXECUTABLE_PATH": "/usr/bin/google-chrome"
      }
    }
  }
}
```

Or if installed locally:

```json
{
  "mcpServers": {
    "md2doc": {
      "command": "node",
      "args": ["/path/to/md2doc/dist/mcp/server.js"],
      "env": {
        "PUPPETEER_EXECUTABLE_PATH": "/usr/bin/google-chrome"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

After updating the configuration, restart Claude Desktop to load the md2doc MCP server.

## Available Tools

Once configured, Claude can use these tools:

### 1. convert_markdown

Convert a single Markdown file to Word or PDF.

**Parameters:**
- `input` (required): Path to Markdown file
- `output` (optional): Output file path
- `format` (optional): 'docx', 'pdf', or 'both' (default: 'docx')
- `theme` (optional): 'default', 'modern', 'academic', 'minimal', or 'dark'

**Example usage in Claude:**
```
Please convert my document.md to Word format using the modern theme.
```

### 2. batch_convert

Convert multiple Markdown files using glob patterns.

**Parameters:**
- `patterns` (required): Array of file patterns (e.g., ["*.md", "docs/**/*.md"])
- `outputDir` (optional): Output directory
- `format` (optional): Output format
- `theme` (optional): Theme name
- `force` (optional): Overwrite existing files

**Example usage in Claude:**
```
Convert all markdown files in the docs folder to PDF using the academic theme.
```

### 3. list_themes

List all available themes.

**Example usage in Claude:**
```
What themes are available for md2doc?
```

### 4. preview

Generate a preview of the conversion.

**Parameters:**
- `input` (required): File path or markdown content
- `theme` (optional): Theme to use

**Example usage in Claude:**
```
Show me a preview of how my document.md will look with the modern theme.
```

## Usage Examples

### Basic Conversion

```
User: Please convert my report.md to a Word document.

Claude: I'll convert your report.md to Word format.
[Uses convert_markdown tool]
✓ Successfully converted report.md to report.docx
```

### Batch Processing

```
User: Convert all markdown files in the docs folder to PDF.

Claude: I'll batch convert all markdown files in docs to PDF.
[Uses batch_convert tool with pattern "docs/*.md"]
✓ Batch conversion complete
Total files: 5
Successful: 5
```

### Using Themes

```
User: Convert presentation.md to PDF with the modern theme.

Claude: I'll convert your presentation to PDF using the modern theme.
[Uses convert_markdown with format=pdf, theme=modern]
✓ Successfully converted presentation.md to presentation.pdf
```

## Troubleshooting

### Server Not Loading

1. Check Claude Desktop logs:
   - macOS/Linux: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

2. Verify md2doc is installed:
   ```bash
   which md2doc-mcp
   ```

3. Test the MCP server manually:
   ```bash
   md2doc-mcp
   # Should start and wait for input
   ```

### Puppeteer Issues

If PDF or Mermaid rendering fails:

1. Set `PUPPETEER_EXECUTABLE_PATH` in config
2. Install Chrome/Chromium:
   - Ubuntu: `sudo apt-get install chromium-browser`
   - macOS: `brew install --cask google-chrome`

### Permission Issues

Ensure Claude has permission to:
- Read input markdown files
- Write to output directories
- Execute md2doc-mcp

## Environment Variables

You can set these in the Claude configuration:

```json
{
  "mcpServers": {
    "md2doc": {
      "command": "md2doc-mcp",
      "env": {
        "PUPPETEER_EXECUTABLE_PATH": "/usr/bin/google-chrome",
        "PUPPETEER_SKIP_DOWNLOAD": "true",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Advanced Usage

### Custom Themes

You can create custom themes and reference them:

```
User: Convert my document using my custom blue theme located at ./themes/blue.json

Claude: [Uses convert_markdown with theme configuration]
```

### Output Directory Structure

```
User: Convert all docs to PDF and organize by date in output/2024/

Claude: [Uses batch_convert with outputDir parameter]
```

## Security Notes

- Claude can only access files you explicitly mention
- Output files are written with your user permissions
- The MCP server runs locally on your machine
- No data is sent to external servers (except for remote images in markdown)

## Further Reading

- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/mcp)
- [md2doc Documentation](../README.md)
- [Puppeteer Setup Guide](../PUPPETEER_SETUP.md)

## Support

For issues with:
- **md2doc**: Open an issue on GitHub
- **Claude Desktop**: Contact Anthropic support
- **MCP Protocol**: Refer to MCP documentation
