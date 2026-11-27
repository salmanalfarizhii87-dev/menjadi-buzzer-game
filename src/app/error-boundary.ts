/**
 * Error boundary global. Menangkap error yang tidak tertangani dan menampilkan
 * fallback di layar boot — tanpa menyentuh save pemain.
 */

const bootFallbackHtml = (message: string, detail?: string): HTMLElement => {
  const wrapper = document.createElement('div');
  wrapper.className = 'boot-error';

  const title = document.createElement('h2');
  title.textContent = 'Game gagal dimuat';
  wrapper.appendChild(title);

  const text = document.createElement('p');
  text.textContent = message;
  wrapper.appendChild(text);

  if (detail) {
    const pre = document.createElement('pre');
    pre.textContent = detail;
    wrapper.appendChild(pre);
  }

  const reload = document.createElement('button');
  reload.type = 'button';
  reload.className = 'btn btn--primary';
  reload.textContent = 'Muat ulang halaman';
  reload.addEventListener('click', () => window.location.reload());
  wrapper.appendChild(reload);

  return wrapper;
};

export function showBootFailure(message: string, detail?: string): void {
  const boot = document.getElementById('boot');
  if (!boot) return;
  boot.hidden = false;
  boot.replaceChildren(bootFallbackHtml(message, detail));
}

let installed = false;

export function installErrorBoundary(): void {
  if (installed) return;
  installed = true;

  window.addEventListener('error', (event) => {
    const detail = event.error instanceof Error ? event.error.message : undefined;
    console.error('[menjadi-buzzer] uncaught error', event.error);
    showBootFailure('Terjadi kesalahan tak terduga saat memuat game.', detail);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const detail = reason instanceof Error ? reason.message : String(reason);
    console.error('[menjadi-buzzer] unhandled rejection', reason);
    showBootFailure('Terjadi kesalahan saat memproses data game.', detail);
  });
}
