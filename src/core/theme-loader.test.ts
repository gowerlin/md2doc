/**
 * Theme Loader Tests
 */

import { ThemeLoader, DEFAULT_THEMES } from '../core/theme-loader';

describe('ThemeLoader', () => {
  let loader: ThemeLoader;

  beforeEach(() => {
    loader = new ThemeLoader();
  });

  test('loads default theme by name', () => {
    const theme = loader.loadTheme('default');
    
    expect(theme.name).toBe('Default');
    expect(theme.fonts?.body).toBe('Arial');
    expect(theme.colors?.primary).toBe('#333333');
  });

  test('loads modern theme by name', () => {
    const theme = loader.loadTheme('modern');
    
    expect(theme.name).toBe('Modern');
    expect(theme.fonts?.heading).toBe('Calibri');
    expect(theme.colors?.primary).toBe('#2563eb');
  });

  test('loads academic theme by name', () => {
    const theme = loader.loadTheme('academic');
    
    expect(theme.name).toBe('Academic');
    expect(theme.fonts?.body).toBe('Times New Roman');
  });

  test('falls back to default for unknown theme', () => {
    const theme = loader.loadTheme('nonexistent');
    
    expect(theme.name).toBe('Default');
  });

  test('loads custom theme object', () => {
    const customTheme = {
      name: 'Custom',
      fonts: {
        body: 'Comic Sans MS'
      },
      colors: {
        primary: '#FF0000'
      }
    };

    const theme = loader.loadTheme(customTheme);
    
    expect(theme.name).toBe('Custom');
    expect(theme.fonts?.body).toBe('Comic Sans MS');
    expect(theme.colors?.primary).toBe('#FF0000');
    // Should merge with defaults
    expect(theme.fonts?.heading).toBe('Arial'); // from default
  });

  test('lists all available themes', () => {
    const themes = loader.listThemes();
    
    expect(themes).toContain('default');
    expect(themes).toContain('modern');
    expect(themes).toContain('academic');
    expect(themes).toContain('minimal');
    expect(themes).toContain('dark');
    expect(themes).toHaveLength(5);
  });

  test('gets theme info', () => {
    const info = loader.getThemeInfo('modern');
    
    expect(info).not.toBeNull();
    expect(info?.name).toBe('Modern');
  });

  test('returns null for nonexistent theme info', () => {
    const info = loader.getThemeInfo('nonexistent');
    
    expect(info).toBeNull();
  });
});
