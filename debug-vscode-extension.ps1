#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    VSCode Extension 除錯診斷工具
.DESCRIPTION
    自動檢測 md2doc VSCode extension 的安裝和執行狀態
#>

Write-Host "`n=== md2doc VSCode Extension 診斷工具 ===" -ForegroundColor Cyan
Write-Host "開始診斷..." -ForegroundColor Yellow

# 1. 檢查 VSCode 是否安裝
Write-Host "`n[1/7] 檢查 VSCode 安裝..." -ForegroundColor Green
$vscodeCmd = Get-Command code -ErrorAction SilentlyContinue
if ($vscodeCmd) {
    Write-Host "  ✓ VSCode 已安裝: $($vscodeCmd.Source)" -ForegroundColor Green
} else {
    Write-Host "  ✗ VSCode 未安裝或未加入 PATH" -ForegroundColor Red
    exit 1
}

# 2. 檢查 Extension 是否安裝
Write-Host "`n[2/7] 檢查 Extension 安裝狀態..." -ForegroundColor Green
$extensions = code --list-extensions 2>&1
if ($extensions -match "md2doc") {
    Write-Host "  ✓ md2doc extension 已安裝" -ForegroundColor Green
    $extensionPath = "$env:USERPROFILE\.vscode\extensions"
    $md2docExtensions = Get-ChildItem $extensionPath -Directory | Where-Object { $_.Name -like "*md2doc*" }
    if ($md2docExtensions) {
        Write-Host "  ✓ Extension 路徑: $($md2docExtensions[0].FullName)" -ForegroundColor Green
    }
} else {
    Write-Host "  ✗ md2doc extension 未找到" -ForegroundColor Red
    Write-Host "  提示: 請使用以下命令安裝 .vsix 檔案:" -ForegroundColor Yellow
    Write-Host "  code --install-extension vscode-extension\md2doc-vscode-0.4.0.vsix" -ForegroundColor Yellow
}

# 3. 檢查核心模組建置
Write-Host "`n[3/7] 檢查核心模組建置..." -ForegroundColor Green
if (Test-Path "dist\index.js") {
    Write-Host "  ✓ 核心模組已建置: dist\index.js" -ForegroundColor Green

    # 測試模組載入
    $testLoad = node -e "try { require('./dist/index.js'); console.log('OK'); } catch(e) { console.error('ERROR:', e.message); }" 2>&1
    if ($testLoad -match "OK") {
        Write-Host "  ✓ 核心模組可正常載入" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 核心模組載入失敗: $testLoad" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ 核心模組未建置" -ForegroundColor Red
    Write-Host "  請執行: npm run build" -ForegroundColor Yellow
}

# 4. 檢查 VSCode Extension 建置
Write-Host "`n[4/7] 檢查 Extension 建置..." -ForegroundColor Green
if (Test-Path "vscode-extension\out\extension.js") {
    Write-Host "  ✓ Extension 已建置: vscode-extension\out\extension.js" -ForegroundColor Green
} else {
    Write-Host "  ✗ Extension 未建置" -ForegroundColor Red
    Write-Host "  請執行: cd vscode-extension && npm run compile" -ForegroundColor Yellow
}

# 5. 檢查 node_modules 連結
Write-Host "`n[5/7] 檢查模組連結..." -ForegroundColor Green
if (Test-Path "vscode-extension\node_modules\md2doc") {
    Write-Host "  ✓ md2doc 模組已連結" -ForegroundColor Green
    $linkInfo = npm ls md2doc --prefix vscode-extension 2>&1
    Write-Host "  連結資訊: $linkInfo" -ForegroundColor Gray
} else {
    Write-Host "  ✗ md2doc 模組未連結" -ForegroundColor Red
    Write-Host "  請執行: cd vscode-extension && npm install" -ForegroundColor Yellow
}

# 6. 檢查相依套件
Write-Host "`n[6/7] 檢查相依套件..." -ForegroundColor Green
$missingDeps = @()

# 檢查核心套件
$coreDeps = @("docx", "marked", "puppeteer", "yaml")
foreach ($dep in $coreDeps) {
    if (-not (Test-Path "node_modules\$dep")) {
        $missingDeps += $dep
    }
}

if ($missingDeps.Count -eq 0) {
    Write-Host "  ✓ 所有核心套件已安裝" -ForegroundColor Green
} else {
    Write-Host "  ✗ 缺少套件: $($missingDeps -join ', ')" -ForegroundColor Red
    Write-Host "  請執行: npm install" -ForegroundColor Yellow
}

# 7. 測試檔案檢查
Write-Host "`n[7/7] 檢查測試檔案..." -ForegroundColor Green
if (Test-Path "test-vscode-extension.md") {
    Write-Host "  ✓ 測試檔案已建立: test-vscode-extension.md" -ForegroundColor Green
    Write-Host "  請在 VSCode 中開啟此檔案進行測試" -ForegroundColor Yellow
} else {
    Write-Host "  ℹ 測試檔案不存在（非必要）" -ForegroundColor Gray
}

# 總結和建議
Write-Host "`n=== 診斷完成 ===" -ForegroundColor Cyan
Write-Host "`n下一步除錯建議:" -ForegroundColor Yellow
Write-Host "1. 在 VSCode 中開啟測試檔案: test-vscode-extension.md" -ForegroundColor White
Write-Host "2. 按 F1 或 Ctrl+Shift+P 開啟命令面板" -ForegroundColor White
Write-Host "3. 輸入 'Developer: Toggle Developer Tools' 開啟開發者工具" -ForegroundColor White
Write-Host "4. 查看 Console 頁籤中的錯誤訊息" -ForegroundColor White
Write-Host "5. 在測試檔案上點右鍵，選擇 'Convert to Word (.docx)'" -ForegroundColor White
Write-Host "6. 觀察是否有錯誤訊息或進度通知" -ForegroundColor White

Write-Host "`n如果遇到問題，請提供:" -ForegroundColor Yellow
Write-Host "- Console 中的錯誤訊息（完整堆疊追蹤）" -ForegroundColor White
Write-Host "- Extension 版本資訊" -ForegroundColor White
Write-Host "- VSCode 版本資訊" -ForegroundColor White

Write-Host "`n診斷工具執行完畢`n" -ForegroundColor Cyan
