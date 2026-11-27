/**
 * SVG helper. Semua ilustrasi dan ikon dibuat lewat fungsi di sini agar
 * `viewBox` selalu ada dan atribut konsisten.
 */

export const SVG_NS = 'http://www.w3.org/2000/svg';

export type SvgChild = Node | string | number | null | undefined | false;

export type SvgProps = {
  class?: string;
  viewBox?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  opacity?: number | string;
  d?: string;
  transform?: string;
  id?: string;
  role?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
  focusable?: boolean;
} & Record<string, unknown>;

function applySvgProps(node: Element, props: SvgProps): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;

    if (key === 'class') {
      node.setAttribute('class', String(value));
      continue;
    }

    if (key === 'ariaLabel') {
      node.setAttribute('aria-label', String(value));
      continue;
    }

    if (key === 'ariaHidden') {
      node.setAttribute('aria-hidden', 'true');
      continue;
    }

    node.setAttribute(key, value === true ? '' : String(value));
  }
}

function appendSvgChildren(node: Node, children?: SvgChild | SvgChild[]): void {
  if (children === null || children === undefined || children === false) return;

  if (Array.isArray(children)) {
    for (const child of children) appendSvgChildren(node, child);
    return;
  }

  if (children instanceof Node) {
    node.appendChild(children);
    return;
  }

  node.appendChild(document.createTextNode(String(children)));
}

function svgNode(tag: string, props?: SvgProps, children?: SvgChild | SvgChild[]): SVGElement {
  const node = document.createElementNS(SVG_NS, tag);
  if (props) applySvgProps(node, props);
  appendSvgChildren(node, children);
  return node;
}

export function svg(props?: SvgProps, children?: SvgChild | SvgChild[]): SVGSVGElement {
  const node = svgNode('svg', { viewBox: '0 0 24 24', fill: 'none', ...props }, children);
  return node as SVGSVGElement;
}

export function g(props?: SvgProps, children?: SvgChild | SvgChild[]): SVGGElement {
  return svgNode('g', props, children) as SVGGElement;
}

export function path(props: SvgProps): SVGPathElement {
  return svgNode('path', props) as SVGPathElement;
}

export function circle(props: SvgProps): SVGCircleElement {
  return svgNode('circle', props) as SVGCircleElement;
}

export function ellipse(props: SvgProps): SVGEllipseElement {
  return svgNode('ellipse', props) as SVGEllipseElement;
}

export function rect(props: SvgProps): SVGRectElement {
  return svgNode('rect', props) as SVGRectElement;
}

export function line(props: SvgProps): SVGLineElement {
  return svgNode('line', props) as SVGLineElement;
}

export function polyline(props: SvgProps): SVGPolylineElement {
  return svgNode('polyline', props) as SVGPolylineElement;
}
export function polygon(props: SvgProps): SVGPolygonElement {
  return svgNode('polygon', props) as SVGPolygonElement;
}

export function text(props: SvgProps, children?: SvgChild | SvgChild[]): SVGTextElement {
  return svgNode('text', props, children) as SVGTextElement;
}

export function defs(children?: SvgChild | SvgChild[]): SVGDefsElement {
  return svgNode('defs', undefined, children) as SVGDefsElement;
}

export function linearGradient(
  props: SvgProps & { stops?: Array<{ offset: string; color: string; opacity?: number }> },
  children?: SvgChild | SvgChild[],
): SVGLinearGradientElement {
  const { stops, ...rest } = props;
  const node = svgNode('linearGradient', rest, children) as SVGLinearGradientElement;
  if (stops) {
    for (const stop of stops) {
      node.appendChild(
        svgNode('stop', {
          offset: stop.offset,
          'stop-color': stop.color,
          ...(stop.opacity === undefined ? {} : { 'stop-opacity': stop.opacity }),
        }),
      );
    }
  }
  return node;
}

/** Ikon UI: selalu 24×24, stroke currentColor, aria-hidden kecuali diberi label. */
export function icon(children: SvgChild | SvgChild[], label?: string): SVGSVGElement {
  return svg(
    {
      viewBox: '0 0 24 24',
      width: 24,
      height: 24,
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2.6,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...(label
        ? { role: 'img', ariaLabel: label }
        : { ariaHidden: true, focusable: false }),
    },
    children,
  );
}
