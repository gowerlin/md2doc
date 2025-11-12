/**
 * Theme Loader
 * Loads and manages document themes
 */

import type { ThemeConfig } from '../types/config';

export const DEFAULT_THEMES = {
  default: {
    name: 'Default',
    fonts: {
      heading: 'Arial',
      body: 'Arial',
      code: 'Courier New'
    },
    colors: {
      primary: '#333333',
      text: '#000000',
      background: '#FFFFFF',
      code: '#f5f5f5'
    },
    spacing: {
      paragraphSpacing: 10,
      lineHeight: 1.5
    }
  },
  
  modern: {
    name: 'Modern',
    fonts: {
      heading: 'Calibri',
      body: 'Calibri',
      code: 'Consolas'
    },
    colors: {
      primary: '#2563eb',
      text: '#1f2937',
      background: '#FFFFFF',
      code: '#f3f4f6'
    },
    spacing: {
      paragraphSpacing: 12,
      lineHeight: 1.6
    }
  },

  academic: {
    name: 'Academic',
    fonts: {
      heading: 'Times New Roman',
      body: 'Times New Roman',
      code: 'Courier New'
    },
    colors: {
      primary: '#000000',
      text: '#000000',
      background: '#FFFFFF',
      code: '#f8f8f8'
    },
    spacing: {
      paragraphSpacing: 8,
      lineHeight: 2.0
    }
  },

  minimal: {
    name: 'Minimal',
    fonts: {
      heading: 'Helvetica',
      body: 'Helvetica',
      code: 'Monaco'
    },
    colors: {
      primary: '#111827',
      text: '#374151',
      background: '#FFFFFF',
      code: '#f9fafb'
    },
    spacing: {
      paragraphSpacing: 14,
      lineHeight: 1.7
    }
  },

  dark: {
    name: 'Dark',
    fonts: {
      heading: 'Arial',
      body: 'Arial',
      code: 'Courier New'
    },
    colors: {
      primary: '#e5e7eb',
      text: '#d1d5db',
      background: '#1f2937',
      code: '#374151'
    },
    spacing: {
      paragraphSpacing: 10,
      lineHeight: 1.6
    }
  }
};

export class ThemeLoader {
  /**
   * Load theme by name or custom config
   */
  loadTheme(theme: string | ThemeConfig): ThemeConfig {
    if (typeof theme === 'object') {
      return this.mergeWithDefaults(theme);
    }

    // Load built-in theme
    const builtInTheme = DEFAULT_THEMES[theme as keyof typeof DEFAULT_THEMES];
    if (builtInTheme) {
      return builtInTheme as ThemeConfig;
    }

    // Fallback to default theme
    console.warn(`Theme "${theme}" not found, using default theme`);
    return DEFAULT_THEMES.default as ThemeConfig;
  }

  /**
   * Merge custom theme with defaults
   */
  private mergeWithDefaults(custom: ThemeConfig): ThemeConfig {
    const defaults = DEFAULT_THEMES.default;
    
    return {
      name: custom.name || 'Custom',
      fonts: {
        ...defaults.fonts,
        ...custom.fonts
      },
      colors: {
        ...defaults.colors,
        ...custom.colors
      },
      spacing: {
        ...defaults.spacing,
        ...custom.spacing
      },
      customCss: custom.customCss
    };
  }

  /**
   * List available themes
   */
  listThemes(): string[] {
    return Object.keys(DEFAULT_THEMES);
  }

  /**
   * Get theme info
   */
  getThemeInfo(themeName: string): ThemeConfig | null {
    const theme = DEFAULT_THEMES[themeName as keyof typeof DEFAULT_THEMES];
    return theme ? (theme as ThemeConfig) : null;
  }
}
