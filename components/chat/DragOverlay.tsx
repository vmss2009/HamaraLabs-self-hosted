import React from 'react';

export function DragOverlay({ show, remaining }: { show: boolean; remaining: number }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[200]">
      <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-indigo-400/70 bg-slate-900/70 backdrop-blur-sm grid place-items-center">
        <div className="text-center space-y-2">
          <div className="text-sm font-medium text-indigo-200">Drop files to attach</div>
          <div className="text-[11px] text-slate-400">You can add up to {remaining} more file(s)</div>
        </div>
      </div>
    </div>
  );
}
