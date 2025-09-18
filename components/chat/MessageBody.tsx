import React, { useEffect, useRef } from 'react';
import katex from 'katex';

export function MessageBody({ html }: { html?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const root = ref.current;
    // Render inline math
    const inlineEls = root.querySelectorAll('span[data-type="inline-math"]');
    inlineEls.forEach((el) => {
      const latex = (el as HTMLElement).getAttribute('data-latex') || '';
      try { katex.render(latex, el as HTMLElement, { throwOnError: false, displayMode: false }); } catch {}
    });
    // Render block math
    const blockEls = root.querySelectorAll('div[data-type="block-math"]');
    blockEls.forEach((el) => {
      const latex = (el as HTMLElement).getAttribute('data-latex') || '';
      try { katex.render(latex, el as HTMLElement, { throwOnError: false, displayMode: true }); } catch {}
    });

    // Ensure wide content like tables and code blocks scroll horizontally instead of overflowing
    const wrapIfNeeded = (el: HTMLElement) => {
      const parent = el.parentElement;
      if (!parent) return;
      // Avoid double wrapping
      if (parent.classList.contains('hl-scroll-wrap')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'hl-scroll-wrap w-full max-w-full overflow-x-auto';
      parent.insertBefore(wrapper, el);
      wrapper.appendChild(el);
    };
    // Tables
    root.querySelectorAll('table').forEach((t) => {
      const tbl = t as HTMLElement;
      tbl.classList.add('min-w-max');
      wrapIfNeeded(tbl);
    });
    // Code blocks
    root.querySelectorAll('pre').forEach((p) => {
      const pre = p as HTMLElement;
      pre.classList.add('overflow-x-auto');
      // Don't wrap if pre already scrolls, but ensure container doesn't clip
    });
  });
  if (!html) return null;
  return (
    <div
      ref={ref}
      className="prose max-w-none text-sm break-words message-body"
      style={{ color: '#000' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

