/**
 * Screen: Foto — preview komposisi landmark + karakter, unduh PNG
 * lewat canvas sementara (satu-satunya pemakaian Canvas di MVP).
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import { button } from '@/components/buttons/button';
import { panel } from '@/components/cards/panel';
import { appFrame, mainContent, topBar } from '@/components/layout/app-shell';
import { photoScene } from '@/art/travel/photo-scene';
import { el } from '@/core/dom';
import { t } from '@/data/strings/id';
import { findTravelCountry } from '@/data/travel/countries';
import {
  selectCurrentCountry,
  selectDisplayBalance,
  selectEquippedOutfit,
} from '@/state/selectors';
import '../travel/travel.css';

async function exportPng(svg: SVGSVGElement, filename: string): Promise<void> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const serialized = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('gagal memuat SVG'));
    });
    image.src = url;
    await loaded;

    const width = Number(clone.getAttribute('width')) || 1080;
    const height = Number(clone.getAttribute('height')) || 1350;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas 2d tidak tersedia');

    context.fillStyle = '#f9efdd';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const state = ctx.store.getState();
  const balance = selectDisplayBalance(state);
  const countryId = selectCurrentCountry(state);
  const country = findTravelCountry(countryId);
  const outfit = selectEquippedOutfit(state);

  const content = mainContent();
  const screen = el('section', { class: 'screen anim-fade' });

  const scene = photoScene({
    countryId,
    outfitId: outfit?.id ?? state.character.outfitId,
    accessoryIds: state.character.accessoryIds,
    config: ctx.config,
  });

  const preview = el('div', { class: 'photo-preview' }, [scene]);

  const downloadButton = button({
    label: t('travel.photoDownload'),
    variant: 'gold',
    block: true,
    onClick: () => {
      downloadButton.disabled = true;
      void exportPng(scene, `menjadi-buzzer-${countryId}.png`)
        .then(() => ctx.toasts.success(t('travel.photoSaved')))
        .catch((error: unknown) => {
          console.error('[photo] gagal mengekspor PNG', error);
          ctx.toasts.error(t('travel.photoFailed'));
        })
        .finally(() => {
          downloadButton.disabled = false;
        });
    },
  });

  screen.appendChild(
    panel({
      title: country ? t(country.nameKey) : countryId,
      ...(country ? { subtitle: t(country.landmarkNameKey) } : {}),
      children: [preview],
    }),
  );

  screen.appendChild(
    el('div', { class: 'photo-actions' }, [
      downloadButton,
      button({
        label: t('travel.back'),
        variant: 'ghost',
        block: true,
        onClick: () => ctx.navigate('travel'),
      }),
    ]),
  );

  content.appendChild(screen);

  root.replaceChildren(
    appFrame({
      topBar: topBar({
        title: t('screen.photo.title'),
        subtitle: t('screen.photo.subtitle'),
        balance,
        showBack: true,
        onBack: () => ctx.navigate('travel'),
      }),
      nav: null,
      content,
    }),
  );
}

const screenModule: ScreenModule = { id: 'photo', mount };
export default screenModule;
