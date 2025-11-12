/**
 * Configuration Types
 */

export interface Md2DocConfig {
  // Output settings
  output?: {
    format?: 'docx' | 'pdf' | 'both';
    directory?: string;
    overwrite?: boolean;
  };

  // Theme settings
  theme?: string | ThemeConfig;

  // PDF settings
  pdf?: {
    pageSize?: 'A4' | 'Letter';
    margin?: string;
    headerFooter?: boolean;
  };

  // Word settings
  docx?: {
    pageSize?: 'A4' | 'Letter';
    template?: string;
  };

  // Mermaid settings
  mermaid?: {
    theme?: 'default' | 'dark' | 'forest' | 'neutral';
    scale?: number;
  };

  // Image settings
  images?: {
    maxWidth?: number;
    quality?: number;
    embedLocal?: boolean;
  };
}

export interface ThemeConfig {
  name: string;
  fonts?: {
    heading?: string;
    body?: string;
    code?: string;
  };
  colors?: {
    primary?: string;
    text?: string;
    background?: string;
    code?: string;
  };
  spacing?: {
    paragraphSpacing?: number;
    lineHeight?: number;
  };
  customCss?: string;
}

export interface ConversionOptions extends Md2DocConfig {
  inputPath: string;
  outputPath?: string;
}
