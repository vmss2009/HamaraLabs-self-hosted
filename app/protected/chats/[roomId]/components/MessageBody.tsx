import React, { useEffect, useRef } from 'react';
import katex from 'katex';

export function MessageBody({ html }: { html?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const root = ref.current;
    const inlineEls = root.querySelectorAll('span[data-type="inline-math"]');
    inlineEls.forEach((el) => {
      const latex = (el as HTMLElement).getAttribute('data-latex') || '';
      try { katex.render(latex, el as HTMLElement, { throwOnError: false, displayMode: false }); } catch {}
    });
    const blockEls = root.querySelectorAll('div[data-type="block-math"]');
    blockEls.forEach((el) => {
      const latex = (el as HTMLElement).getAttribute('data-latex') || '';
      try { katex.render(latex, el as HTMLElement, { throwOnError: false, displayMode: true }); } catch {}
    });

    const wrapIfNeeded = (el: HTMLElement) => {
      const parent = el.parentElement;
      if (!parent) return;
      if (parent.classList.contains('hl-scroll-wrap')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'hl-scroll-wrap w-full max-w-full overflow-x-auto';
      parent.insertBefore(wrapper, el);
      wrapper.appendChild(el);
    };
    root.querySelectorAll('table').forEach((t) => {
      const tbl = t as HTMLElement;
      tbl.classList.add('min-w-max');
      wrapIfNeeded(tbl);
    });
    root.querySelectorAll('pre').forEach((p) => {
      const pre = p as HTMLElement;
      pre.classList.add('overflow-x-auto');
    });
  });
  if (!html) return null;
  return <div ref={ref} className="prose prose-invert max-w-none text-sm break-words" dangerouslySetInnerHTML={{ __html: html }} />;
}