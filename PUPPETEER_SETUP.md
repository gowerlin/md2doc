# Puppeteer Setup Guide

md2doc uses Puppeteer to render Mermaid diagrams and generate PDF files. This guide explains how to set up Puppeteer for different environments.

## Quick Start

### Option 1: Let Puppeteer Download Chromium (Easiest)

```bash
# Install dependencies (Puppeteer will download Chromium automatically)
npm install
```

This downloads ~170MB of Chromium to `node_modules/puppeteer/.local-chromium/`.

### Option 2: Use System Chrome/Chromium

If you already have Chrome or Chromium installed, you can skip the download:

```bash
# Skip Chromium download
PUPPETEER_SKIP_DOWNLOAD=true npm install

# Set the executable path
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
# or
export PUPPETEER_EXECUTABLE_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
```

## Platform-Specific Installation

### Ubuntu/Debian

```bash
# Install Chromium
sudo apt-get update
sudo apt-get install -y chromium-browser

# Install md2doc with skip download
PUPPETEER_SKIP_DOWNLOAD=true npm install

# Set executable path
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### macOS

```bash
# Install Chrome via Homebrew
brew install --cask google-chrome

# Or Chromium
brew install chromium

# Install md2doc with skip download
PUPPETEER_SKIP_DOWNLOAD=true npm install

# Set executable path
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

### Windows

```powershell
# Install Chrome if not already installed
# Download from: https://www.google.com/chrome/

# Install md2doc with skip download
$env:PUPPETEER_SKIP_DOWNLOAD="true"
npm install

# Set executable path
$env:PUPPETEER_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

### Docker

```dockerfile
FROM node:18

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    && rm -rf /var/lib/apt/lists/*

# Set executable path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install md2doc
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
```

## Environment Variables

### PUPPETEER_EXECUTABLE_PATH

Points to your Chrome/Chromium executable:

```bash
# Linux
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# macOS
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Windows
set PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

### PUPPETEER_SKIP_DOWNLOAD

Prevents Puppeteer from downloading Chromium during installation:

```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

## Troubleshooting

### "Failed to launch Chrome"

**Problem**: Puppeteer can't find Chrome/Chromium

**Solution**: Set the `PUPPETEER_EXECUTABLE_PATH` environment variable

```bash
# Find Chrome on your system
which google-chrome
which chromium
which chromium-browser

# Set the path
export PUPPETEER_EXECUTABLE_PATH=/path/to/chrome
```

### "Error: Failed to download Chromium"

**Problem**: Network issues during Chromium download

**Solution**: Use system Chrome instead

```bash
# Install system Chrome first, then:
PUPPETEER_SKIP_DOWNLOAD=true npm install
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

### Missing Dependencies (Linux)

**Problem**: Chrome crashes with missing library errors

**Solution**: Install required dependencies

```bash
# Debian/Ubuntu
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

## Fallback Mode

If Puppeteer is not available, md2doc will:
- Use placeholder images for Mermaid diagrams
- Generate HTML instead of PDF (for PDF format)

To check if Puppeteer is working:

```bash
# Try converting a file with Mermaid
node dist/cli/index.js convert example.md -o test.pdf

# Check for warnings:
# "Puppeteer initialization failed. Using placeholder mode."  <- Puppeteer not available
# "PDF generated: test.pdf"                                   <- Puppeteer working!
```

## CI/CD Configuration

### GitHub Actions

```yaml
- name: Setup Chrome
  uses: browser-actions/setup-chrome@latest

- name: Install dependencies
  run: |
    export PUPPETEER_SKIP_DOWNLOAD=true
    export PUPPETEER_EXECUTABLE_PATH=$(which chrome)
    npm install

- name: Convert documents
  run: npm run convert
```

### GitLab CI

```yaml
image: node:18

before_script:
  - apt-get update
  - apt-get install -y chromium
  - export PUPPETEER_SKIP_DOWNLOAD=true
  - export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
  - npm install
```

## Performance Tips

1. **Reuse browser instances**: The converter automatically manages browser lifecycle
2. **Batch processing**: Use `batch` command for multiple files (shares browser instance)
3. **Disable headless for debugging**: Set `--headless=false` in Puppeteer launch options (requires code modification)

## Security Considerations

- Puppeteer launches a real browser, which can execute JavaScript
- Only convert trusted Markdown files
- Consider using `--no-sandbox` flag only in trusted environments
- In production, run in isolated containers

## Further Reading

- [Puppeteer Documentation](https://pptr.dev/)
- [Troubleshooting Guide](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md)
- [Mermaid Documentation](https://mermaid.js.org/)
