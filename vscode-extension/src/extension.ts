/**
 * md2doc VSCode Extension
 * Convert Markdown files to Word and PDF from within VSCode
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Converter, BatchProcessor, ConfigLoader, DEFAULT_THEMES } from 'md2doc';

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('md2doc extension activated');

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('md2doc.convertToWord', () => convertFile('docx')),
        vscode.commands.registerCommand('md2doc.convertToPdf', () => convertFile('pdf')),
        vscode.commands.registerCommand('md2doc.convertToBoth', () => convertFile('both')),
        vscode.commands.registerCommand('md2doc.batchConvert', () => batchConvert()),
        vscode.commands.registerCommand('md2doc.selectTheme', () => selectTheme()),
        vscode.commands.registerCommand('md2doc.initConfig', () => initConfig())
    );

    // Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(file-pdf) md2doc";
    statusBarItem.tooltip = "Convert Markdown to Word/PDF";
    statusBarItem.command = 'md2doc.convertToWord';
    
    // Show status bar only for markdown files
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === 'markdown') {
                statusBarItem.show();
            } else {
                statusBarItem.hide();
            }
        })
    );

    // Show on activation if current file is markdown
    if (vscode.window.activeTextEditor?.document.languageId === 'markdown') {
        statusBarItem.show();
    }

    context.subscriptions.push(statusBarItem);
}

/**
 * Convert current file to specified format
 */
async function convertFile(format: 'docx' | 'pdf' | 'both') {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'markdown') {
        vscode.window.showErrorMessage('Please open a Markdown file to convert');
        return;
    }

    const config = vscode.workspace.getConfiguration('md2doc');
    const inputPath = editor.document.uri.fsPath;

    // Auto-save if configured
    if (config.get('autoSave') && editor.document.isDirty) {
        await editor.document.save();
    }

    // Get theme from config or ask user
    const theme = config.get<string>('defaultTheme') || 'default';
    
    // Determine output path
    const outputDir = config.get<string>('outputDirectory') || path.dirname(inputPath);
    const baseName = path.basename(inputPath, '.md');
    const outputPath = path.join(outputDir, `${baseName}.${format === 'both' ? 'docx' : format}`);

    // Set Puppeteer path if configured
    const puppeteerPath = config.get<string>('puppeteerExecutablePath');
    if (puppeteerPath) {
        process.env.PUPPETEER_EXECUTABLE_PATH = puppeteerPath;
    }

    try {
        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Converting ${path.basename(inputPath)}...`,
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Initializing...' });

            const converter = new Converter();
            
            progress.report({ increment: 30, message: 'Converting...' });
            
            await converter.convert({
                inputPath,
                outputPath,
                output: { 
                    format 
                },
                theme,
                pdf: {
                    pageSize: config.get('pdfPageSize') || 'A4',
                    margin: config.get('pdfMargin') || '2cm',
                    headerFooter: false
                },
                mermaid: {
                    theme: config.get('mermaidTheme') || 'default'
                }
            });

            progress.report({ increment: 100, message: 'Complete!' });
        });

        // Show success message
        if (config.get('showNotifications')) {
            const openAction = 'Open File';
            const result = await vscode.window.showInformationMessage(
                `✓ Converted to ${format.toUpperCase()}: ${path.basename(outputPath)}`,
                openAction
            );

            if (result === openAction) {
                await vscode.env.openExternal(vscode.Uri.file(outputPath));
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Batch convert multiple files
 */
async function batchConvert() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('Please open a workspace folder');
        return;
    }

    // Ask for glob pattern
    const pattern = await vscode.window.showInputBox({
        prompt: 'Enter glob pattern for files to convert',
        placeHolder: 'e.g., **/*.md or docs/**/*.md',
        value: '**/*.md'
    });

    if (!pattern) {
        return;
    }

    // Ask for format
    const format = await vscode.window.showQuickPick(['docx', 'pdf', 'both'], {
        placeHolder: 'Select output format'
    });

    if (!format) {
        return;
    }

    // Ask for output directory
    const outputDir = await vscode.window.showInputBox({
        prompt: 'Enter output directory',
        placeHolder: 'e.g., output/',
        value: 'output/'
    });

    if (!outputDir) {
        return;
    }

    const config = vscode.workspace.getConfiguration('md2doc');
    const theme = config.get<string>('defaultTheme') || 'default';

    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Batch converting files...',
            cancellable: false
        }, async (progress) => {
            const batchProcessor = new BatchProcessor();
            const workspaceRoot = workspaceFolders[0].uri.fsPath;

            progress.report({ increment: 0, message: 'Processing...' });

            const result = await batchProcessor.processBatch({
                patterns: [pattern],
                outputDir: path.join(workspaceRoot, outputDir),
                format: format as any,
                theme,
                quiet: true
            });

            progress.report({ increment: 100, message: 'Complete!' });

            vscode.window.showInformationMessage(
                `✓ Batch conversion complete\nTotal: ${result.total}, Successful: ${result.successful}, Failed: ${result.failed}`
            );
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Batch conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Select theme
 */
async function selectTheme() {
    const themes = [
        { label: 'Default', description: 'Standard theme with Arial font', value: 'default' },
        { label: 'Modern', description: 'Modern design with Calibri and blue accents', value: 'modern' },
        { label: 'Academic', description: 'Formal academic style with Times New Roman', value: 'academic' },
        { label: 'Minimal', description: 'Clean minimalist design with Helvetica', value: 'minimal' },
        { label: 'Dark', description: 'Dark mode theme', value: 'dark' }
    ];

    const selected = await vscode.window.showQuickPick(themes, {
        placeHolder: 'Select a theme for document conversion'
    });

    if (selected) {
        const config = vscode.workspace.getConfiguration('md2doc');
        await config.update('defaultTheme', selected.value, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Theme set to: ${selected.label}`);
    }
}

/**
 * Initialize configuration file
 */
async function initConfig() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('Please open a workspace folder');
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const configPath = path.join(workspaceRoot, '.md2docrc.yml');

    if (fs.existsSync(configPath)) {
        const overwrite = await vscode.window.showWarningMessage(
            'Configuration file already exists. Overwrite?',
            'Yes', 'No'
        );
        
        if (overwrite !== 'Yes') {
            return;
        }
    }

    const defaultConfig = `# md2doc 配置文件

# 輸出設定
output:
  format: docx              # 輸出格式：docx, pdf, both
  directory: .              # 輸出目錄
  overwrite: false          # 是否覆蓋現有文件

# 主題
theme: default              # 可選：default, modern, academic, minimal, dark

# PDF 設定
pdf:
  pageSize: A4              # 頁面大小：A4, Letter
  margin: 2cm               # 頁面邊距
  headerFooter: false       # 是否包含頁首頁尾

# Word 設定
docx:
  pageSize: A4              # 頁面大小：A4, Letter

# Mermaid 圖表設定
mermaid:
  theme: default            # 主題：default, dark, forest, neutral
  scale: 2                  # 縮放比例

# 圖片處理設定
images:
  maxWidth: 800             # 最大寬度（像素）
  quality: 85               # 圖片品質 (1-100)
  embedLocal: true          # 是否嵌入本地圖片
`;

    fs.writeFileSync(configPath, defaultConfig, 'utf-8');
    
    const openAction = 'Open Config';
    const result = await vscode.window.showInformationMessage(
        `✓ Configuration file created: .md2docrc.yml`,
        openAction
    );

    if (result === openAction) {
        const doc = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(doc);
    }
}

/**
 * Extension deactivation
 */
export function deactivate() {
    console.log('md2doc extension deactivated');
}
