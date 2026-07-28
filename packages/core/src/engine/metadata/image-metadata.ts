import type { ImageAdapter, ImageHandle } from "../adapters/adapter.interface";
import type { ImageMetadata, ImageExifData, ImageICCProfile } from "../types/image-metadata";
import type { ImageFormat } from "../types/image-format";

export class ImageMetadataReader {
  constructor(private adapter: ImageAdapter) {}

  async read(handle: ImageHandle): Promise<ImageMetadata> {
    return this.adapter.metadata(handle);
  }

  async getDimensions(handle: ImageHandle): Promise<{ width: number; height: number }> {
    return this.adapter.dimensions(handle);
  }

  async getFormat(handle: ImageHandle): Promise<ImageFormat> {
    return this.adapter.format(handle);
  }

  async getSize(handle: ImageHandle): Promise<number> {
    const info = await this.adapter.info(handle);
    return info.size;
  }

  async getChannels(handle: ImageHandle): Promise<number> {
    const info = await this.adapter.info(handle);
    return info.channels;
  }

  async hasAlpha(handle: ImageHandle): Promise<boolean> {
    const info = await this.adapter.info(handle);
    return info.hasAlpha;
  }

  async getEXIF(handle: ImageHandle): Promise<ImageExifData | undefined> {
    const metadata = await this.read(handle);
    return metadata.EXIF;
  }

  async getICCProfile(handle: ImageHandle): Promise<ImageICCProfile | undefined> {
    const metadata = await this.read(handle);
    return metadata.ICC;
  }

  async getOrientation(handle: ImageHandle): Promise<number> {
    const exif = await this.getEXIF(handle);
    return exif?.orientation ?? 1;
  }

  async getDPI(handle: ImageHandle): Promise<number | undefined> {
    const metadata = await this.read(handle);
    return metadata.density;
  }

  async getColorSpace(handle: ImageHandle): Promise<string> {
    const metadata = await this.read(handle);
    return metadata.colorSpace;
  }

  async getGPS(handle: ImageHandle): Promise<{ latitude?: number; longitude?: number; altitude?: number } | undefined> {
    const exif = await this.getEXIF(handle);
    return exif?.GPS;
  }

  async getCameraInfo(handle: ImageHandle): Promise<{ make?: string; model?: string; software?: string } | undefined> {
    const exif = await this.getEXIF(handle);
    if (!exif?.make && !exif?.model && !exif?.software) return undefined;
    return {
      make: exif.make,
      model: exif.model,
      software: exif.software,
    };
  }

  async getExposureInfo(handle: ImageHandle): Promise<{
    exposureTime?: number;
    fNumber?: number;
    iso?: number;
    focalLength?: number;
    flash?: boolean;
  } | undefined> {
    const exif = await this.getEXIF(handle);
    if (!exif?.exposureTime && !exif?.fNumber && !exif?.iso) return undefined;
    return {
      exposureTime: exif.exposureTime,
      fNumber: exif.fNumber,
      iso: exif.iso,
      focalLength: exif.focalLength,
      flash: exif.flash,
    };
  }

  async getSummary(handle: ImageHandle): Promise<ImageSummary> {
    const [metadata, info] = await Promise.all([
      this.read(handle),
      this.adapter.info(handle),
    ]);

    return {
      id: info.id,
      width: info.width,
      height: info.height,
      format: info.format,
      channels: info.channels,
      hasAlpha: info.hasAlpha,
      size: info.size,
      fileSize: this.formatFileSize(info.size),
      aspectRatio: this.calculateAspectRatio(info.width, info.height),
      megapixels: (info.width * info.height) / 1000000,
      colorSpace: metadata.colorSpace,
      density: metadata.density,
      orientation: metadata.EXIF?.orientation,
      camera: metadata.EXIF ? {
        make: metadata.EXIF.make,
        model: metadata.EXIF.model,
      } : undefined,
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  private calculateAspectRatio(width: number, height: number): string {
    const gcd = this.gcd(width, height);
    return `${width / gcd}:${height / gcd}`;
  }

  private gcd(a: number, b: number): number {
    while (b) {
      [a, b] = [b, a % b];
    }
    return a;
  }
}

export interface ImageSummary {
  id: string;
  width: number;
  height: number;
  format: ImageFormat;
  channels: number;
  hasAlpha: boolean;
  size: number;
  fileSize: string;
  aspectRatio: string;
  megapixels: number;
  colorSpace: string;
  density?: number;
  orientation?: number;
  camera?: { make?: string; model?: string };
}
