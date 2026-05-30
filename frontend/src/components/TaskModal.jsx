import React, { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

const TaskModal = ({ task, onClose, onSave, mode }) => {
  const { user } = useContext(AuthContext);
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const isDetail = mode === "detail";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("TODO");
  const [dueDate, setDueDate] = useState("");
  const [assignedToId, setAssignedToId] = useState("");

  const [teamUsers, setTeamUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Reset comment states immediately to prevent state/leakage flicker from previous tasks
    setComments([]);
    setNewComment("");
    setCommentsError("");

    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "MEDIUM");
      setStatus(task.status || "TODO");
      setAssignedToId(task.assigned_to_id || "");

      if (task.due_date) {
        const d = new Date(task.due_date);
        const formattedDate = d.toISOString().split("T")[0];
        setDueDate(formattedDate);
      } else {
        setDueDate("");
      }

      if (isDetail) {
        fetchComments();
      }
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setStatus("TODO");
      setDueDate("");
      setAssignedToId("");
    }

    if (user.role === "ADMIN" || user.role === "MANAGER") {
      fetchTeamUsers();
    }
  }, [task, mode]);

  const fetchTeamUsers = async () => {
    try {
      const res = await api.get("/users");
      setTeamUsers(res.data.data);
    } catch (err) {
      console.error("Failed to load team users for task assignment:", err);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    setCommentsError("");
    try {
      const res = await api.get(`/tasks/${task.id}/comments`);
      setComments(res.data.data);
    } catch (err) {
      setCommentsError(err.message || "Failed to load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentsError("");
    try {
      const res = await api.post(`/tasks/${task.id}/comments`, {
        message: newComment,
      });

      const commentData = res.data.data;
      const fullComment = {
        ...commentData,
        creator_name: user.name,
        creator_email: user.email,
      };

      setComments((prev) => [...prev, fullComment]);
      setNewComment("");
    } catch (err) {
      setCommentsError(err.message || "Failed to add comment.");
    }
  };

  const handleStatusOnlyChange = async (newStatus) => {
    setStatus(newStatus);
    setSaving(true);
    setFormError("");
    try {
      const res = await api.put(`/tasks/${task.id}`, { status: newStatus });
      onSave(res.data.data);
    } catch (err) {
      setFormError(err.message || "Failed to update task status.");
    } finally {
      setSaving(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Task title is required.");
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate || null,
      assignedToId: assignedToId || null,
    };

    try {
      let res;
      if (isCreate) {
        res = await api.post("/tasks", payload);
      } else {
        res = await api.put(`/tasks/${task.id}`, payload);
      }
      onSave(res.data.data);
      onClose();
    } catch (err) {
      setFormError(err.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  const getPriorityPill = (pri) => {
    if (pri === "LOW")
      return "bg-slate-50 text-slate-600 border border-slate-200";
    if (pri === "MEDIUM")
      return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-red-50 text-red-700 border border-red-200";
  };

  const getStatusPill = (statusVal) => {
    if (statusVal === "TODO")
      return "bg-sky-50 text-sky-700 border border-sky-200";
    if (statusVal === "IN_PROGRESS")
      return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  };

  const inputClass =
    "w-full px-4 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-gray-400 text-sm transition-all duration-200 outline-none";

  return createPortal(
    <div className="flex items-stretch justify-end bg-slate-900/40 backdrop-blur-2xs fixed inset-0 z-1000">
      {/* Click outside backdrop close layer */}
      <div className="absolute inset-0 z-10 cursor-default" onClick={onClose} />

      {/* Side Drawer Container */}
      <div className="bg-surface-container-lowest border-l border-outline-variant/60 rounded-l-2xl w-full max-w-md md:max-w-lg shadow-2xl slide-in-right overflow-hidden flex flex-col h-full text-left relative z-20">
        {/* Header */}
        <div className="p-4 border-b border-outline-variant/40 bg-surface-container-low flex justify-between items-center">
          <h2 className="text-lg font-bold text-on-surface">
            {isCreate
              ? "Create New Task"
              : isEdit
                ? "Edit Task"
                : "Task Details"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-on-surface hover:bg-surface-container-high p-1.5 rounded-full transition-colors leading-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 pb-8">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4 font-semibold">
              {formError}
            </div>
          )}

          {/* Form Mode (Manager/Admin Edit or Create) */}
          {(isCreate || isEdit) &&
          (user.role === "ADMIN" || user.role === "MANAGER") ? (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-on-surface mb-1.5 text-xs font-bold uppercase tracking-wider">
                  Task Title *
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-on-surface mb-1.5 text-xs font-bold uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  className={inputClass}
                  placeholder="Provide detailed description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-on-surface mb-1.5 text-xs font-bold uppercase tracking-wider">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 bg-white border border-outline-variant rounded-lg text-on-surface text-sm font-semibold cursor-pointer outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 appearance-none"
                      disabled={saving}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-on-surface mb-1.5 text-xs font-bold uppercase tracking-wider">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 bg-white border border-outline-variant rounded-lg text-on-surface text-sm font-semibold cursor-pointer outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 appearance-none"
                      disabled={saving}
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-on-surface mb-1.5 text-xs font-bold uppercase tracking-wider">
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-white border border-outline-variant rounded-lg text-on-surface text-sm font-semibold cursor-pointer outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-on-surface mb-1.5 text-xs font-bold uppercase tracking-wider">
                    Assign To
                  </label>
                  <div className="relative">
                    <select
                      value={assignedToId}
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 bg-white border border-outline-variant rounded-lg text-on-surface text-sm font-semibold cursor-pointer outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 appearance-none"
                      disabled={saving}
                    >
                      <option value="">-- Unassigned --</option>
                      {teamUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3.5 mt-2 border-t border-outline-variant/20 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant cursor-pointer"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg text-sm font-bold text-on-primary bg-primary hover:bg-primary-container shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Task"}
                </button>
              </div>
            </form>
          ) : (
            // Detail Mode (View fields + comment posting)
            <div className="flex flex-col gap-6">
              {/* Task Fields */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`pill text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${getPriorityPill(priority)}`}
                  >
                    {priority} Priority
                  </span>

                  {/* Status Dropdown (Editable by assigned Members) */}
                  {user.role === "MEMBER" && task.assigned_to_id === user.id ? (
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => handleStatusOnlyChange(e.target.value)}
                        disabled={saving}
                        className="py-1 pl-2.5 pr-8 rounded-lg bg-surface border border-outline-variant text-on-surface text-xs font-semibold cursor-pointer outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200 appearance-none"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[14px]">
                        expand_more
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`pill text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${getStatusPill(status)}`}
                    >
                      {status.replace("_", " ")}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-on-surface leading-tight mt-1">
                  {task.title}
                </h3>

                <p className="text-sm text-on-surface-variant leading-relaxed bg-surface-container-low/60 p-4 rounded-xl border border-outline-variant/30 whitespace-pre-wrap">
                  {description || (
                    <span className="italic text-gray-400">
                      No description provided.
                    </span>
                  )}
                </p>

                <div className="flex flex-col gap-2.5 text-xs text-gray-500 font-semibold bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/20">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="material-symbols-outlined text-[16px] text-gray-400">
                      calendar_today
                    </span>
                    <span className="w-20 shrink-0 text-on-surface-variant font-bold">Due Date:</span>
                    <span className="text-on-surface font-medium">
                      {dueDate
                        ? new Date(dueDate).toLocaleDateString()
                        : "No due date"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="material-symbols-outlined text-[16px] text-gray-400">
                      person
                    </span>
                    <span className="w-20 shrink-0 text-on-surface-variant font-bold">Assignee:</span>
                    <span className="text-on-surface font-medium">
                      {task.assignee_name || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="material-symbols-outlined text-[16px] text-gray-400">
                      info
                    </span>
                    <span className="w-20 shrink-0 text-on-surface-variant font-bold">Creator:</span>
                    <span className="text-on-surface font-medium">
                      {task.creator_name || "System"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-outline-variant/20 pt-5 flex flex-col gap-4">
                <h4 className="text-base font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    forum
                  </span>
                  Discussion & Comments ({comments.length})
                </h4>

                {commentsError && (
                  <span className="text-xs text-red-600 font-semibold">
                    {commentsError}
                  </span>
                )}

                {/* Comments List */}
                <div className="max-h-48 overflow-y-auto bg-surface-container-low/40 rounded-xl p-4 flex flex-col gap-3 border border-outline-variant/30">
                  {commentsLoading ? (
                    <span className="text-xs text-gray-500 text-center">
                      Loading discussion...
                    </span>
                  ) : comments.length === 0 ? (
                    <span className="text-xs text-gray-400 text-center italic py-2">
                      No comments yet. Start the conversation below!
                    </span>
                  ) : (
                    comments.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white border border-outline-variant/20 p-3 rounded-lg flex flex-col gap-1.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-primary font-bold">
                            {c.creator_name}
                          </strong>
                          <span className="text-gray-400 text-[10px]">
                            {new Date(c.created_at).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-sm text-on-surface font-medium leading-relaxed">
                          {c.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Textarea Form */}
                <form onSubmit={handlePostComment} className="flex flex-col gap-2.5">
                  <textarea
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-gray-400 text-sm transition-all duration-200 outline-none resize-none"
                    placeholder="Type your feedback/comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (newComment.trim()) {
                          handlePostComment(e);
                        }
                      }
                    }}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-container text-on-primary font-bold px-5 py-2 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 shrink-0 text-sm flex items-center gap-1.5"
                      disabled={!newComment.trim()}
                    >
                      <span>Post Comment</span>
                      <span className="material-symbols-outlined text-[16px]">
                        send
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TaskModal;
