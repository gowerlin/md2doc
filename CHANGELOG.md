# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
