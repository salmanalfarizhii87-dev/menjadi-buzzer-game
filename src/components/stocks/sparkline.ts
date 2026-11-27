/**
 * Grafik harga sederhana (SVG polyline). Skala otomatis dari nilai min/max,
 * tanpa library chart.
 */

import { polygon, polyline, svg } from '@/core/svg';
import type { StockPricePoint } from '@/state/types';

const WIDTH = 240;
const HEIGHT = 64;
const PADDING = 6;

export function sparkline(points: readonly StockPricePoint[]): SVGSVGElement {
  const node = svg({
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    class: 'sparkline',
    preserveAspectRatio: 'none',
    role: 'img',
    ariaLabel: 'Grafik harga',
  });

  const prices = points.map((point) => point.price);
  if (prices.length === 0) return node;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const step = prices.length > 1 ? (WIDTH - PADDING * 2) / (prices.length - 1) : 0;

  const coordinates = prices.map((price, index) => {
    const x = PADDING + index * step;
    const y = HEIGHT - PADDING - ((price - min) / span) * (HEIGHT - PADDING * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const areaPoints = [
    `${PADDING.toFixed(2)},${(HEIGHT - PADDING).toFixed(2)}`,
    ...coordinates,
    `${(PADDING + (prices.length - 1) * step).toFixed(2)},${(HEIGHT - PADDING).toFixed(2)}`,
  ].join(' ');

  node.appendChild(
    polygon({ points: areaPoints, fill: 'currentColor', opacity: 0.12 }),
  );
  node.appendChild(
    polyline({
      points: coordinates.join(' '),
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2.2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      vectorEffect: 'non-scaling-stroke',
    }),
  );

  return node;
}
