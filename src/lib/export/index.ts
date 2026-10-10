import type { ExportFormat, ExportSettings } from '../types';
import { exportToImage } from './image';

// Single entry point for every output format; the toolbar only knows formats.
export async function exportCalendar(
  el: HTMLElement,
  size: ExportSettings,
  format: ExportFormat,
): Promise<void> {
  switch (format) {
    case 'png':
    case 'jpg':
      return exportToImage(el, size, format);
  }
}
