# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2025-11-12

### Added
- **VSCode Extension**
  - Complete VSCode extension implementation
  - Right-click conversion from Explorer and Editor context menus
  - Command Palette integration with 6 commands:
    - Convert to Word (.docx)
    - Convert to PDF
    - Convert to Both (Word & PDF)
    - Batch Convert Files
    - Select Theme
    - Initialize Configuration
  - Status bar integration for quick access
  - Extensive configuration options through VSCode settings
  - Auto-save before conversion
  - Success/error notifications with "Open File" action
  - Theme selection UI
  - Batch conversion with glob patterns
  - Full integration with core md2doc library
  
- **Documentation**
  - Complete VSCode extension README
  - Installation and usage guides
  - Configuration examples
  - Troubleshooting section
  - Command reference

### Changed
- Version bumped to 0.5.0
- Updated main README with VSCode extension section

## [0.4.0] - 2025-11-12

### Added
- **MCP Server Integration**
  - Full Model Context Protocol (MCP) server implementation
  - Claude Desktop integration support
  - Four MCP tools:
    - `convert_markdown`: Convert single Markdown files
    - `batch_convert`: Batch conversion with glob patterns
    - `list_themes`: List available themes
    - `preview`: Generate conversion previews
  - Comprehensive error handling and validation
  - JSON-based request/response handling
  
- **Claude Integration**
  - Natural language interface for file conversion
  - Automatic tool selection based on user intent
  - Support for all md2doc features through Claude
  - Configuration guide for Claude Desktop
  
- **Documentation**
  - Complete MCP_SETUP.md guide
  - Claude Desktop configuration examples
  - Usage examples and troubleshooting
  - Security and permissions documentation

### Changed
- Added `md2doc-mcp` binary for MCP server
- Updated README with MCP integration section
- Version bumped to 0.4.0

## [0.3.0] - 2025-11-12

### Added
- **Full Puppeteer Integration**
  - Complete Mermaid diagram rendering using Puppeteer and mermaid.js
  - Real-time rendering of all 8 Mermaid diagram types
  - Support for PNG and SVG output formats
  - Configurable themes for Mermaid diagrams
  - Fallback to placeholder mode if Puppeteer unavailable
  
- **PDF Generation**
  - Full PDF generation using Puppeteer (HTML to PDF)
  - Configurable page size (A4, Letter)
  - Customizable margins
  - Optional header and footer support
  - Page numbering support
  - Environment variable support (PUPPETEER_EXECUTABLE_PATH) for custom Chrome/Chromium paths

- **Resource Management**
  - Proper cleanup of Puppeteer browser instances
  - Automatic resource cleanup after conversion
  - Error handling with graceful degradation

### Changed
- Mermaid renderer now uses Puppeteer for real diagram rendering instead of placeholders
- PDF converter now generates actual PDF files instead of HTML
- Converter now properly cleans up resources after conversion
- Updated from `puppeteer-core` to full `puppeteer` package

### Fixed
- Mermaid diagrams now render correctly with proper SVG output
- PDF generation no longer just creates HTML files

## [0.2.0] - 2025-11-12

### Added
- **Configuration System**
  - YAML and JSON configuration file support
  - Auto-detection of config files (.md2docrc.yml, md2doc.config.json, etc.)
  - `init` command to create default configuration file
  - Configuration merging with defaults
  - Configurable output settings, themes, PDF/Word options, Mermaid, and images
  
- **Batch Processing**
  - `batch` command for explicit batch operations
  - Glob pattern support (*.md, **/*.md)
  - Multiple file input support in `convert` command
  - Parallel processing option with `--parallel` flag
  - Progress reporting and batch statistics
  - Auto-create output directories
  - Skip/overwrite handling with `--force` flag
  
- **CLI Enhancements**
  - `--quiet` flag for silent operation
  - `--verbose` flag for detailed logging
  - `--config` flag to specify configuration file
  - `--force` flag to overwrite existing files without prompt
  - Enhanced error reporting

### Changed
- `convert` command now supports multiple input files and glob patterns
- CLI now auto-detects whether to use batch or single file processing
- Improved output path handling for batch operations

## [0.1.0] - 2025-11-12

### Added
- Initial project setup with TypeScript and Jest
- Markdown parser with full CommonMark and GFM support
  - Headings (H1-H6)
  - Paragraphs with inline formatting (bold, italic, code, strikethrough)
  - Lists (ordered and unordered)
  - Tables with alignment
  - Code blocks with syntax highlighting
  - Blockquotes
  - Images (local and remote)
  - Links
  - Horizontal rules
  - Mermaid diagram detection
- Image handler
  - Local image loading
  - Remote image downloading via fetch
  - Image format detection (PNG, JPEG, GIF, WebP)
  - Base64 encoding for embedding
- Theme system
  - 5 default themes: default, modern, academic, minimal, dark
  - Custom theme support
  - Font, color, and spacing configuration
- Word converter (.docx)
  - Complete Markdown syntax support
  - Theme-based styling
  - Using docx library for document generation
- PDF converter
  - HTML generation with styled output
  - Theme-based CSS styling
  - Puppeteer integration pending for PDF generation
- Mermaid renderer (basic framework)
  - Placeholder SVG generation
  - Syntax validation
  - Full rendering with Puppeteer pending
- CLI tool
  - `convert` command for single file conversion
  - `themes` command to list available themes
  - Format selection (docx/pdf/both)
  - Theme selection
  - Output path specification
- Unit tests for parser
  - 10 test cases covering main Markdown syntax
  - All tests passing
- Documentation
  - README with usage instructions
  - DEVELOPMENT guide for contributors
  - Example Markdown file

### Security
- CodeQL security scan integrated
- 0 vulnerabilities detected

## [Unreleased]

### Planned
- Full Puppeteer integration for PDF generation
- Complete Mermaid diagram rendering (8 diagram types)
- Batch processing with glob pattern support
- Configuration file system (YAML/JSON)
- Progress bars for batch operations
- VSCode extension
- MCP Server for Claude integration
- More themes
- Image optimization and resizing
- Advanced table formatting
- Header and footer support for PDF
- Table of contents generation
- Syntax highlighting for code blocks

[0.1.0]: https://github.com/gowerlin/md2doc/releases/tag/v0.1.0
[Unreleased]: https://github.com/gowerlin/md2doc/compare/v0.1.0...HEAD
