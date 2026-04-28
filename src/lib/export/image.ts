import { toPng, toJpeg } from 'html-to-image';
import type { ExportSettings } from '../types';

export async function exportToImage(
  element: HTMLElement,
  settings: ExportSettings
): Promise<void> {
  const options = {
    width: settings.width,
    height: settings.height,
    style: {
      width: `${settings.width}px`,
      height: `${settings.height}px`,
    },
    pixelRatio: 2,
  };

  let dataUrl: string;
  if (settings.format === 'jpg') {
    dataUrl = await toJpeg(element, { ...options, quality: 0.95 });
  } else {
    dataUrl = await toPng(element, options);
  }

  const link = document.createElement('a');
  link.download = `calendar.${settings.format}`;
  link.href = dataUrl;
  link.click();
}
