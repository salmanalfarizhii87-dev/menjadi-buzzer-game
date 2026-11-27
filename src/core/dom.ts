/**
 * DOM factory. Satu-satunya cara membuat elemen di aplikasi ini.
 *
 * Aturan keamanan: tidak ada `html` prop. Konten dinamis selalu masuk lewat
 * `text`/`textContent`, tidak pernah sebagai markup mentah.
 */

export type Child = Node | string | number | null | undefined | false;

export type ElProps = {
  class?: string;
  text?: string | number;
  dataset?: Record<string, string>;
  style?: Record<string, string>;
} & Record<string, unknown>;

function applyProps(node: Element, props: ElProps): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;

    if (key === 'class') {
      node.className = String(value);
      continue;
    }

    if (key === 'text') {
      node.textContent = String(value);
      continue;
    }

    if (key === 'dataset') {
      for (const [dataKey, dataValue] of Object.entries(value as Record<string, string>)) {
        (node as HTMLElement).dataset[dataKey] = dataValue;
      }
      continue;
    }

    if (key === 'style') {
      if (typeof value === 'string') {
        node.setAttribute('style', value);
      } else {
        const style = (node as HTMLElement).style;
        for (const [prop, propValue] of Object.entries(value as Record<string, string>)) {
          style.setProperty(prop, propValue);
        }
      }
      continue;
    }

    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
      continue;
    }

    if (value === true) {
      node.setAttribute(key, '');
      continue;
    }

    node.setAttribute(key, String(value));
  }
}

function appendChildren(node: Node, children?: Child | Child[]): void {
  if (children === null || children === undefined || children === false) return;

  if (Array.isArray(children)) {
    for (const child of children) appendChildren(node, child);
    return;
  }

  if (children instanceof Node) {
    node.appendChild(children);
    return;
  }

  node.appendChild(document.createTextNode(String(children)));
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: ElProps,
  children?: Child | Child[],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props) applyProps(node, props);
  appendChildren(node, children);
  return node;
}

export function frag(children?: Child | Child[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  appendChildren(fragment, children);
  return fragment;
}

export function clear(node: Element | DocumentFragment): void {
  node.replaceChildren();
}

export function setText(node: Element, value: string | number): void {
  node.textContent = String(value);
}

export function qs<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Elemen tidak ditemukan untuk selector: ${selector}`);
  return found;
}

/** Root wajib yang disediakan `index.html`. */
export function appRoots(): {
  app: HTMLElement;
  overlay: HTMLElement;
  toast: HTMLElement;
  boot: HTMLElement;
} {
  return {
    app: qs('#app'),
    overlay: qs('#overlay-root'),
    toast: qs('#toast-root'),
    boot: qs('#boot'),
  };
}
