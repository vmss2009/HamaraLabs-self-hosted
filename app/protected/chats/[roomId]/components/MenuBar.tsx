"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/core";
import * as Popover from "@radix-ui/react-popover";
import katex from "katex";
import clsx from "clsx";
import {
  IconBold,
  IconBraces,
  IconCode,
  IconHR,
  IconItalic,
  IconListBullet,
  IconListOrdered,
  IconMath,
  IconPilcrow,
  IconQuote,
  IconRedo,
  IconReturn,
  IconStrikethrough,
  IconUndo,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustify,
  IconPalette,
  IconTable,
  IconPaperclip,
  IconMic,
  IconStop,
  IconSend,
  IconCheck,
  IconX,
  IconChevronDown,
} from "./Icons";

function useEditorState<T>({ editor, selector }: { editor: Editor; selector: (ctx: { editor: Editor }) => T; }): T {
  const compute = useCallback(() => selector({ editor }), [editor, selector]);
  const [state, setState] = useState<T>(() => compute());
  useEffect(() => {
    if (!editor) return;
    const update = () => setState(compute());
    editor.on("update", update);
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("update", update);
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor, compute]);
  return state;
}

type MenuBarProps = {
  editor: Editor;
  onAttach?: () => void;
  isUploading?: boolean;
  onToggleRecording?: () => void;
  isRecording?: boolean;
  attachmentsCount?: number;
  maxFiles?: number;
  showJumpToLatest?: boolean;
  onJumpToLatest?: () => void;
  onSend?: () => void;
  canSend?: boolean;
  showSend?: boolean;
  isEditing?: boolean;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  canSaveEdit?: boolean;
};

export function MenuBar({ editor, onAttach, isUploading, onToggleRecording, isRecording, attachmentsCount, maxFiles, showJumpToLatest, onJumpToLatest, onSend, canSend, showSend, isEditing, onSaveEdit, onCancelEdit, canSaveEdit }: MenuBarProps) {
  const [latex, setLatex] = useState<string>("x^2");

  const applyHeading = useCallback((level: 1 | 2 | 3 | 4 | 5 | 6) => { editor.chain().focus().toggleHeading({ level }).run(); }, [editor]);
  const [mathOpen, setMathOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"inline" | "block">("inline");
  const [hlColor, setHlColor] = useState<string>("#fef08a");
  const [tcColor, setTcColor] = useState<string>("#ef4444");
  const [editExisting, setEditExisting] = useState<null | "inline" | "block">(null);
  const [editRange, setEditRange] = useState<null | { from: number; to: number }>(null);
  const previewHtml = useMemo(() => { try { return katex.renderToString(latex || "", { throwOnError: false, displayMode: previewMode === "block" }); } catch { return ""; } }, [latex, previewMode]);

  useEffect(() => {
    const onOpen = (e: any) => {
      const d = e?.detail || {};
      if (typeof d.latex === "string") setLatex(d.latex);
      const m = d.mode === "block" ? "block" : "inline";
      setPreviewMode(m);
      setEditExisting(m);
      if (typeof d.fromPos === "number" && typeof d.toPos === "number") { setEditRange({ from: d.fromPos, to: d.toPos }); } else { setEditRange(null); }
      setMathOpen(true);
    };
    window.addEventListener("tiptap:open-math-popover", onOpen as EventListener);
    return () => window.removeEventListener("tiptap:open-math-popover", onOpen as EventListener);
  }, []);

  const insertLatex = useCallback((value: string, mode: "inline" | "block") => {
    const anyEditor = editor as any;
    if (editExisting && editRange) {
      try {
        const ok = mode === "inline"
          ? anyEditor?.chain().focus().updateInlineMath({ latex: value, pos: editRange.from }).run()
          : anyEditor?.chain().focus().updateBlockMath({ latex: value, pos: editRange.from }).run();
        if (ok) { setEditExisting(null); setEditRange(null); return true; }
      } catch {}
      try {
        const success = anyEditor?.chain?.().focus().command(({ tr, state, dispatch }: any) => {
          const { from, to } = editRange;
          const nodeAtFrom = state.doc.nodeAt(from);
          if (!nodeAtFrom) return false;
          const newTypeName = mode === "block" ? "blockMath" : "inlineMath";
          const nodeType = state.schema.nodes[newTypeName];
          const newNode = nodeType.create({ ...(nodeAtFrom.attrs || {}), latex: value });
          if (!newNode) return false;
          tr.replaceWith(from, to, newNode);
          dispatch?.(tr);
          return true;
        }).run();
        if (success) { setEditExisting(null); setEditRange(null); return true; }
      } catch {}
      setEditExisting(null);
      setEditRange(null);
    }
    try {
      if (mode === "inline") { if (anyEditor?.chain().focus().insertInlineMath({ latex: value }).run()) return true; }
      else { if (anyEditor?.chain().focus().insertBlockMath({ latex: value }).run()) return true; }
    } catch {}
    try {
      if (mode === "inline") { if (anyEditor.chain().focus().insertContent({ type: "inlineMath", attrs: { latex: value } }).run()) return true; }
      else { if (anyEditor.chain().focus().insertContent({ type: "blockMath", attrs: { latex: value } }).run()) return true; }
    } catch {}
    if (mode === "inline") { return anyEditor.chain().focus().insertContent(`$${value}$`).run(); }
    return anyEditor.chain().focus().insertContent(`\n$$${value}$$\n`).run();
  }, [editor, editExisting, editRange]);

  const editorState = useEditorState({ editor, selector: (ctx) => ({
    isBold: ctx.editor.isActive("bold") ?? false,
    canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
    isItalic: ctx.editor.isActive("italic") ?? false,
    canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
    isStrike: ctx.editor.isActive("strike") ?? false,
    canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
    isCode: ctx.editor.isActive("code") ?? false,
    canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
    isHighlight: ctx.editor.isActive("highlight") ?? false,
    canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
    isParagraph: ctx.editor.isActive("paragraph") ?? false,
    isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
    isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
    isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
    isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
    isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
    isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
    isBulletList: ctx.editor.isActive("bulletList") ?? false,
    isOrderedList: ctx.editor.isActive("orderedList") ?? false,
    isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
    isBlockquote: ctx.editor.isActive("blockquote") ?? false,
    isAlignLeft: ctx.editor.isActive({ textAlign: "left" }) ?? false,
    isAlignCenter: ctx.editor.isActive({ textAlign: "center" }) ?? false,
    isAlignRight: ctx.editor.isActive({ textAlign: "right" }) ?? false,
    isAlignJustify: ctx.editor.isActive({ textAlign: "justify" }) ?? false,
    currentColor: (ctx.editor.getAttributes("textStyle")?.color || null) as string | null,
    canUndo: ctx.editor.can().chain().undo().run() ?? false,
    canRedo: ctx.editor.can().chain().redo().run() ?? false,
  }) });

  return (
    <div className="control-group">
      <div className="button-group flex items-center mb-2 text-xs relative z-10">
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto whitespace-nowrap">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button title="Format" aria-label="Format" className="p-2 rounded border"><IconBold className="h-4 w-4" /></button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content side="top" align="end" sideOffset={6} collisionPadding={{ left: 12, right: 12 }} onOpenAutoFocus={(e) => e.preventDefault()} className="z-[1000] rounded-md border border-slate-700/70 bg-slate-900/95 p-2 shadow-xl shadow-black/50 space-x-2 flex">
                <div className="flex gap-1">
                  <button title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editorState.canBold} className={clsx("p-2 rounded border", editorState.isBold && "bg-indigo-600 text-white")}> <IconBold className="h-4 w-4" /> </button>
                  <button title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editorState.canItalic} className={clsx("p-2 rounded border", editorState.isItalic && "bg-indigo-600 text-white")}> <IconItalic className="h-4 w-4" /> </button>
                  <button title="Strike" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editorState.canStrike} className={clsx("p-2 rounded border", editorState.isStrike && "bg-indigo-600 text-white")}> <IconStrikethrough className="h-4 w-4" /> </button>
                  <button title="Code" onClick={() => editor.chain().focus().toggleCode().run()} disabled={!editorState.canCode} className={clsx("p-2 rounded border", editorState.isCode && "bg-indigo-600 text-white")}> <IconCode className="h-4 w-4" /> </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <Popover.Root>
            <Popover.Trigger asChild>
              <button title="Blocks" aria-label="Blocks" className="p-2 rounded border"><IconPilcrow className="h-4 w-4" /></button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content side="top" align="end" sideOffset={6} collisionPadding={{ left: 12, right: 12 }} onOpenAutoFocus={(e) => e.preventDefault()} className="z-[1000] rounded-md border border-slate-700/70 bg-slate-900/95 p-3 shadow-xl shadow-black/50 space-y-2">
                <div className="flex gap-1">
                  <button title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} className="p-2 rounded border"><IconPilcrow className="h-4 w-4" /></button>
                  <button title="H1" onClick={() => applyHeading(1)} className="p-2 rounded border">H1</button>
                  <button title="H2" onClick={() => applyHeading(2)} className="p-2 rounded border">H2</button>
                  <button title="H3" onClick={() => applyHeading(3)} className="p-2 rounded border">H3</button>
                  <button title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="p-2 rounded border"><IconQuote className="h-4 w-4" /></button>
                  <button title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="p-2 rounded border"><IconBraces className="h-4 w-4" /></button>
                  <button title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="p-2 rounded border"><IconHR className="h-4 w-4" /></button>
                  <button title="Line break" onClick={() => editor.chain().focus().setHardBreak().run()} className="p-2 rounded border"><IconReturn className="h-4 w-4" /></button>
                </div>
                <div className="flex gap-1">
                  <button title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-2 rounded border"><IconListBullet className="h-4 w-4" /></button>
                  <button title="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="p-2 rounded border"><IconListOrdered className="h-4 w-4" /></button>
                  <button title="Align left" onClick={() => editor.chain().focus().setTextAlign('left').run()} className="p-2 rounded border"><IconAlignLeft className="h-4 w-4" /></button>
                  <button title="Align center" onClick={() => editor.chain().focus().setTextAlign('center').run()} className="p-2 rounded border"><IconAlignCenter className="h-4 w-4" /></button>
                  <button title="Align right" onClick={() => editor.chain().focus().setTextAlign('right').run()} className="p-2 rounded border"><IconAlignRight className="h-4 w-4" /></button>
                  <button title="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className="p-2 rounded border"><IconAlignJustify className="h-4 w-4" /></button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <Popover.Root open={styleOpen} onOpenChange={setStyleOpen}>
            <Popover.Trigger asChild>
              <button title="Styles" aria-label="Styles" className="p-2 rounded border"><IconPalette className="h-4 w-4" /></button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content side="top" align="end" sideOffset={6} collisionPadding={{ left: 12, right: 12 }} onOpenAutoFocus={(e) => e.preventDefault()} className="z-[1000] rounded-md border border-slate-700/70 bg-slate-900/95 p-3 shadow-xl shadow-black/50 space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-slate-400">Highlight</label>
                  <input type="color" value={hlColor} onChange={(e) => setHlColor(e.target.value)} className="h-6 w-6 rounded overflow-hidden" />
                  <button className="px-2 py-1 text-[11px] rounded bg-slate-800 border border-slate-700/70" onClick={() => editor.chain().focus().toggleHighlight({ color: hlColor }).run()}>Apply</button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-slate-400">Text color</label>
                  <input type="color" value={tcColor} onChange={(e) => setTcColor(e.target.value)} className="h-6 w-6 rounded overflow-hidden" />
                  <button className="px-2 py-1 text-[11px] rounded bg-slate-800 border border-slate-700/70" onClick={() => editor.chain().focus().setColor(tcColor).run()}>Apply</button>
                  <button className="px-2 py-1 text-[11px] rounded bg-slate-800 border border-slate-700/70" onClick={() => editor.chain().focus().unsetColor().run()}>Clear</button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <Popover.Root open={mathOpen} onOpenChange={setMathOpen}>
            <Popover.Trigger asChild>
              <button title="Math" aria-label="Math" className="p-2 rounded border"><IconMath className="h-4 w-4" /></button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content side="top" align="end" sideOffset={6} collisionPadding={10} onOpenAutoFocus={(e) => e.preventDefault()} className="z-[1000] w-[min(420px,90vw)] rounded-md border border-slate-700/70 bg-slate-900/95 p-3 shadow-xl shadow-black/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400">TeX</div>
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 text-[11px] rounded bg-slate-800 border border-slate-700/70" onClick={() => setPreviewMode('inline')}>Inline</button>
                      <button className="px-2 py-1 text-[11px] rounded bg-slate-800 border border-slate-700/70" onClick={() => setPreviewMode('block')}>Block</button>
                    </div>
                  </div>
                  <textarea value={latex} onChange={(e) => setLatex(e.target.value)} className="w-full h-24 rounded bg-slate-800/70 border border-slate-700/70 px-2 py-1 text-sm focus:outline-none" />
                  <div className="text-[11px] text-slate-400">Preview:</div>
                  <div className="min-h-10 p-2 rounded bg-slate-800/50 border border-slate-700/70" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  <div className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <button className="px-3 py-1 text-[11px] rounded bg-slate-800 border border-slate-700/70" onClick={onCancelEdit}><IconX className="h-3.5 w-3.5 inline" /> Cancel</button>
                        <button className="px-3 py-1 text-[11px] rounded bg-indigo-600" disabled={!canSaveEdit} onClick={onSaveEdit}><IconCheck className="h-3.5 w-3.5 inline" /> Save</button>
                      </>
                    ) : (
                      <button className="px-3 py-1 text-[11px] rounded bg-indigo-600" onClick={() => { insertLatex(latex, previewMode); setMathOpen(false); }}>Insert</button>
                    )}
                  </div>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <button title="Attach files" aria-label="Attach files" className="p-2 rounded border" onClick={onAttach}><IconPaperclip className="h-4 w-4" /></button>
          <button title={isRecording ? 'Stop' : 'Record audio'} aria-label="Record" className="p-2 rounded border" onClick={onToggleRecording}>{isRecording ? <IconStop className="h-4 w-4" /> : <IconMic className="h-4 w-4" />}</button>
          {showJumpToLatest && <button title="Jump to latest" className="ml-auto p-2 rounded border" onClick={onJumpToLatest}><IconChevronDown className="h-4 w-4" /></button>}
        </div>
        {showSend && (
          <div className="ml-2 flex items-center gap-2">
            {isEditing ? (
              <>
                <button className="px-2 py-1 text-[11px] rounded bg-slate-800 border border-slate-700/70" onClick={onCancelEdit}><IconX className="h-4 w-4 inline" /> Cancel</button>
                <button className="px-2 py-1 text-[11px] rounded bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed" onClick={onSaveEdit} disabled={!canSaveEdit}><IconCheck className="h-4 w-4 inline" /> Save</button>
              </>
            ) : (
              <button className="px-2 py-1 text-[11px] rounded bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed" onClick={onSend} disabled={!canSend}><IconSend className="h-4 w-4 inline" /></button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}