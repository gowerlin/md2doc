# 主題系統功能規格

## 功能概述

提供主題系統讓使用者自訂 Word/PDF 輸出的樣式，包含 5 個預設主題和自訂主題支援。

## 預設主題

### 1. Default（預設）

**風格**：簡潔現代，適合大多數文檔

```json
{
  "name": "default",
  "displayName": "Default",
  "description": "簡潔現代風格",
  "word": {
    "fonts": {
      "heading": "Arial",
      "body": "Arial",
      "code": "Consolas"
    },
    "colors": {
      "heading": "#2C3E50",
      "body": "#333333",
      "code": "#555555",
      "code_bg": "#F5F5F5",
      "link": "#3498DB"
    },
    "sizes": {
      "h1": 28,
      "h2": 24,
      "h3": 20,
      "h4": 18,
      "h5": 16,
      "h6": 14,
      "body": 12,
      "code": 10
    },
    "spacing": {
      "line_height": 1.5,
      "paragraph": 12
    }
  },
  "pdf": {
    "css": "themes/default.css"
  }
}
```

### 2. GitHub

**風格**：類似 GitHub README，技術文檔風格

- 標題使用深灰色（`#24292e`）
- 代碼塊淺灰背景（`#f6f8fa`）
- 連結藍色（`#0366d6`）
- 引用左側藍色邊框

### 3. Academic

**風格**：學術論文風格，正式專業

- Times New Roman 字體
- 雙欄排版（PDF）
- 頁首頁尾
- 腳註支援
- 目錄自動生成

### 4. Professional

**風格**：商務文件風格，適合報告簡報

- 品牌色系支援
- 頁首Logo
- 浮水印選項
- 封面頁模板

### 5. Minimal

**風格**：極簡黑白，適合列印

- 黑白配色
- 無裝飾元素
- 節省墨水
- 高對比度

## 主題檔案結構

```json
{
  "name": "theme-id",
  "displayName": "主題顯示名稱",
  "description": "主題描述",
  "author": "作者",
  "version": "1.0.0",
  
  "word": {
    "fonts": {
      "heading": "字體名稱",
      "body": "字體名稱",
      "code": "字體名稱"
    },
    "colors": {
      "heading": "#HEX",
      "body": "#HEX",
      "code": "#HEX",
      "code_bg": "#HEX",
      "link": "#HEX",
      "quote_border": "#HEX"
    },
    "sizes": {
      "h1": 28,
      "h2": 24,
      "h3": 20,
      "h4": 18,
      "h5": 16,
      "h6": 14,
      "body": 12,
      "code": 10
    },
    "spacing": {
      "line_height": 1.5,
      "paragraph": 12,
      "heading_before": 24,
      "heading_after": 12
    },
    "borders": {
      "table": "single",
      "code_block": false,
      "quote": "left"
    },
    "options": {
      "table_of_contents": false,
      "page_numbers": false,
      "header": null,
      "footer": null
    }
  },
  
  "pdf": {
    "css": "path/to/custom.css",
    "paper": "A4",
    "margins": {
      "top": 20,
      "right": 20,
      "bottom": 20,
      "left": 20
    },
    "header": {
      "enabled": false,
      "template": "<div>Header</div>"
    },
    "footer": {
      "enabled": false,
      "template": "<div>Page <span class='pageNumber'></span></div>"
    }
  },
  
  "mermaid": {
    "theme": "default",
    "background": "white",
    "primary_color": "#3498DB",
    "secondary_color": "#2C3E50"
  }
}
```

## 自訂主題

### 使用者主題目錄

```
~/.md2doc/themes/
├── my-theme.theme.json
├── my-theme.css (for PDF)
└── corporate/
    ├── corporate.theme.json
    ├── corporate.css
    └── logo.png
```

### 載入順序

1. 內建主題（`/themes/`）
2. 全域主題（`~/.md2doc/themes/`）
3. 專案主題（`./themes/`）

### 主題繼承

```json
{
  "name": "my-custom",
  "extends": "github",
  "word": {
    "colors": {
      "heading": "#FF5733"
    }
  }
}
```

## CLI 命令

### 列出主題

```bash
$ md2doc themes

📚 可用主題：

內建主題：
  • default      - 簡潔現代風格
  • github       - GitHub README 風格
  • academic     - 學術論文風格
  • professional - 商務文件風格
  • minimal      - 極簡黑白風格

使用者主題：
  • my-theme     - 我的自訂主題
  • corporate    - 公司品牌主題

使用方式：
  md2doc input.md --theme github
```

### 預覽主題

```bash
$ md2doc preview --theme academic

[開啟瀏覽器顯示主題預覽]
```

### 匯出主題

```bash
$ md2doc theme export github > my-github.theme.json

# 編輯後使用
$ md2doc input.md --theme ./my-github.theme.json
```

## VSCode 整合

### 主題選擇器

- Command Palette：`md2doc: Select Theme`
- 下拉選單顯示所有可用主題
- 即時預覽效果

### 主題設定

```json
{
  "md2doc.defaultTheme": "github",
  "md2doc.customThemes": [
    "/path/to/my-theme.theme.json"
  ]
}
```

## 主題開發指南

### 最佳實踐

1. **字體選擇**：
   - 確保跨平台可用（Arial、Times New Roman、Courier New）
   - 提供備用字體（font-family fallback）

2. **顏色對比**：
   - 確保文字可讀性（對比度 > 4.5:1）
   - 支援黑白列印

3. **間距設定**：
   - 行高 1.4-1.8 較適合閱讀
   - 段落間距適度（8-16pt）

4. **測試**：
   - 在不同 Word/PDF 閱讀器測試
   - 測試列印效果

### 範例：建立自訂主題

```bash
# 1. 匯出預設主題作為基礎
$ md2doc theme export default > my-theme.theme.json

# 2. 編輯 JSON 檔案
$ nano my-theme.theme.json

# 3. 測試主題
$ md2doc sample.md --theme ./my-theme.theme.json

# 4. 安裝到全域
$ md2doc theme install ./my-theme.theme.json

✅ 主題已安裝：~/.md2doc/themes/my-theme.theme.json
```

## 驗收標準

- [ ] 5 個預設主題完整實作，樣式正確
- [ ] 主題檔案 JSON 格式正確解析
- [ ] 自訂主題載入正常，優先級正確
- [ ] 主題繼承機制運作正常
- [ ] `md2doc themes` 列出所有可用主題
- [ ] VSCode 主題選擇器正常運作
- [ ] Word 和 PDF 輸出樣式與主題定義一致
- [ ] 跨平台字體正確顯示

## 相依性

- Word 樣式：docx 庫的樣式 API
- PDF 樣式：自訂 CSS + Puppeteer
- 主題載入：fs + JSON 解析

---

**規格版本**：1.0  
**最後更新**：2025-11-12
