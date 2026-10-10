import { toPng, toJpeg } from 'html-to-image';
import type { ExportFormat, ExportSettings } from '../types';
import { downloadDataUrl } from './download';

export async function exportToImage(
  element: HTMLElement,
  size: ExportSettings,
  format: ExportFormat,
): Promise<void> {
  const options = {
    width: size.width,
    height: size.height,
    style: {
      width: `${size.width}px`,
      height: `${size.height}px`,
    },
    pixelRatio: 2,
  };

  const dataUrl = format === 'jpg'
    ? await toJpeg(element, { ...options, quality: 0.95 })
    : await toPng(element, options);

  downloadDataUrl(dataUrl, `calendar.${format}`);
}
