/**
 * Scene kamar/studio original untuk hero Home. SVG penuh, tanpa aset eksternal.
 */

import { circle, defs, g, linearGradient, path, rect, svg } from '@/core/svg';
import { playerCharacter } from '@/art/character/renderer';

export function roomScene(outfitId: string, accessoryIds: string[]): SVGSVGElement {
  const root = svg({
    viewBox: '0 0 390 560',
    width: '100%',
    height: '100%',
    preserveAspectRatio: 'xMidYMid slice',
    class: 'room-scene',
    role: 'img',
    ariaLabel: 'Studio buzzer',
  });

  root.appendChild(
    defs([
      linearGradient({
        id: 'room-wall',
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 1,
        stops: [
          { offset: '0%', color: '#5b3b7a' },
          { offset: '58%', color: '#40264f' },
          { offset: '100%', color: '#2a1830' },
        ],
      }),
      linearGradient({
        id: 'room-floor',
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 1,
        stops: [
          { offset: '0%', color: '#8a4f27' },
          { offset: '100%', color: '#4d2a12' },
        ],
      }),
    ]),
  );

  root.appendChild(rect({ x: 0, y: 0, width: 390, height: 560, fill: 'url(#room-wall)' }));

  // Jendela malam.
  root.appendChild(rect({ x: 30, y: 58, width: 128, height: 120, rx: 10, fill: '#122a44', stroke: '#241005', strokeWidth: 6 }));
  root.appendChild(circle({ cx: 128, cy: 94, r: 16, fill: '#fde047', opacity: 0.9 }));
  root.appendChild(path({ d: 'M30 150 Q70 120 100 148 T158 146 V178 H30 Z', fill: '#1f4d5c', opacity: 0.9 }));
  root.appendChild(path({ d: 'M94 58v120M30 118h128', stroke: '#241005', strokeWidth: 5 }));

  // Rak dan poster.
  root.appendChild(rect({ x: 244, y: 60, width: 118, height: 14, rx: 5, fill: '#3a2010' }));
  for (let index = 0; index < 4; index += 1) {
    root.appendChild(
      rect({ x: 250 + index * 27, y: 38, width: 18, height: 22, rx: 3, fill: ['#e53935', '#28b8e8', '#fdd835', '#2ead39'][index]! }),
    );
  }
  root.appendChild(rect({ x: 252, y: 108, width: 96, height: 76, rx: 8, fill: '#fffbf2', stroke: '#241005', strokeWidth: 5 }));
  root.appendChild(circle({ cx: 300, cy: 136, r: 14, fill: '#f5a623' }));
  root.appendChild(rect({ x: 268, y: 158, width: 64, height: 8, rx: 4, fill: '#86522d' }));

  // Lampu gantung.
  root.appendChild(path({ d: 'M196 0v48', stroke: '#241005', strokeWidth: 4 }));
  root.appendChild(path({ d: 'M168 78a28 28 0 0 1 56 0Z', fill: '#f5a623', stroke: '#241005', strokeWidth: 5 }));
  root.appendChild(circle({ cx: 196, cy: 82, r: 8, fill: '#fde047' }));

  // Lantai.
  root.appendChild(rect({ x: 0, y: 388, width: 390, height: 172, fill: 'url(#room-floor)' }));
  root.appendChild(rect({ x: 0, y: 388, width: 390, height: 8, fill: '#2a160a' }));

  // Meja + laptop.
  root.appendChild(rect({ x: 18, y: 360, width: 354, height: 22, rx: 8, fill: '#c88a4b', stroke: '#241005', strokeWidth: 5 }));
  root.appendChild(rect({ x: 46, y: 382, width: 18, height: 66, fill: '#6e3f21' }));
  root.appendChild(rect({ x: 326, y: 382, width: 18, height: 66, fill: '#6e3f21' }));
  root.appendChild(rect({ x: 132, y: 292, width: 150, height: 72, rx: 8, fill: '#1e1b2e', stroke: '#241005', strokeWidth: 6 }));
  root.appendChild(rect({ x: 142, y: 302, width: 130, height: 52, rx: 4, fill: '#28b8e8', opacity: 0.55 }));
  root.appendChild(path({ d: 'M112 366h190l14 16H98Z', fill: '#e7e2d8', stroke: '#241005', strokeWidth: 5 }));

  // Cangkir dan tanaman.
  root.appendChild(rect({ x: 310, y: 332, width: 26, height: 28, rx: 5, fill: '#fffbf2', stroke: '#241005', strokeWidth: 4 }));
  root.appendChild(path({ d: 'M336 338h10a8 8 0 0 1 0 16h-10', fill: 'none', stroke: '#241005', strokeWidth: 4 }));
  root.appendChild(rect({ x: 30, y: 318, width: 34, height: 42, rx: 6, fill: '#b56100', stroke: '#241005', strokeWidth: 4 }));
  root.appendChild(path({ d: 'M47 320c-16-18 4-34 12-18 8-16 24 0 4 18Z', fill: '#1f7a26', stroke: '#241005', strokeWidth: 4 }));

  const character = playerCharacter({ size: 230, outfitId, accessoryIds, mood: 'happy' });
  character.setAttribute('x', '78');
  character.setAttribute('y', '168');
  root.appendChild(g({}, [character]));

  return root;
}
