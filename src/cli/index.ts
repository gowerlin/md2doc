#!/usr/bin/env node

/**
 * CLI Entry Point
 */

import { Command } from 'commander';
import { Converter } from '../converter';
import type { ConversionOptions } from '../types/config';

const program = new Command();

program
  .name('md2doc')
  .description('Markdown 多格式轉換工具 - 將 Markdown 轉換為 Word、PDF 等格式')
  .version('0.1.0');

program
  .command('convert')
  .description('轉換 Markdown 文件')
  .argument('<input>', '輸入的 Markdown 文件路徑')
  .option('-o, --output <path>', '輸出文件路徑')
  .option('-f, --format <format>', '輸出格式 (docx/pdf/both)', 'docx')
  .option('-t, --theme <theme>', '主題 (default/modern/academic/minimal/dark)', 'default')
  .action(async (input: string, options: any) => {
    try {
      const converter = new Converter();
      
      const conversionOptions: ConversionOptions = {
        inputPath: input,
        outputPath: options.output,
        output: {
          format: options.format
        },
        theme: options.theme
      };

      await converter.convert(conversionOptions);
      console.log('✓ 轉換成功！');
    } catch (error) {
      console.error('✗ 轉換失敗:', error);
      process.exit(1);
    }
  });

program
  .command('themes')
  .description('列出可用的主題')
  .action(() => {
    console.log('可用主題:');
    console.log('  - default   (預設主題)');
    console.log('  - modern    (現代風格)');
    console.log('  - academic  (學術風格)');
    console.log('  - minimal   (極簡風格)');
    console.log('  - dark      (深色主題)');
  });

program.parse();
