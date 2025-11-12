# CLI 工具功能規格

## 功能概述

提供命令列介面（CLI），讓使用者透過終端機快速轉換 Markdown 檔案為 Word/PDF 格式，支援批次處理、主題選擇、配置檔案系統。

## 命令介面設計

### 基本命令

```bash
# 基本用法（生成 Word 和 PDF）
md2doc input.md

# 指定單一格式
md2doc input.md --format word
md2doc input.md -f pdf

# 選擇主題
md2doc input.md --theme github
md2doc input.md -t academic

# 指定配置檔
md2doc input.md --config custom.yml
md2doc input.md -c ./.md2docrc.yml

# 覆蓋確認選項
md2doc input.md --force              # 不詢問直接覆蓋
md2doc input.md --no-overwrite       # 自動重新命名避免覆蓋
```

### 批次處理

```bash
# 多個檔案
md2doc file1.md file2.md file3.md

# Glob 模式
md2doc *.md
md2doc docs/**/*.md

# 整個資料夾
md2doc docs/
```

### 工具命令

```bash
# 初始化配置檔（生成 .md2docrc.yml）
md2doc init

# 列出可用主題
md2doc themes

# 顯示版本
md2doc --version
md2doc -v

# 顯示幫助
md2doc --help
md2doc -h
```

## 命令列參數

| 參數 | 短寫 | 類型 | 預設值 | 說明 |
|------|------|------|--------|------|
| `--format` | `-f` | string | `both` | 輸出格式：`word`、`pdf`、`both` |
| `--theme` | `-t` | string | `default` | 主題名稱 |
| `--config` | `-c` | string | - | 配置檔路徑 |
| `--force` | - | boolean | `false` | 強制覆蓋現有檔案 |
| `--no-overwrite` | - | boolean | `false` | 自動重新命名避免覆蓋 |
| `--output` | `-o` | string | - | 輸出目錄（預設同 input） |
| `--quiet` | `-q` | boolean | `false` | 靜默模式（不顯示進度） |
| `--verbose` | - | boolean | `false` | 詳細模式（顯示詳細日誌） |
| `--version` | `-v` | - | - | 顯示版本號 |
| `--help` | `-h` | - | - | 顯示幫助資訊 |

## 配置檔系統

### 配置檔格式

支援 YAML 和 JSON 格式：

**YAML 格式**（`.md2docrc.yml` 或 `.md2docrc.yaml`）：
```yaml
# 輸出格式
format: both                    # word, pdf, both

# 主題選擇
theme: github                   # default, github, academic, professional, minimal

# Mermaid 設定
mermaid:
  background: white             # 背景色
  scale: 2                      # 縮放比例
  timeout: 30000                # 渲染超時（毫秒）

# 圖片處理
images:
  relative: embed               # embed, copy, link
  remote: download              # download, link, ask
  max_size: 10485760           # 最大檔案大小（10MB）
  timeout: 10000               # 下載超時（毫秒）

# 檔案覆蓋策略
overwrite: ask                  # ask, force, rename

# 批次處理
batch:
  parallel: 4                   # 平行處理數量
  continue_on_error: true       # 錯誤時繼續處理

# 輸出選項
output:
  auto_open: false              # 轉換完成後自動開啟
  show_summary: true            # 顯示轉換摘要
```

**JSON 格式**（`.md2docrc.json`）：
```json
{
  "format": "both",
  "theme": "github",
  "mermaid": {
    "background": "white",
    "scale": 2,
    "timeout": 30000
  },
  "images": {
    "relative": "embed",
    "remote": "download",
    "max_size": 10485760,
    "timeout": 10000
  },
  "overwrite": "ask",
  "batch": {
    "parallel": 4,
    "continue_on_error": true
  },
  "output": {
    "auto_open": false,
    "show_summary": true
  }
}
```

### 配置檔載入順序

優先級從高到低：
1. **CLI 參數**：`md2doc input.md --theme academic`
2. **專案配置**：`./md2docrc.yml` 或 `package.json` 中的 `md2doc` 欄位
3. **全域配置**：`~/.md2docrc.yml`
4. **預設值**：內建預設配置

### 初始化配置檔

```bash
$ md2doc init

✨ 初始化 md2doc 配置檔

? 選擇配置檔格式: (Use arrow keys)
❯ YAML (.md2docrc.yml)
  JSON (.md2docrc.json)
  
? 預設輸出格式: (Use arrow keys)
❯ Both (Word + PDF)
  Word only
  PDF only
  
? 預設主題: (Use arrow keys)
❯ Default
  GitHub
  Academic
  Professional
  Minimal

✅ 配置檔已生成：./.md2docrc.yml
```

## 互動式提示

### 檔案覆蓋確認

```bash
$ md2doc guide.md

⚠️  檔案已存在：guide.docx

? 如何處理? (Use arrow keys)
❯ 覆蓋現有檔案
  重新命名為 guide-1.docx
  跳過此檔案
  全部覆蓋（此次轉換）
  取消轉換
```

### 圖片處理選項

當配置為 `images.remote: ask` 時：

```bash
$ md2doc guide.md

ℹ️  發現網路圖片：https://example.com/logo.png

? 如何處理網路圖片? (Use arrow keys)
❯ 下載並嵌入（推薦）
  保留連結（需要網路）
  全部下載（此次轉換）
  全部保留連結（此次轉換）
```

## 批次處理

### 進度顯示

```bash
$ md2doc docs/*.md

📄 開始轉換 15 個檔案...

Converting [████████████░░░░░░░░] 60% | 9/15 files
✓ intro.md → intro.docx, intro.pdf (2.3s)
✓ setup.md → setup.docx, setup.pdf (1.8s)
⚠ advanced.md → advanced.docx, advanced.pdf (4.5s) - 3 warnings
✗ broken.md - Mermaid 渲染失敗

✅ 轉換完成！
   成功：13 個檔案
   警告：1 個檔案
   失敗：1 個檔案
   總耗時：34.2 秒
```

### 錯誤處理

- **繼續處理**（預設）：遇到錯誤時記錄並繼續處理下一個檔案
- **中止處理**（`--strict`）：遇到錯誤立即中止

## 輸出與日誌

### 標準輸出

```bash
$ md2doc guide.md

🚀 md2doc v1.0.0

📄 Processing: guide.md
🎨 Theme: github
📝 Format: both (Word + PDF)

✓ Parsed Markdown (0.2s)
✓ Rendered 3 Mermaid diagrams (2.1s)
✓ Processed 8 images (1.3s)
✓ Generated Word document (0.8s)
✓ Generated PDF document (1.5s)

✅ Done in 5.9s
   📄 guide.docx (245 KB)
   📄 guide.pdf (312 KB)
```

### 詳細模式（--verbose）

```bash
$ md2doc guide.md --verbose

[DEBUG] Loading config from ./.md2docrc.yml
[DEBUG] Config: format=both, theme=github
[INFO]  Parsing Markdown file: guide.md
[DEBUG] Found 15 headings, 8 images, 3 code blocks, 3 mermaid diagrams
[INFO]  Rendering Mermaid diagram 1/3: flowchart
[DEBUG] Mermaid render time: 623ms
[INFO]  Rendering Mermaid diagram 2/3: sequence
[DEBUG] Mermaid render time: 891ms
[INFO]  Processing image: ./images/screenshot.png
[DEBUG] Image embedded as Base64 (145 KB)
[INFO]  Generating Word document...
[DEBUG] Word generation time: 782ms
[INFO]  Generating PDF document...
[DEBUG] PDF generation time: 1456ms
[INFO]  Conversion complete
```

### 靜默模式（--quiet）

```bash
$ md2doc guide.md --quiet
# 無任何輸出（除非發生錯誤）

$ echo $?
0  # 成功退出碼
```

## 退出碼

| 退出碼 | 說明 |
|--------|------|
| 0 | 成功 |
| 1 | 一般錯誤 |
| 2 | 檔案不存在 |
| 3 | 配置錯誤 |
| 4 | 轉換失敗 |
| 130 | 使用者中斷（Ctrl+C） |

## 跨平台支援

### 安裝方式

**方式 1：npm（所有平台）**
```bash
npm install -g md2doc
```

**方式 2：單一執行檔（推薦）**
- Windows: `md2doc.exe`
- macOS: `md2doc` (arm64 / x64)
- Linux: `md2doc` (x64)

下載後放入 PATH 即可使用。

### 路徑處理

- 自動處理 Windows 路徑（`\` vs `/`）
- 支援相對路徑和絕對路徑
- 支援 `~` 展開（使用者目錄）

## 效能優化

- **平行處理**：批次轉換時使用 worker pool（預設 4 個 worker）
- **增量轉換**：檢查檔案修改時間，跳過未變更的檔案（可選）
- **快取機制**：Mermaid 圖表快取，相同代碼重用圖片
- **記憶體控制**：大型文檔分段處理

## 驗收標準

- [ ] 所有命令正常運作，參數解析正確
- [ ] 配置檔系統正常載入，優先級正確
- [ ] 批次處理支援 glob 模式，進度顯示正確
- [ ] 互動式提示（覆蓋、圖片處理）正常運作
- [ ] 跨平台一致（Windows、macOS、Linux）
- [ ] 單一執行檔 < 150MB，包含所有依賴
- [ ] 退出碼正確返回
- [ ] 詳細/靜默模式正常切換

---

**規格版本**：1.0  
**最後更新**：2025-11-12
