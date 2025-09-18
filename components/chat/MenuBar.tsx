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
} from "./Icons";

function useEditorState<T>({
  editor,
  selector,
}: {
  editor: Editor;
  selector: (ctx: { editor: Editor }) => T;
}): T {
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
  // Edit controls
  isEditing?: boolean;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  canSaveEdit?: boolean;
};

export function MenuBar({
  editor,
  onAttach,
  isUploading,
  onToggleRecording,
  isRecording,
  attachmentsCount,
  maxFiles,
  showJumpToLatest,
  onJumpToLatest,
  onSend,
  canSend,
  showSend,
  isEditing,
  onSaveEdit,
  onCancelEdit,
  canSaveEdit,
}: MenuBarProps) {
  const [latex, setLatex] = useState<string>("x^2");

  // Apply heading to the current block (or selection of blocks)
  const applyHeading = useCallback(
    (level: 1 | 2 | 3 | 4 | 5 | 6) => {
      editor.chain().focus().toggleHeading({ level }).run();
    },
    [editor]
  );
  const [mathOpen, setMathOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"inline" | "block">("inline");
  // Highlight UI state
  const [hlColor, setHlColor] = useState<string>("#fef08a");
  // Text color UI state
  const [tcColor, setTcColor] = useState<string>("#ef4444");
  const [editExisting, setEditExisting] = useState<null | "inline" | "block">(
    null
  );
  const [editRange, setEditRange] = useState<null | {
    from: number;
    to: number;
  }>(null);
  const previewHtml = useMemo(() => {
    try {
      return katex.renderToString(latex || "", {
        throwOnError: false,
        displayMode: previewMode === "block",
      });
    } catch {
      return "";
    }
  }, [latex, previewMode]);

  // Listen for clicks on math nodes to open the popover in edit mode
  useEffect(() => {
    const onOpen = (e: any) => {
      const d = e?.detail || {};
      if (typeof d.latex === "string") setLatex(d.latex);
      const m = d.mode === "block" ? "block" : "inline";
      setPreviewMode(m);
      setEditExisting(m);
      if (typeof d.fromPos === "number" && typeof d.toPos === "number") {
        setEditRange({ from: d.fromPos, to: d.toPos });
      } else {
        setEditRange(null);
      }
      setMathOpen(true);
    };
    window.addEventListener(
      "tiptap:open-math-popover",
      onOpen as EventListener
    );
    return () =>
      window.removeEventListener(
        "tiptap:open-math-popover",
        onOpen as EventListener
      );
  }, []);

  // Helper that attempts insertion or edit of math nodes
  const insertLatex = useCallback(
    (value: string, mode: "inline" | "block") => {
      const anyEditor = editor as any;

      // First, if editing an existing node and we have its range, update in place using extension commands or replace
      if (editExisting && editRange) {
        try {
          const ok =
            mode === "inline"
              ? anyEditor
                  ?.chain()
                  .focus()
                  .updateInlineMath({ latex: value, pos: editRange.from })
                  .run()
              : anyEditor
                  ?.chain()
                  .focus()
                  .updateBlockMath({ latex: value, pos: editRange.from })
                  .run();
          if (ok) {
            setEditExisting(null);
            setEditRange(null);
            return true;
          }
        } catch {}
        try {
          const success = anyEditor
            ?.chain?.()
            .focus()
            .command(({ tr, state, dispatch }: any) => {
              const { from, to } = editRange;
              const nodeAtFrom = state.doc.nodeAt(from);
              if (!nodeAtFrom) return false;
              const newTypeName = mode === "block" ? "blockMath" : "inlineMath";
              const nodeType = state.schema.nodes[newTypeName];
              const newNode = nodeType.create({
                ...(nodeAtFrom.attrs || {}),
                latex: value,
              });
              if (!newNode) return false;
              tr.replaceWith(from, to, newNode);
              dispatch?.(tr);
              return true;
            })
            .run();
          if (success) {
            setEditExisting(null);
            setEditRange(null);
            return true;
          }
        } catch {}
        setEditExisting(null);
        setEditRange(null);
      }

      // 1) Use extension commands
      try {
        if (mode === "inline") {
          if (
            anyEditor?.chain().focus().insertInlineMath({ latex: value }).run()
          )
            return true;
        } else {
          if (
            anyEditor?.chain().focus().insertBlockMath({ latex: value }).run()
          )
            return true;
        }
      } catch {}

      // 2) JSON nodes
      try {
        if (mode === "inline") {
          if (
            anyEditor
              .chain()
              .focus()
              .insertContent({ type: "inlineMath", attrs: { latex: value } })
              .run()
          )
            return true;
        } else {
          if (
            anyEditor
              .chain()
              .focus()
              .insertContent({ type: "blockMath", attrs: { latex: value } })
              .run()
          )
            return true;
        }
      } catch {}

      // 3) TeX delimiter fallback matching this extension's input rules (inline: $$, block: $$$)
      if (mode === "inline") {
        return anyEditor.chain().focus().insertContent(`$$${value}$$`).run();
      }
      return anyEditor
        .chain()
        .focus()
        .insertContent(`\n$$$${value}$$$\n`)
        .run();
    },
    [editor, editExisting, editRange]
  );

  // Read the current editor's state, and re-render the component when it changes
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
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
        currentColor: (ctx.editor.getAttributes("textStyle")?.color || null) as
          | string
          | null,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      };
    },
  });

  return (
    <div className="control-group">
      <div className="button-group flex items-center mb-2 text-xs relative z-10">
        {/* Left tool groups: single row with horizontal scroll on overflow */}
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto whitespace-nowrap">
          {/* Format group */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                title="Format"
                aria-label="Format"
                className="p-2 rounded menu-icon-btn"
              >
                <IconBold className="h-4 w-4" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="end"
                sideOffset={6}
                collisionPadding={{ left: 12, right: 12 }}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="z-[1000] rounded-md popover-surface p-2 space-x-2 flex"
              >
                <div className="flex gap-1">
                  <button
                    title="Bold"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editorState.canBold}
                    className={clsx(
                      "p-2 rounded menu-icon-btn",
                      editorState.isBold && "menu-icon-btn-active"
                    )}
                  >
                    <IconBold className="h-4 w-4" />
                  </button>
                  <button
                    title="Italic"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editorState.canItalic}
                    className={clsx(
                      "p-2 rounded menu-icon-btn",
                      editorState.isItalic && "menu-icon-btn-active"
                    )}
                  >
                    <IconItalic className="h-4 w-4" />
                  </button>
                  <button
                    title="Strike"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editorState.canStrike}
                    className={clsx(
                      "p-2 rounded menu-icon-btn",
                      editorState.isStrike && "menu-icon-btn-active"
                    )}
                  >
                    <IconStrikethrough className="h-4 w-4" />
                  </button>
                  <button
                    title="Code"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={!editorState.canCode}
                    className={clsx(
                      "p-2 rounded menu-icon-btn",
                      editorState.isCode && "menu-icon-btn-active"
                    )}
                  >
                    <IconCode className="h-4 w-4" />
                  </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {/* Block group */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                title="Blocks"
                aria-label="Blocks"
                className="p-2 rounded menu-icon-btn"
              >
                <IconPilcrow className="h-4 w-4" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="end"
                sideOffset={6}
                collisionPadding={{ left: 12, right: 12 }}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="z-[1000] rounded-md popover-surface p-3 space-y-2"
              >
                <div className="flex gap-1">
                  <button
                    title="Paragraph"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={clsx(
                      "p-2 rounded menu-icon-btn",
                      editorState.isParagraph && "menu-icon-btn-active"
                    )}
                  >
                    <IconPilcrow className="h-4 w-4" />
                  </button>
                  <button
                    title="Blockquote"
                    onClick={() =>
                      editor.chain().focus().toggleBlockquote().run()
                    }
                    className={clsx(
                      "p-2 rounded menu-icon-btn",
                      editorState.isBlockquote && "menu-icon-btn-active"
                    )}
                  >
                    <IconQuote className="h-4 w-4" />
                  </button>
                  <button
                    title="Code block"
                    onClick={() =>
                      editor.chain().focus().toggleCodeBlock().run()
                    }
                    className={clsx(
                      "p-2 rounded menu-icon-btn",
                      editorState.isCodeBlock && "menu-icon-btn-active"
                    )}
                  >
                    <IconBraces className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((lvl) => (
                    <button
                      key={lvl}
                      title={`H${lvl}`}
                      onClick={() => applyHeading(lvl as any)}
                      className={clsx(
                        "p-2 rounded menu-icon-btn",
                        editor.isActive("heading", { level: lvl }) &&
                          "menu-icon-btn-active"
                      )}
                    >
                      <span className="text-[10px] font-semibold">H{lvl}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    title="Horizontal rule"
                    onClick={() =>
                      editor.chain().focus().setHorizontalRule().run()
                    }
                    className="p-2 rounded menu-icon-btn"
                  >
                    <IconHR className="h-4 w-4" />
                  </button>
                  <button
                    title="Hard break"
                    onClick={() => editor.chain().focus().setHardBreak().run()}
                    className="p-2 rounded menu-icon-btn"
                  >
                    <IconReturn className="h-4 w-4" />
                  </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {/* Lists group */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                title="Lists"
                aria-label="Lists"
                className="p-2 rounded menu-icon-btn"
              >
                <IconListBullet className="h-4 w-4" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="end"
                sideOffset={6}
                collisionPadding={{ left: 12, right: 12 }}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="z-[1000] rounded-md popover-surface p-2 flex gap-1"
              >
                <button
                  title="Bulleted list"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className={clsx(
                    "p-2 rounded menu-icon-btn",
                    editorState.isBulletList && "menu-icon-btn-active"
                  )}
                >
                  <IconListBullet className="h-4 w-4" />
                </button>
                <button
                  title="Ordered list"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  className={clsx(
                    "p-2 rounded menu-icon-btn",
                    editorState.isOrderedList && "menu-icon-btn-active"
                  )}
                >
                  <IconListOrdered className="h-4 w-4" />
                </button>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {/* Align group */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                title="Align"
                aria-label="Align"
                className="p-2 rounded menu-icon-btn"
              >
                <IconAlignCenter className="h-4 w-4" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="end"
                sideOffset={6}
                collisionPadding={{ left: 12, right: 12 }}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="z-[1000] rounded-md popover-surface p-2 flex gap-1"
              >
                <button
                  title="Align left"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                  className={clsx(
                    "p-2 rounded menu-icon-btn",
                    editorState.isAlignLeft && "menu-icon-btn-active"
                  )}
                >
                  <IconAlignLeft className="h-4 w-4" />
                </button>
                <button
                  title="Align center"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                  }
                  className={clsx(
                    "p-2 rounded menu-icon-btn",
                    editorState.isAlignCenter && "menu-icon-btn-active"
                  )}
                >
                  <IconAlignCenter className="h-4 w-4" />
                </button>
                <button
                  title="Align right"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                  }
                  className={clsx(
                    "p-2 rounded menu-icon-btn",
                    editorState.isAlignRight && "menu-icon-btn-active"
                  )}
                >
                  <IconAlignRight className="h-4 w-4" />
                </button>
                <button
                  title="Justify"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("justify").run()
                  }
                  className={clsx(
                    "p-2 rounded menu-icon-btn",
                    editorState.isAlignJustify && "menu-icon-btn-active"
                  )}
                >
                  <IconAlignJustify className="h-4 w-4" />
                </button>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {/* Style group */}
          <Popover.Root open={styleOpen} onOpenChange={setStyleOpen}>
            <Popover.Trigger asChild>
              <button
                title="Style"
                aria-label="Style"
                className="p-2 rounded menu-icon-btn"
              >
                <IconPalette className="h-4 w-4" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="end"
                sideOffset={6}
                collisionPadding={{ left: 12, right: 12 }}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="z-[1000] rounded-md popover-surface p-3 w-[26rem] sm:w-[30rem] max-w-[95vw] space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                  <div className="rounded-md popover-section p-2">
                    <div className="text-[11px] uppercase tracking-wider opacity-70 mb-1">
                      Text
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {[
                        "#ef4444",
                        "#22c55e",
                        "#3b82f6",
                        "#a855f7",
                        "#f59e0b",
                        "#e5e7eb",
                        "#14b8a6",
                      ].map((c) => (
                        <button
                          key={c}
                          title={c}
                          aria-label={`Text color ${c}`}
                          onClick={() => {
                            editor.chain().focus().setColor(c).run();
                            setTcColor(c);
                            setStyleOpen(false);
                          }}
                          className="h-6 w-6 rounded border"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <button
                        title="Clear"
                        onClick={() => {
                          editor.chain().focus().unsetColor().run();
                          setStyleOpen(false);
                        }}
                        className="col-span-2 text-[11px] px-2 py-1 rounded menu-icon-btn hover:menu-icon-btn-active"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="color"
                        value={tcColor || "#000000"}
                        onChange={(e) => setTcColor(e.target.value)}
                        className="h-6 w-10 rounded border menu-icon-btn"
                      />
                      <input
                        value={tcColor}
                        onChange={(e) => setTcColor(e.target.value)}
                        className="flex-1 rounded border px-2 py-1 text-xs focus:outline-none focus:ring-0 menu-icon-btn"
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => {
                          editor.chain().focus().setColor(tcColor).run();
                          setStyleOpen(false);
                        }}
                        className="text-[11px] px-3 py-1 rounded menu-icon-btn hover:menu-icon-btn-active"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                  <div className="rounded-md popover-section p-2">
                    <div className="text-[11px] uppercase tracking-wider opacity-70 mb-1">
                      Highlight
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {[
                        "#fef08a",
                        "#bbf7d0",
                        "#bfdbfe",
                        "#fbcfe8",
                        "#e9d5ff",
                        "#fed7aa",
                        "#e5e7eb",
                      ].map((c) => (
                        <button
                          key={c}
                          title={c}
                          aria-label={`Highlight ${c}`}
                          onClick={() => {
                            editor
                              .chain()
                              .focus()
                              .setHighlight({ color: c })
                              .run();
                            setHlColor(c);
                            setStyleOpen(false);
                          }}
                          className="h-6 w-6 rounded border"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <button
                        title="Clear"
                        onClick={() => {
                          editor.chain().focus().unsetHighlight().run();
                          setStyleOpen(false);
                        }}
                        className="col-span-2 text-[11px] px-2 py-1 rounded menu-icon-btn hover:menu-icon-btn-active"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={hlColor}
                        onChange={(e) => setHlColor(e.target.value)}
                        className="h-6 w-10 rounded border menu-icon-btn"
                      />
                      <input
                        value={hlColor}
                        onChange={(e) => setHlColor(e.target.value)}
                        className="flex-1 rounded border px-2 py-1 text-xs focus:outline-none focus:ring-0 menu-icon-btn"
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => {
                          editor
                            .chain()
                            .focus()
                            .setHighlight({ color: hlColor })
                            .run();
                          setStyleOpen(false);
                        }}
                        className="text-[11px] px-3 py-1 rounded menu-icon-btn hover:menu-icon-btn-active"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {/* Table group */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                title="Table"
                aria-label="Table"
                className="p-2 rounded menu-icon-btn"
              >
                <IconTable className="h-4 w-4" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="end"
                sideOffset={6}
                collisionPadding={{ left: 12, right: 12 }}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="z-[1000] rounded-md popover-surface p-3 w-[18rem] space-y-2"
              >
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 text-xs rounded menu-icon-btn"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                        .run()
                    }
                  >
                    Insert 3x3
                  </button>
                  <button
                    className="px-2 py-1 text-xs rounded menu-icon-btn"
                    onClick={() => editor.chain().focus().deleteTable().run()}
                  >
                    Delete table
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    className="px-2 py-1 rounded menu-icon-btn"
                    onClick={() =>
                      editor.chain().focus().addColumnBefore().run()
                    }
                  >
                    Add column before
                  </button>
                  <button
                    className="px-2 py-1 rounded menu-icon-btn"
                    onClick={() =>
                      editor.chain().focus().addColumnAfter().run()
                    }
                  >
                    Add column after
                  </button>
                  <button
                    className="px-2 py-1 rounded menu-icon-btn"
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                  >
                    Delete column
                  </button>
                  <button
                    className="px-2 py-1 rounded menu-icon-btn"
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                  >
                    Add row before
                  </button>
                  <button
                    className="px-2 py-1 rounded menu-icon-btn"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                  >
                    Add row after
                  </button>
                  <button
                    className="px-2 py-1 rounded menu-icon-btn"
                    onClick={() => editor.chain().focus().deleteRow().run()}
                  >
                    Delete row
                  </button>
                  <button
                    className="px-2 py-1 rounded menu-icon-btn"
                    onClick={() =>
                      editor.chain().focus().toggleHeaderRow().run()
                    }
                  >
                    Toggle header row
                  </button>
                  <button
                    className="px-2 py-1 rounded menu-icon-btn"
                    onClick={() =>
                      editor.chain().focus().toggleHeaderColumn().run()
                    }
                  >
                    Toggle header column
                  </button>
                  <button
                    className="px-2 py-1 rounded menu-icon-btn"
                    onClick={() =>
                      editor.chain().focus().toggleHeaderCell().run()
                    }
                  >
                    Toggle header cell
                  </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {/* History group */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                title="History"
                aria-label="History"
                className="p-2 rounded menu-icon-btn"
              >
                <IconUndo className="h-4 w-4" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="start"
                sideOffset={6}
                collisionPadding={8}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="z-[1000] rounded-md popover-surface p-2 flex gap-1"
              >
                <button
                  title="Undo"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editorState.canUndo}
                  className="p-2 rounded menu-icon-btn disabled:opacity-50"
                >
                  <IconUndo className="h-4 w-4" />
                </button>
                <button
                  title="Redo"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editorState.canRedo}
                  className="p-2 rounded menu-icon-btn disabled:opacity-50"
                >
                  <IconRedo className="h-4 w-4" />
                </button>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {/* Math popover for entering LaTeX with live preview */}
          <Popover.Root open={mathOpen} onOpenChange={setMathOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setMathOpen((o) => !o);
                }}
                className="p-2 rounded menu-icon-btn"
                title="Math"
                aria-label="Math"
              >
                <IconMath className="h-4 w-4" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="end"
                sideOffset={6}
                collisionPadding={{ left: 12, right: 12 }}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="z-[1000] rounded-md popover-surface p-3 w-72 max-w-[90vw] max-h-[70vh] overflow-auto space-y-2"
              >
                <div className="text-[11px] uppercase tracking-wider text-slate-400">
                  Insert LaTeX
                </div>
                <input
                  autoFocus
                  value={latex}
                  onChange={(e) => setLatex(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      insertLatex(latex.trim(), "inline");
                      setMathOpen(false);
                    } else if (e.key === "Enter" && e.shiftKey) {
                      e.preventDefault();
                      insertLatex(latex.trim(), "block");
                      setMathOpen(false);
                    }
                  }}
                  placeholder="e.g. x^2 + y^2 = z^2"
                  className="w-full rounded px-2 py-1 text-sm focus:outline-none focus:ring-0 menu-icon-btn"
                />
                <div className="text-[10px] text-slate-500">
                  Cmd/Ctrl+Enter inserts inline, Shift+Enter inserts block
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("inline")}
                    className={clsx(
                      "text-[11px] px-2 py-1 rounded menu-icon-btn",
                      previewMode === "inline" && "menu-icon-btn-active"
                    )}
                  >
                    Preview: Inline
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("block")}
                    className={clsx(
                      "text-[11px] px-2 py-1 rounded menu-icon-btn",
                      previewMode === "block" && "menu-icon-btn-active"
                    )}
                  >
                    Preview: Block
                  </button>
                </div>
                <div className="rounded-md popover-section p-2 min-h-10 overflow-x-auto">
                  <div
                    className="text-sm katex-preview"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      insertLatex(latex.trim(), "inline");
                      setMathOpen(false);
                    }}
                    className="flex-1 text-xs px-2 py-1 rounded menu-icon-btn hover:menu-icon-btn-active"
                  >
                    Insert Inline
                  </button>
                  <button
                    onClick={() => {
                      insertLatex(latex.trim(), "block");
                      setMathOpen(false);
                    }}
                    className="flex-1 text-xs px-2 py-1 rounded menu-icon-btn hover:menu-icon-btn-active"
                  >
                    Insert Block
                  </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <span className="mx-1 select-none text-slate-600">|</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Attach files"
              aria-label="Attach files"
              onClick={onAttach}
              className="p-2 rounded menu-icon-btn disabled:opacity-50"
              disabled={!!isUploading}
            >
              <IconPaperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              title={isRecording ? "Stop recording" : "Record audio"}
              aria-label={isRecording ? "Stop recording" : "Record audio"}
              onClick={onToggleRecording}
              className="p-2 rounded menu-icon-btn disabled:opacity-50"
              disabled={!!isUploading}
            >
              {isRecording ? (
                <IconStop className="h-4 w-4" />
              ) : (
                <IconMic className="h-4 w-4" />
              )}
            </button>
            {typeof attachmentsCount === "number" &&
              typeof maxFiles === "number" && (
                <span className="ml-1 text-[11px] text-gray-900">
                  {attachmentsCount}/{maxFiles}
                </span>
              )}
          </div>
        </div>
        {/* Right-aligned, fixed controls: Send or Edit actions */}
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {showJumpToLatest && (
            <>
              <span className="mx-1 select-none text-slate-600">|</span>
              <button
                type="button"
                onClick={onJumpToLatest}
                className="ml-1 h-7 w-7 rounded-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-300/50 shadow-md shadow-indigo-900/30 grid place-items-center"
                title="Jump to latest"
                aria-label="Jump to latest"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.8"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}
          {isEditing ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Save edit"
                aria-label="Save edit"
                onClick={onSaveEdit}
                className="p-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-300/50 shadow-md shadow-emerald-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!canSaveEdit}
              >
                <IconCheck className="h-4 w-4 text-white" />
              </button>
              <button
                type="button"
                title="Cancel edit"
                aria-label="Cancel edit"
                onClick={onCancelEdit}
                className="p-2 rounded bg-slate-700 hover:bg-slate-600 text-white border border-slate-400/40 shadow-md shadow-slate-900/20"
              >
                <IconX className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : showSend ? (
            <button
              type="button"
              title="Send"
              aria-label="Send"
              onClick={onSend}
              className="p-2 rounded bg-indigo-700 hover:bg-indigo-600 text-white border border-indigo-400/50 shadow-md shadow-indigo-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!canSend}
            >
              <IconSend className="h-4 w-4 text-white" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
