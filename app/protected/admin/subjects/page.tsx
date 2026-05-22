"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  FiChevronDown,
  FiEdit2,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { MdOutlineBook, MdOutlineBookmark, MdOutlineLabel } from "react-icons/md";
import ReportShell from "@/components/form/ReportShell";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Subtopic {
  id: number;
  subtopic_name: string;
  topic_id: number;
}

interface Topic {
  id: number;
  topic_name: string;
  subject_id: number;
  subtopics: Subtopic[];
}

interface Subject {
  id: number;
  subject_name: string;
  topics: Topic[];
}

type DialogMode = "add" | "edit";

interface ItemDialog {
  open: boolean;
  mode: DialogMode;
  level: "subject" | "topic" | "subtopic";
  name: string;
  parentId?: number;
  targetId?: number;
  error: string | null;
  saving: boolean;
}

interface DeleteDialog {
  open: boolean;
  level: "subject" | "topic" | "subtopic";
  id: number;
  name: string;
  deleting: boolean;
}

const EMPTY_ITEM: ItemDialog = {
  open: false,
  mode: "add",
  level: "subject",
  name: "",
  error: null,
  saving: false,
};

const EMPTY_DELETE: DeleteDialog = {
  open: false,
  level: "subject",
  id: 0,
  name: "",
  deleting: false,
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [item, setItem] = useState<ItemDialog>(EMPTY_ITEM);
  const [del, setDel] = useState<DeleteDialog>(EMPTY_DELETE);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subjects");
      if (!res.ok) throw new Error("Failed to load subjects");
      setSubjects(await res.json());
    } catch {
      setGlobalError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Open helpers ──────────────────────────────────────────────────────────

  const openAddSubject = () =>
    setItem({ ...EMPTY_ITEM, open: true, mode: "add", level: "subject" });

  const openEditSubject = (s: Subject) =>
    setItem({ ...EMPTY_ITEM, open: true, mode: "edit", level: "subject", name: s.subject_name, targetId: s.id });

  const openAddTopic = (subjectId: number) =>
    setItem({ ...EMPTY_ITEM, open: true, mode: "add", level: "topic", parentId: subjectId });

  const openEditTopic = (t: Topic) =>
    setItem({ ...EMPTY_ITEM, open: true, mode: "edit", level: "topic", name: t.topic_name, targetId: t.id });

  const openAddSubtopic = (topicId: number) =>
    setItem({ ...EMPTY_ITEM, open: true, mode: "add", level: "subtopic", parentId: topicId });

  const openEditSubtopic = (st: Subtopic) =>
    setItem({ ...EMPTY_ITEM, open: true, mode: "edit", level: "subtopic", name: st.subtopic_name, targetId: st.id });

  const openDelete = (level: DeleteDialog["level"], id: number, name: string) =>
    setDel({ open: true, level, id, name, deleting: false });

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!item.name.trim()) {
      setItem((p) => ({ ...p, error: "Name is required" }));
      return;
    }
    setItem((p) => ({ ...p, saving: true, error: null }));

    const { mode, level, name, targetId, parentId } = item;
    let url = "";
    let method = "";
    let body: Record<string, unknown> = {};

    if (level === "subject") {
      if (mode === "add") {
        url = "/api/admin/subjects"; method = "POST"; body = { subject_name: name.trim() };
      } else {
        url = `/api/admin/subjects/${targetId}`; method = "PATCH"; body = { subject_name: name.trim() };
      }
    } else if (level === "topic") {
      if (mode === "add") {
        url = "/api/admin/topics"; method = "POST"; body = { topic_name: name.trim(), subject_id: parentId };
      } else {
        url = `/api/admin/topics/${targetId}`; method = "PATCH"; body = { topic_name: name.trim() };
      }
    } else {
      if (mode === "add") {
        url = "/api/admin/subtopics"; method = "POST"; body = { subtopic_name: name.trim(), topic_id: parentId };
      } else {
        url = `/api/admin/subtopics/${targetId}`; method = "PATCH"; body = { subtopic_name: name.trim() };
      }
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message ?? "Failed");
      }
      setItem(EMPTY_ITEM);
      await load();
    } catch (e) {
      setItem((p) => ({
        ...p,
        saving: false,
        error: e instanceof Error ? e.message : "Failed to save",
      }));
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    setDel((p) => ({ ...p, deleting: true }));
    const urls: Record<string, string> = {
      subject: `/api/admin/subjects/${del.id}`,
      topic: `/api/admin/topics/${del.id}`,
      subtopic: `/api/admin/subtopics/${del.id}`,
    };
    try {
      const res = await fetch(urls[del.level], { method: "DELETE" });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message ?? "Failed");
      }
      setDel(EMPTY_DELETE);
      await load();
    } catch (e) {
      setGlobalError(e instanceof Error ? e.message : "Failed to delete");
      setDel(EMPTY_DELETE);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const levelLabel: Record<ItemDialog["level"], string> = {
    subject: "Subject",
    topic: "Topic",
    subtopic: "Subtopic",
  };

  const totalTopics = subjects.reduce((a, s) => a + s.topics.length, 0);
  const totalSubtopics = subjects.reduce(
    (a, s) => a + s.topics.reduce((b, t) => b + t.subtopics.length, 0),
    0,
  );

  return (
    <ReportShell>
      <div className="px-6 pb-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Subject Management</h1>
            <p className="text-gray-300 text-sm mt-1">
              Manage the subject → topic → subtopic curriculum hierarchy
            </p>
          </div>
          <Button
            variant="contained"
            startIcon={<FiPlus />}
            onClick={openAddSubject}
            sx={{ whiteSpace: "nowrap" }}
          >
            Add Subject
          </Button>
        </div>

        {/* Stats */}
        {!loading && (
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Chip
              icon={<MdOutlineBook size={16} />}
              label={`${subjects.length} Subjects`}
              color="primary"
              variant="outlined"
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}
            />
            <Chip
              icon={<MdOutlineBookmark size={16} />}
              label={`${totalTopics} Topics`}
              color="secondary"
              variant="outlined"
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}
            />
            <Chip
              icon={<MdOutlineLabel size={16} />}
              label={`${totalSubtopics} Subtopics`}
              variant="outlined"
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}
            />
          </Box>
        )}

        {globalError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setGlobalError(null)}>
            {globalError}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
            <CircularProgress sx={{ color: "white" }} />
          </Box>
        ) : subjects.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.06)",
              border: "1px dashed rgba(255,255,255,0.2)",
            }}
          >
            <MdOutlineBook size={48} color="rgba(255,255,255,0.3)" style={{ margin: "0 auto 12px" }} />
            <Typography color="rgba(255,255,255,0.5)" sx={{ mb: 2 }}>
              No subjects yet
            </Typography>
            <Button variant="outlined" startIcon={<FiPlus />} onClick={openAddSubject}
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
              Add your first subject
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                expanded={!!expanded[`s-${subject.id}`]}
                onToggle={() =>
                  setExpanded((p) => ({ ...p, [`s-${subject.id}`]: !p[`s-${subject.id}`] }))
                }
                expandedTopics={expanded}
                onToggleTopic={(tid) =>
                  setExpanded((p) => ({ ...p, [`t-${tid}`]: !p[`t-${tid}`] }))
                }
                onEditSubject={() => openEditSubject(subject)}
                onDeleteSubject={() => openDelete("subject", subject.id, subject.subject_name)}
                onAddTopic={() => openAddTopic(subject.id)}
                onEditTopic={openEditTopic}
                onDeleteTopic={(t) => openDelete("topic", t.id, t.topic_name)}
                onAddSubtopic={openAddSubtopic}
                onEditSubtopic={openEditSubtopic}
                onDeleteSubtopic={(st) => openDelete("subtopic", st.id, st.subtopic_name)}
              />
            ))}
          </Box>
        )}
      </div>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={item.open} onClose={() => setItem(EMPTY_ITEM)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {item.mode === "add" ? "Add" : "Edit"} {levelLabel[item.level]}
        </DialogTitle>
        <DialogContent>
          {item.error && <Alert severity="error" sx={{ mb: 2 }}>{item.error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            label={`${levelLabel[item.level]} name`}
            value={item.name}
            onChange={(e) => setItem((p) => ({ ...p, name: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItem(EMPTY_ITEM)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={item.saving}>
            {item.saving ? "Saving…" : item.mode === "add" ? "Add" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={del.open} onClose={() => setDel(EMPTY_DELETE)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {levelLabel[del.level]}</DialogTitle>
        <DialogContent>
          <Typography>
            Delete <strong>{del.name}</strong>?
            {del.level === "subject" && " This will also delete all its topics and subtopics."}
            {del.level === "topic" && " This will also delete all its subtopics."}
            {" "}This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDel(EMPTY_DELETE)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={del.deleting}
          >
            {del.deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </ReportShell>
  );
}

// ── SubjectCard ───────────────────────────────────────────────────────────────

function SubjectCard({
  subject,
  expanded,
  onToggle,
  expandedTopics,
  onToggleTopic,
  onEditSubject,
  onDeleteSubject,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onAddSubtopic,
  onEditSubtopic,
  onDeleteSubtopic,
}: {
  subject: Subject;
  expanded: boolean;
  onToggle: () => void;
  expandedTopics: Record<string, boolean>;
  onToggleTopic: (id: number) => void;
  onEditSubject: () => void;
  onDeleteSubject: () => void;
  onAddTopic: () => void;
  onEditTopic: (t: Topic) => void;
  onDeleteTopic: (t: Topic) => void;
  onAddSubtopic: (topicId: number) => void;
  onEditSubtopic: (st: Subtopic) => void;
  onDeleteSubtopic: (st: Subtopic) => void;
}) {
  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      sx={{
        bgcolor: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px !important",
        "&:before": { display: "none" },
        "&.Mui-expanded": { margin: 0 },
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<FiChevronDown color="white" />}
        sx={{
          px: 2,
          py: 0.5,
          "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1.5, my: 1 },
        }}
      >
        <MdOutlineBook size={20} color="#60a5fa" style={{ flexShrink: 0 }} />
        <Typography fontWeight={600} color="white" sx={{ flexGrow: 1 }}>
          {subject.subject_name}
        </Typography>
        <Chip
          label={`${subject.topics.length} topics`}
          size="small"
          sx={{ bgcolor: "rgba(96,165,250,0.18)", color: "#93c5fd", mr: 1 }}
        />
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ display: "flex", gap: 0.5 }}
        >
          <Tooltip title="Add topic">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <IconButton component={"span" as any} size="small" onClick={onAddTopic} sx={{ color: "#4ade80" }}>
              <FiPlus size={15} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit subject">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <IconButton component={"span" as any} size="small" onClick={onEditSubject} sx={{ color: "#facc15" }}>
              <FiEdit2 size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete subject">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <IconButton component={"span" as any} size="small" onClick={onDeleteSubject} sx={{ color: "#f87171" }}>
              <FiTrash2 size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
        {subject.topics.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 3,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.04)",
              border: "1px dashed rgba(255,255,255,0.12)",
            }}
          >
            <Typography variant="body2" color="rgba(255,255,255,0.4)" sx={{ mb: 1 }}>
              No topics yet
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FiPlus />}
              onClick={onAddTopic}
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", fontSize: 12 }}
            >
              Add topic
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {subject.topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                expanded={!!expandedTopics[`t-${topic.id}`]}
                onToggle={() => onToggleTopic(topic.id)}
                onEditTopic={() => onEditTopic(topic)}
                onDeleteTopic={() => onDeleteTopic(topic)}
                onAddSubtopic={() => onAddSubtopic(topic.id)}
                onEditSubtopic={onEditSubtopic}
                onDeleteSubtopic={onDeleteSubtopic}
              />
            ))}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

// ── TopicCard ─────────────────────────────────────────────────────────────────

function TopicCard({
  topic,
  expanded,
  onToggle,
  onEditTopic,
  onDeleteTopic,
  onAddSubtopic,
  onEditSubtopic,
  onDeleteSubtopic,
}: {
  topic: Topic;
  expanded: boolean;
  onToggle: () => void;
  onEditTopic: () => void;
  onDeleteTopic: () => void;
  onAddSubtopic: () => void;
  onEditSubtopic: (st: Subtopic) => void;
  onDeleteSubtopic: (st: Subtopic) => void;
}) {
  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      sx={{
        bgcolor: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px !important",
        "&:before": { display: "none" },
        "&.Mui-expanded": { margin: 0 },
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<FiChevronDown color="rgba(255,255,255,0.6)" size={14} />}
        sx={{
          px: 2,
          minHeight: "44px !important",
          "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1, my: "8px !important" },
        }}
      >
        <MdOutlineBookmark size={16} color="#a78bfa" style={{ flexShrink: 0 }} />
        <Typography variant="body2" fontWeight={500} color="rgba(255,255,255,0.9)" sx={{ flexGrow: 1 }}>
          {topic.topic_name}
        </Typography>
        <Chip
          label={`${topic.subtopics.length} subtopics`}
          size="small"
          sx={{ bgcolor: "rgba(167,139,250,0.15)", color: "#c4b5fd", fontSize: 11, height: 22, mr: 0.5 }}
        />
        <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Add subtopic">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <IconButton component={"span" as any} size="small" onClick={onAddSubtopic} sx={{ color: "#4ade80", p: "3px" }}>
              <FiPlus size={13} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit topic">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <IconButton component={"span" as any} size="small" onClick={onEditTopic} sx={{ color: "#facc15", p: "3px" }}>
              <FiEdit2 size={12} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete topic">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <IconButton component={"span" as any} size="small" onClick={onDeleteTopic} sx={{ color: "#f87171", p: "3px" }}>
              <FiTrash2 size={12} />
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pb: 1.5, pt: 0 }}>
        {topic.subtopics.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 2,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.03)",
              border: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            <Typography variant="caption" color="rgba(255,255,255,0.35)" sx={{ display: "block", mb: 0.5 }}>
              No subtopics yet
            </Typography>
            <Button
              size="small"
              variant="text"
              startIcon={<FiPlus size={11} />}
              onClick={onAddSubtopic}
              sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11, py: 0.25 }}
            >
              Add subtopic
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {topic.subtopics.map((st) => (
              <SubtopicRow
                key={st.id}
                subtopic={st}
                onEdit={() => onEditSubtopic(st)}
                onDelete={() => onDeleteSubtopic(st)}
              />
            ))}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

// ── SubtopicRow ───────────────────────────────────────────────────────────────

function SubtopicRow({
  subtopic,
  onEdit,
  onDelete,
}: {
  subtopic: Subtopic;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: 1.5,
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
        transition: "background 0.15s",
      }}
    >
      <MdOutlineLabel size={14} color="#34d399" style={{ flexShrink: 0 }} />
      <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ flexGrow: 1, fontSize: 13 }}>
        {subtopic.subtopic_name}
      </Typography>
      <Tooltip title="Edit subtopic">
        <IconButton size="small" onClick={onEdit} sx={{ color: "#facc15", p: "3px" }}>
          <FiEdit2 size={12} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete subtopic">
        <IconButton size="small" onClick={onDelete} sx={{ color: "#f87171", p: "3px" }}>
          <FiTrash2 size={12} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
