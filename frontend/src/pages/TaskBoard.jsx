import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import TaskModal from '../components/TaskModal';

const TaskBoard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); 
  const [priorityFilter, setPriorityFilter] = useState('ALL'); 

  // Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalMode, setModalMode] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load task board.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateClick = () => {
    setSelectedTask(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditClick = (task, e) => {
    e.stopPropagation();
    setSelectedTask(task);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCardClick = (task) => {
    setSelectedTask(task);
    setModalMode('detail');
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert(err.message || 'Failed to delete task.');
    }
  };

  const handleSaveCallback = (savedTask) => {
    if (modalMode === 'create') {
      fetchTasks();
    } else {
      setTasks(prev =>
        prev.map(t => (t.id === savedTask.id ? { ...t, ...savedTask } : t))
      );
      fetchTasks();
    }
  };

  const getPriorityPill = (pri) => {
    if (pri === 'LOW') return 'bg-slate-50 text-slate-600 border border-slate-200';
    if (pri === 'MEDIUM') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  };

  const getStatusPill = (statusVal) => {
    if (statusVal === 'TODO') return 'bg-sky-50 text-sky-700 border border-sky-200';
    if (statusVal === 'IN_PROGRESS') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 fade-in font-sans text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-on-background mb-0.5">
            📋 Task Workspace
          </h1>
          <p className="text-xs text-gray-500">
            Query, manage, and collaborate on tasks inside your secure company tenant.
          </p>
        </div>

        {/* Add Task Button */}
        {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
          <button
            onClick={handleCreateClick}
            className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-lg font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Create Task
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs mb-6 font-semibold">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30 mb-6 flex flex-col lg:flex-row lg:items-center gap-3">
        
        {/* Search */}
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-1.5 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none text-on-surface placeholder:text-gray-400 text-xs"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Tabs */}
        <div className="flex bg-surface-container/60 p-0.5 rounded-lg border border-outline-variant/20 gap-0.5 self-start lg:self-auto select-none">
          {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                statusFilter === status
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-gray-500 hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {status === 'ALL' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Priority Select */}
        <div className="min-w-[160px] self-start lg:self-auto relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full pl-3 pr-9 py-1.5 bg-surface border border-outline-variant rounded-lg text-on-surface text-xs font-semibold cursor-pointer outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 appearance-none"
          >
            <option value="ALL">🚨 All Priorities</option>
            <option value="LOW">🟢 LOW</option>
            <option value="MEDIUM">🟡 MEDIUM</option>
            <option value="HIGH">🔴 HIGH</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[16px]">expand_more</span>
        </div>

      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-outline-variant border-t-primary rounded-full animate-custom-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 text-center text-gray-400 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="text-3xl block mb-2">📭</span>
          <h3 className="text-sm text-on-surface-variant font-bold mb-1">No tasks matching filters</h3>
          <p className="text-xs text-gray-400">Try resetting filters or create a new assignment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map(taskItem => {
            const isCompleted = taskItem.status === 'DONE';
            const accentClass = 
              taskItem.status === 'TODO' ? 'task-card-accent-amber' :
              taskItem.status === 'IN_PROGRESS' ? 'task-card-accent-blue' : 'task-card-accent-green';

            return (
              <div
                key={taskItem.id}
                onClick={() => handleCardClick(taskItem)}
                className={`bg-white p-5 rounded-xl flex flex-col gap-3 relative border border-outline-variant/30 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer ${accentClass}`}
              >
                
                {/* Header: Priority and Due Date */}
                <div className="flex justify-between items-center">
                  <span className={`pill text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md border ${getPriorityPill(taskItem.priority)}`}>
                    {taskItem.priority}
                  </span>
                  
                  <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                    {taskItem.due_date ? new Date(taskItem.due_date).toLocaleDateString() : 'No due date'}
                  </span>
                </div>

                {/* Title */}
                <h3 className={`text-sm font-black text-on-surface line-clamp-2 leading-snug ${isCompleted ? 'text-gray-400 line-through font-semibold' : ''}`}>
                  {taskItem.title}
                </h3>

                {/* Description Snippet */}
                <p className={`text-xs text-on-surface-variant leading-relaxed flex-1 line-clamp-3 ${isCompleted ? 'text-gray-400/80' : ''}`}>
                  {taskItem.description || <span className="italic text-gray-400/70">No description provided.</span>}
                </p>

                {/* Card Footer: Assignee & Controls */}
                <div className="flex justify-between items-center border-t border-outline-variant/20 pt-2.5 mt-1.5">
                  
                  {/* Assignee */}
                  <div className="text-[11px] text-on-surface font-semibold flex items-center gap-1.5 bg-surface-container-low px-2 py-0.5 rounded-md">
                    <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px]">
                      {(taskItem.assignee_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[90px] truncate">
                      {taskItem.assignee_name || 'Unassigned'}
                    </span>
                  </div>

                  {/* Edit/Delete Controls */}
                  {(user.role === 'ADMIN' || user.role === 'MANAGER') ? (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleEditClick(taskItem, e)}
                        title="Edit Task"
                        className="p-1 rounded bg-surface hover:bg-surface-container-low text-primary border border-outline-variant/40 cursor-pointer transition-colors shadow-3xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(taskItem.id, e)}
                        title="Delete Task"
                        className="p-1 rounded bg-surface hover:bg-red-50 text-red-600 border border-outline-variant/40 cursor-pointer transition-colors shadow-3xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  ) : (
                    <span className={`pill text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${getStatusPill(taskItem.status)}`}>
                      {taskItem.status.replace('_', ' ')}
                    </span>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal component */}
      {isModalOpen && (
        <TaskModal
          task={selectedTask}
          mode={modalMode}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
            setModalMode(null);
          }}
          onSave={handleSaveCallback}
        />
      )}

    </div>
  );
};

export default TaskBoard;
