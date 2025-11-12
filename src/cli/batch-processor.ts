/**
 * Batch Processor
 * Handles batch conversion of multiple files
 */

import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { Converter } from '../converter';
import type { ConversionOptions } from '../types/config';

export interface BatchOptions {
  patterns: string[];
  outputDir?: string;
  format?: 'docx' | 'pdf' | 'both';
  theme?: string;
  configPath?: string;
  force?: boolean;
  quiet?: boolean;
  verbose?: boolean;
}

export interface BatchResult {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  results: FileResult[];
}

export interface FileResult {
  input: string;
  output?: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
  duration?: number;
}

export class BatchProcessor {
  private converter: Converter;

  constructor() {
    this.converter = new Converter();
  }

  /**
   * Process multiple files in batch
   */
  async processBatch(options: BatchOptions): Promise<BatchResult> {
    const startTime = Date.now();

    // Find all files matching patterns
    const files = await this.findFiles(options.patterns);

    if (files.length === 0) {
      console.log('No files found matching the patterns');
      return {
        total: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        results: []
      };
    }

    if (!options.quiet) {
      console.log(`Found ${files.length} file(s) to convert`);
    }

    const results: FileResult[] = [];
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!options.quiet) {
        console.log(`\n[${i + 1}/${files.length}] Processing: ${file}`);
      }

      const fileStartTime = Date.now();
      const result = await this.processFile(file, options);
      result.duration = Date.now() - fileStartTime;

      results.push(result);

      if (result.status === 'success') {
        successful++;
        if (!options.quiet) {
          console.log(`✓ Success: ${result.output}`);
        }
      } else if (result.status === 'failed') {
        failed++;
        console.error(`✗ Failed: ${result.error}`);
      } else {
        skipped++;
        if (options.verbose) {
          console.log(`⊘ Skipped: ${result.error}`);
        }
      }
    }

    const totalDuration = Date.now() - startTime;

    if (!options.quiet) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Batch processing complete in ${(totalDuration / 1000).toFixed(2)}s`);
      console.log(`Total: ${files.length}, Successful: ${successful}, Failed: ${failed}, Skipped: ${skipped}`);
    }

    return {
      total: files.length,
      successful,
      failed,
      skipped,
      results
    };
  }

  /**
   * Find files matching glob patterns
   */
  private async findFiles(patterns: string[]): Promise<string[]> {
    const allFiles: string[] = [];

    for (const pattern of patterns) {
      // Check if it's a directory
      if (existsSync(pattern) && (await fs.stat(pattern)).isDirectory()) {
        // If directory, search for all .md files
        const dirPattern = path.join(pattern, '**/*.md');
        const files = await glob(dirPattern, { nodir: true });
        allFiles.push(...files);
      } else {
        // Otherwise, use as glob pattern
        const files = await glob(pattern, { nodir: true });
        allFiles.push(...files);
      }
    }

    // Remove duplicates and sort
    return Array.from(new Set(allFiles)).sort();
  }

  /**
   * Process a single file
   */
  private async processFile(
    inputPath: string,
    options: BatchOptions
  ): Promise<FileResult> {
    try {
      // Check if file exists
      if (!existsSync(inputPath)) {
        return {
          input: inputPath,
          status: 'failed',
          error: 'File not found'
        };
      }

      // Determine output path
      const outputPath = this.determineOutputPath(inputPath, options);

      // Check if output already exists
      if (existsSync(outputPath) && !options.force) {
        return {
          input: inputPath,
          output: outputPath,
          status: 'skipped',
          error: 'Output file already exists (use --force to overwrite)'
        };
      }

      // Create output directory if needed
      const outputDir = path.dirname(outputPath);
      if (!existsSync(outputDir)) {
        await fs.mkdir(outputDir, { recursive: true });
      }

      // Perform conversion
      const conversionOptions: ConversionOptions = {
        inputPath,
        outputPath,
        theme: options.theme,
        output: {
          format: options.format || 'docx'
        }
      };

      await this.converter.convert(conversionOptions);

      return {
        input: inputPath,
        output: outputPath,
        status: 'success'
      };
    } catch (error) {
      return {
        input: inputPath,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Determine output path for a file
   */
  private determineOutputPath(inputPath: string, options: BatchOptions): string {
    const ext = options.format === 'pdf' ? '.pdf' : '.docx';
    const baseName = path.basename(inputPath, '.md');
    
    if (options.outputDir) {
      // Use specified output directory, preserve relative structure
      return path.join(options.outputDir, baseName + ext);
    } else {
      // Output in same directory as input
      return path.join(path.dirname(inputPath), baseName + ext);
    }
  }

  /**
   * Process files in parallel (advanced mode)
   */
  async processBatchParallel(
    options: BatchOptions,
    maxConcurrency: number = 4
  ): Promise<BatchResult> {
    const files = await this.findFiles(options.patterns);

    if (files.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        results: []
      };
    }

    const results: FileResult[] = [];
    const chunks: string[][] = [];

    // Split files into chunks
    for (let i = 0; i < files.length; i += maxConcurrency) {
      chunks.push(files.slice(i, i + maxConcurrency));
    }

    // Process chunks sequentially, files within chunk in parallel
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(file => this.processFile(file, options))
      );
      results.push(...chunkResults);
    }

    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    return {
      total: files.length,
      successful,
      failed,
      skipped,
      results
    };
  }
}
