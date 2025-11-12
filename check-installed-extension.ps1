#!/usr/bin/env pwsh
#Requires -Version 7.0

Write-Host "`n=== 檢查已安裝的 md2doc 擴充套件 ===" -ForegroundColor Cyan

$extensionDir = "C:\Users\Gower\.vscode-insiders\extensions"

if (-not (Test-Path $extensionDir)) {
    Write-Host "❌ VS Code Insiders extensions 目錄不存在" -ForegroundColor Red
    exit 1
}

Write-Host "`n尋找 md2doc 擴充套件..." -ForegroundColor Yellow
$md2docExtensions = Get-ChildItem $extensionDir -Directory | Where-Object { $_.Name -like "*md2doc*" }

if ($md2docExtensions.Count -eq 0) {
    Write-Host "❌ 未找到已安裝的 md2doc 擴充套件" -ForegroundColor Red
    exit 1
}

foreach ($ext in $md2docExtensions) {
    Write-Host "`n找到擴充套件: $($ext.Name)" -ForegroundColor Green
    Write-Host "路徑: $($ext.FullName)" -ForegroundColor Gray

    # 檢查 out 目錄
    $outDir = Join-Path $ext.FullName "out"
    if (Test-Path $outDir) {
        Write-Host "  ✓ out/ 目錄存在" -ForegroundColor Green
        $extensionJs = Join-Path $outDir "extension.js"
        if (Test-Path $extensionJs) {
            Write-Host "  ✓ out/extension.js 存在" -ForegroundColor Green
        }
    } else {
        Write-Host "  ❌ out/ 目錄不存在" -ForegroundColor Red
    }

    # 檢查 node_modules
    $nodeModules = Join-Path $ext.FullName "node_modules"
    if (Test-Path $nodeModules) {
        Write-Host "  ✓ node_modules/ 目錄存在" -ForegroundColor Green

        # 檢查 md2doc 模組
        $md2docModule = Join-Path $nodeModules "md2doc"
        if (Test-Path $md2docModule) {
            Write-Host "  ✓ node_modules/md2doc/ 存在" -ForegroundColor Green

            # 檢查 dist 目錄
            $distDir = Join-Path $md2docModule "dist"
            if (Test-Path $distDir) {
                Write-Host "  ✓ node_modules/md2doc/dist/ 存在" -ForegroundColor Green
            } else {
                Write-Host "  ❌ node_modules/md2doc/dist/ 不存在" -ForegroundColor Red
            }
        } else {
            Write-Host "  ❌ node_modules/md2doc/ 不存在" -ForegroundColor Red
            Write-Host "  這是問題所在！擴充套件找不到 md2doc 核心模組。" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ node_modules/ 目錄不存在" -ForegroundColor Red
    }

    Write-Host ""
}

Write-Host "`n=== 診斷完成 ===" -ForegroundColor Cyan
