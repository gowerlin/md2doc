/**
 * Configuration Loader
 * Loads and validates configuration from YAML/JSON files
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import type { Md2DocConfig } from '../types/config';

export class ConfigLoader {
  private configCache: Map<string, Md2DocConfig> = new Map();

  /**
   * Load configuration from file or default locations
   */
  async loadConfig(configPath?: string): Promise<Md2DocConfig> {
    // If specific path provided, load from there
    if (configPath) {
      return await this.loadFromFile(configPath);
    }

    // Try default config file locations
    const defaultPaths = [
      '.md2docrc.yml',
      '.md2docrc.yaml',
      '.md2docrc.json',
      'md2doc.config.yml',
      'md2doc.config.yaml',
      'md2doc.config.json'
    ];

    for (const defaultPath of defaultPaths) {
      if (existsSync(defaultPath)) {
        return await this.loadFromFile(defaultPath);
      }
    }

    // Return default config
    return this.getDefaultConfig();
  }

  /**
   * Load configuration from a specific file
   */
  private async loadFromFile(filePath: string): Promise<Md2DocConfig> {
    // Check cache
    if (this.configCache.has(filePath)) {
      return this.configCache.get(filePath)!;
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      throw new Error(`Configuration file not found: ${filePath}`);
    }

    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath);

    let config: Md2DocConfig;

    // Parse based on file extension
    if (ext === '.yml' || ext === '.yaml') {
      config = parseYaml(content) as Md2DocConfig;
    } else if (ext === '.json') {
      config = JSON.parse(content) as Md2DocConfig;
    } else {
      throw new Error(`Unsupported configuration file format: ${ext}`);
    }

    // Validate and merge with defaults
    const validatedConfig = this.validateAndMerge(config);

    // Cache the config
    this.configCache.set(filePath, validatedConfig);

    return validatedConfig;
  }

  /**
   * Validate and merge configuration with defaults
   */
  private validateAndMerge(config: Partial<Md2DocConfig>): Md2DocConfig {
    const defaults = this.getDefaultConfig();

    return {
      output: {
        ...defaults.output,
        ...config.output
      },
      theme: config.theme || defaults.theme,
      pdf: {
        ...defaults.pdf,
        ...config.pdf
      },
      docx: {
        ...defaults.docx,
        ...config.docx
      },
      mermaid: {
        ...defaults.mermaid,
        ...config.mermaid
      },
      images: {
        ...defaults.images,
        ...config.images
      }
    };
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): Md2DocConfig {
    return {
      output: {
        format: 'docx',
        directory: '.',
        overwrite: false
      },
      theme: 'default',
      pdf: {
        pageSize: 'A4',
        margin: '2cm',
        headerFooter: false
      },
      docx: {
        pageSize: 'A4'
      },
      mermaid: {
        theme: 'default',
        scale: 2
      },
      images: {
        maxWidth: 800,
        quality: 85,
        embedLocal: true
      }
    };
  }

  /**
   * Create a default configuration file
   */
  async createDefaultConfigFile(outputPath: string = '.md2docrc.yml'): Promise<void> {
    const defaultConfigYaml = `# md2doc 配置文件

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

    await fs.writeFile(outputPath, defaultConfigYaml, 'utf-8');
    console.log(`配置文件已創建: ${outputPath}`);
  }

  /**
   * Clear configuration cache
   */
  clearCache(): void {
    this.configCache.clear();
  }
}
