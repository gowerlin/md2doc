/**
 * Image Handler
 * Handles image processing, downloading, and embedding
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

export interface ImageProcessOptions {
  maxWidth?: number;
  quality?: number;
  embedLocal?: boolean;
}

export class ImageHandler {
  constructor(private options: ImageProcessOptions = {}) {
    this.options = {
      maxWidth: 800,
      quality: 85,
      embedLocal: true,
      ...options
    };
  }

  /**
   * Process an image URL and return image data
   */
  async processImage(url: string, basePath?: string): Promise<Buffer | null> {
    try {
      // Check if it's a local file
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return await this.loadLocalImage(url, basePath);
      }

      // Handle remote images
      return await this.downloadImage(url);
    } catch (error) {
      console.error(`Failed to process image: ${url}`, error);
      return null;
    }
  }

  /**
   * Load local image file
   */
  private async loadLocalImage(relativePath: string, basePath?: string): Promise<Buffer | null> {
    try {
      let imagePath = relativePath;

      // If basePath is provided, resolve relative to it
      if (basePath) {
        imagePath = path.resolve(path.dirname(basePath), relativePath);
      }

      // Check if file exists
      if (!existsSync(imagePath)) {
        console.warn(`Image file not found: ${imagePath}`);
        return null;
      }

      // Read file
      const buffer = await fs.readFile(imagePath);
      return buffer;
    } catch (error) {
      console.error(`Failed to load local image: ${relativePath}`, error);
      return null;
    }
  }

  /**
   * Download remote image
   */
  private async downloadImage(url: string): Promise<Buffer | null> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Failed to download image: ${url}, status: ${response.status}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error(`Failed to download image: ${url}`, error);
      return null;
    }
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number } | null> {
    try {
      // Simple PNG dimension reading
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return { width, height };
      }

      // Simple JPEG dimension reading
      if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
        // This is a simplified version - for production use sharp or image-size
        return { width: 800, height: 600 }; // placeholder
      }

      return null;
    } catch (error) {
      console.error('Failed to get image dimensions', error);
      return null;
    }
  }

  /**
   * Convert image to base64 data URI
   */
  toDataUri(buffer: Buffer, mimeType: string = 'image/png'): string {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  /**
   * Detect image MIME type from buffer
   */
  detectMimeType(buffer: Buffer): string {
    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png';
    }
    
    // JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      return 'image/jpeg';
    }
    
    // GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'image/gif';
    }
    
    // WebP
    if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      return 'image/webp';
    }

    return 'image/png'; // default
  }
}
