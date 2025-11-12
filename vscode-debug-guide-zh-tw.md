# VSCode Extension 除錯指南（繁體中文版）

## 📋 開啟開發者工具的步驟

### 步驟 1：開啟命令選擇區
```
按快捷鍵：Ctrl+Shift+P
```

### 步驟 2：輸入命令
在彈出的輸入框中輸入以下任一關鍵字：
- `開發人員`
- `developer`
- `toggle developer`

### 步驟 3：選擇命令
點選：
```
開發人員: 切換開發人員工具
Developer: Toggle Developer Tools
```

### 步驟 4：找到主控台頁籤
開發者工具視窗開啟後，點選上方的：
```
主控台 (Console)
```

## 🎯 你應該會看到什麼

### ✅ 正常情況
在主控台中應該會看到：
```
md2doc extension activated
```

### ❌ 異常情況
如果有錯誤，會顯示紅色文字，例如：
```
Error: Cannot find module 'md2doc'
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:...)
    at ...
```

## 📝 除錯檢查清單

### □ 第 1 步：開啟測試檔案
```
1. 在 VSCode 中開啟：test-vscode-extension.md
2. 確認右下角顯示「Markdown」
```

### □ 第 2 步：開啟開發者工具
```
1. 按 Ctrl+Shift+P
2. 輸入「開發人員」
3. 選擇「切換開發人員工具」
4. 點選「主控台」頁籤
```

### □ 第 3 步：重新載入視窗
```
1. 按 Ctrl+Shift+P
2. 輸入「重新載入」或 "reload"
3. 選擇「開發人員: 重新載入視窗」
```

### □ 第 4 步：檢查啟動訊息
```
在主控台中查看是否有：
✓ "md2doc extension activated"
✗ 紅色錯誤訊息
```

### □ 第 5 步：測試右鍵選單
```
1. 在 test-vscode-extension.md 檔案內容上點右鍵
2. 查看選單中是否有「Convert to Word (.docx)」
```

### □ 第 6 步：測試命令面板
```
1. 按 Ctrl+Shift+P
2. 輸入「md2doc」
3. 應該會看到以下命令：
   - md2doc: Convert to Word (.docx)
   - md2doc: Convert to PDF
   - md2doc: Convert to Both (Word & PDF)
   - md2doc: Batch Convert Files
   - md2doc: Select Theme
   - md2doc: Initialize Configuration
```

### □ 第 7 步：執行轉換並觀察
```
1. 在測試檔案上點右鍵
2. 選擇「Convert to Word (.docx)」
3. 回到主控台視窗
4. 查看是否有新的錯誤訊息
```

## 🔧 常見錯誤訊息對照

### 錯誤 1：找不到模組
```
Error: Cannot find module 'md2doc'
```
**解決方案**：
```bash
# 在專案根目錄執行
npm run build
cd vscode-extension
npm install
```

### 錯誤 2：找不到檔案
```
Error: ENOENT: no such file or directory
```
**解決方案**：檢查檔案路徑是否正確

### 錯誤 3：Puppeteer 錯誤
```
Error: Failed to launch the browser process
```
**解決方案**：
```bash
# 安裝 Chromium
npx puppeteer install
```

## 📸 重要視覺標記

### VSCode 介面位置：
- **命令選擇區**：視窗頂部，按 Ctrl+Shift+P 開啟
- **主控台**：開發者工具視窗的頁籤
- **右鍵選單**：在編輯器內容上點右鍵
- **語言模式**：視窗右下角狀態列

### 快捷鍵對照表：
| 功能 | Windows/Linux | macOS |
|------|--------------|-------|
| 命令選擇區 | Ctrl+Shift+P | Cmd+Shift+P |
| 重新載入視窗 | Ctrl+R | Cmd+R |
| 開發者工具 | Ctrl+Shift+I | Cmd+Option+I |

## 📋 回報格式

如果遇到問題，請提供以下資訊：

```
【VSCode 版本】
說明 → 關於 → 複製版本資訊

【Extension 狀態】
延伸模組 → 搜尋 md2doc → 檢查是否已啟用

【主控台錯誤】
（複製完整的紅色錯誤訊息，包含堆疊追蹤）

【測試步驟】
1. 我做了什麼操作
2. 預期應該發生什麼
3. 實際發生了什麼
```

## 🎯 快速診斷命令

在專案根目錄執行：
```powershell
# PowerShell 診斷腳本
pwsh -File debug-vscode-extension.ps1
```

或手動檢查：
```bash
# 檢查核心模組
node -e "require('./dist/index.js')"

# 檢查 extension 建置
ls vscode-extension/out/extension.js

# 檢查模組連結
cd vscode-extension && npm ls md2doc
```
