import type { ExportFormat, ExportSettings } from '../types';
import { exportToHtml } from './html';
import { exportToImage } from './image';
import { exportToPptx } from './pptx';
import { exportToSvg } from './svg';

// Single entry point for every output format; the toolbar only knows formats.
// Vector/HTML exporters read the size from the element itself (it is rendered
// at exactly `size`); the raster exporter needs it to size the canvas.
export async function exportCalendar(
  el: HTMLElement,
  size: ExportSettings,
  format: ExportFormat,
): Promise<void> {
  switch (format) {
    case 'png':
    case 'jpg':
      return exportToImage(el, size, format);
    case 'svg':
      return exportToSvg(el);
    case 'pptx':
      return exportToPptx(el);
    case 'html':
      return exportToHtml(el);
    default: {
      const unreachable: never = format;
      throw new Error(`Unsupported export format: ${String(unreachable)}`);
    }
  }
}
