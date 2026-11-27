/**
 * Entry point. Memasang style, error boundary, lalu bootstrap aplikasi.
 */

import './styles/tokens.css';
import './styles/reset.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/motion.css';
import './styles/fonts-stitch.css';
import './styles/stitch.css';
import './styles/stitch-extras.css';
import './styles/cartoon-direction.css';

import { installErrorBoundary, showBootFailure } from './app/error-boundary';
import { bootstrap } from './app/bootstrap';

installErrorBoundary();

void bootstrap().catch((error: unknown) => {
  const detail = error instanceof Error ? error.message : String(error);
  console.error('[menjadi-buzzer] bootstrap gagal', error);
  showBootFailure('Game gagal dimulai.', detail);
});
