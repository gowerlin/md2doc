#!/usr/bin/env node

/**
 * CLI Entry Point
 */

import { Command } from 'commander';
import { Converter } from '../converter';
import { BatchProcessor } from './batch-processor';
import { ConfigLoader } from '../config/config-loader';
import type { ConversionOptions } from '../types/config';

const program = new Command();

program
  .name('md2doc')
  .description('Markdown 多格式轉換工具 - 將 Markdown 轉換為 Word、PDF 等格式')
  .version('0.3.0');

program
  .command('convert')
  .description('轉換 Markdown 文件')
  .argument('<input...>', '輸入的 Markdown 文件路徑（支援多個文件或 glob 模式）')
  .option('-o, --output <path>', '輸出路徑（單文件時為文件路徑，多文件時為目錄）')
  .option('-f, --format <format>', '輸出格式 (docx/pdf/both)', 'docx')
  .option('-t, --theme <theme>', '主題 (default/modern/academic/minimal/dark)', 'default')
  .option('-c, --config <path>', '配置文件路徑')
  .option('--force', '強制覆蓋現有文件', false)
  .option('-q, --quiet', '靜默模式', false)
  .option('--verbose', '詳細輸出', false)
  .action(async (inputs: string[], options: any) => {
    try {
      // Load configuration if specified
      let config;
      if (options.config) {
        const configLoader = new ConfigLoader();
        config = await configLoader.loadConfig(options.config);
      }

      // If multiple files, use batch processor
      if (inputs.length > 1 || inputs[0].includes('*') || inputs[0].includes('?')) {
        const batchProcessor = new BatchProcessor();
        const result = await batchProcessor.processBatch({
          patterns: inputs,
          outputDir: options.output,
          format: options.format,
          theme: options.theme,
          configPath: options.config,
          force: options.force,
          quiet: options.quiet,
          verbose: options.verbose
        });

        if (result.failed > 0) {
          process.exit(1);
        }
      } else {
        // Single file conversion
        const converter = new Converter();
        
        const conversionOptions: ConversionOptions = {
          inputPath: inputs[0],
          outputPath: options.output,
          output: {
            format: options.format
          },
          theme: config?.theme || options.theme
        };

        await converter.convert(conversionOptions);
        console.log('✓ 轉換成功！');
      }
    } catch (error) {
      console.error('✗ 轉換失敗:', error);
      process.exit(1);
    }
  });

program
  .command('batch')
  .description('批次轉換多個 Markdown 文件')
  .argument('<patterns...>', '文件匹配模式（支援 glob）')
  .option('-o, --output <dir>', '輸出目錄')
  .option('-f, --format <format>', '輸出格式 (docx/pdf/both)', 'docx')
  .option('-t, --theme <theme>', '主題')
  .option('--force', '強制覆蓋現有文件', false)
  .option('-q, --quiet', '靜默模式', false)
  .option('--parallel', '使用平行處理', false)
  .action(async (patterns: string[], options: any) => {
    try {
      const batchProcessor = new BatchProcessor();
      
      const result = options.parallel
        ? await batchProcessor.processBatchParallel({
            patterns,
            outputDir: options.output,
            format: options.format,
            theme: options.theme,
            force: options.force,
            quiet: options.quiet
          })
        : await batchProcessor.processBatch({
            patterns,
            outputDir: options.output,
            format: options.format,
            theme: options.theme,
            force: options.force,
            quiet: options.quiet
          });

      if (result.failed > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('✗ 批次轉換失敗:', error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('初始化配置文件')
  .option('-o, --output <path>', '配置文件路徑', '.md2docrc.yml')
  .action(async (options: any) => {
    try {
      const configLoader = new ConfigLoader();
      await configLoader.createDefaultConfigFile(options.output);
    } catch (error) {
      console.error('✗ 創建配置文件失敗:', error);
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
