import React from 'react';
import { useEffect, useState } from 'react';

export function AttachmentPreview({ a, onImageClick, onVideoClick }: { a: any; onImageClick?: (src: string) => void; onVideoClick?: (src: string) => void }) {
  const canOpenViewer = typeof a.size === 'number' ? a.size <= 20 * 1024 * 1024 : true;
  if (a.type?.startsWith('image/')) return (
    <div className="relative group w-24 h-24 rounded-lg border border-slate-700/70 shadow-md shadow-black/40 bg-slate-900/40 overflow-hidden grid place-items-center">
      <img
        src={a.url}
        alt={a.filename}
        onClick={() => { if (canOpenViewer) onImageClick?.(a.url); }}
        className="max-w-full max-h-full object-contain cursor-zoom-in select-none"
        draggable={false}
      />
      <a
        href={a.url}
        download={a.filename || true}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition bg-slate-900/80 border border-slate-700/70 text-[10px] px-1.5 py-0.5 rounded-md hover:bg-slate-800"
        title="Download image"
        onClick={(e) => e.stopPropagation()}
      >
        Download
      </a>
      <span className="absolute bottom-1 right-1 left-1 text-[10px] px-1 py-0.5 rounded bg-black/50 backdrop-blur text-slate-200 opacity-0 group-hover:opacity-100 transition truncate" title={a.filename}>{a.filename}</span>
    </div>
  );
  if (a.type?.startsWith('video/')) return (
    <div className="relative group w-24 h-24 rounded-lg border border-slate-700/70 shadow-md shadow-black/40 bg-slate-900/40 overflow-hidden grid place-items-center">
      <video
        preload="metadata"
        crossOrigin="anonymous"
        playsInline
        muted
        className="max-w-full max-h-full object-contain cursor-pointer select-none"
        onClick={() => onVideoClick?.(a.url)}
      >
        <source src={a.url} type={(a.type || '').split(';')[0] || 'video/mp4'} />
        Your browser does not support the video tag.
      </video>
      <a
        href={a.url}
        download={a.filename || true}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition bg-slate-900/80 border border-slate-700/70 text-[10px] px-1.5 py-0.5 rounded-md hover:bg-slate-800"
        title="Download video"
        onClick={(e) => e.stopPropagation()}
      >
        Download
      </a>
      <span className="absolute bottom-1 right-1 left-1 text-[10px] px-1 py-0.5 rounded bg-black/50 backdrop-blur text-slate-200 opacity-0 group-hover:opacity-100 transition truncate" title={a.filename}>{a.filename}</span>
    </div>
  );
  if(a.type?.startsWith('audio/')) return (
    <div className="w-full">
      <audio controls preload="metadata" crossOrigin="anonymous" className="w-full">
        <source src={a.url} type={(a.type || '').split(';')[0] || undefined} />
        Your browser does not support the audio element.
      </audio>
      <div className="text-[10px] mt-1 text-slate-400 break-all flex items-center justify-between gap-2">
        <span className="truncate" title={a.filename}>{a.filename}</span>
        <a
          href={a.url}
          download={a.filename || true}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-slate-200"
          title="Download audio"
        >
          Download
        </a>
      </div>
    </div>
  );
  return <a href={a.url} target="_blank" rel="noopener" className="text-xs underline break-all text-indigo-200 hover:text-indigo-100">{a.filename || a.url}</a>;
}

export function SelectedAttachmentPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => { URL.revokeObjectURL(u); };
  }, [file]);

  const sizeKB = Math.round(file.size / 1024);
  const isImage = file.type?.startsWith('image/');
  const isAudio = file.type?.startsWith('audio/');
  const isVideo = file.type?.startsWith('video/');

  if (isImage) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-slate-600/60 bg-slate-800/60 text-[11px]">
        <span className="max-w-[14rem] truncate" title={`${file.name} • ${sizeKB} KB`}>{file.name}</span>
        <span className="opacity-60">({sizeKB} KB)</span>
        <button type="button" onClick={onRemove} className="ml-1 px-1 rounded bg-slate-700 hover:bg-slate-600" aria-label={`Remove ${file.name}`} title="Remove file">×</button>
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="w-full p-2 border border-slate-600/60 bg-slate-800/60 rounded-md">
        {url ? (
          <audio controls preload="metadata" crossOrigin="anonymous" className="w-full">
            <source src={url} type={file.type?.split(';')[0] || 'audio/mpeg'} />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <div className="text-[10px] text-slate-400">Preparing audio…</div>
        )}
        <div className="mt-1 flex items-center justify-between text-[10px]">
          <span className="truncate" title={`${file.name} • ${sizeKB} KB`}>{file.name}</span>
          <button type="button" onClick={onRemove} className="px-1 rounded bg-slate-700 hover:bg-slate-600" aria-label={`Remove ${file.name}`}>×</button>
        </div>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-slate-600/60 bg-slate-800/60 text-[11px]">
        <span className="max-w-[14rem] truncate" title={`${file.name} • ${sizeKB} KB`}>{file.name}</span>
        <span className="opacity-60">({sizeKB} KB)</span>
        <button type="button" onClick={onRemove} className="ml-1 px-1 rounded bg-slate-700 hover:bg-slate-600" aria-label={`Remove ${file.name}`} title="Remove file">×</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-slate-600/60 bg-slate-800/60 text-[11px]">
      <span className="max-w-[14rem] truncate" title={`${file.name} • ${sizeKB} KB`}>{file.name}</span>
      <span className="opacity-60">({sizeKB} KB)</span>
      <button type="button" onClick={onRemove} className="ml-1 px-1 rounded bg-slate-700 hover:bg-slate-600" aria-label={`Remove ${file.name}`} title="Remove file">×</button>
    </div>
  );
}