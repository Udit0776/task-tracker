import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import TaskModal from '../components/TaskModal';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0
  });
  const [focusTask, setFocusTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const [allTasks, setAllTasks] = useState([]);
  const [priorityTasks, setPriorityTasks] = useState([]);
  const [activePriorityIndex, setActivePriorityIndex] = useState(0);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalMode, setModalMode] = useState(null);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/tasks');
      const tasks = res.data.data;
      
      setAllTasks(tasks);
      
      const todo = tasks.filter(t => t.status === 'TODO').length;
      const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const done = tasks.filter(t => t.status === 'DONE').length;

      setMetrics({
        total: tasks.length,
        todo,
        inProgress,
        done
      });

      // Build a sorted list of ALL pending tasks for the priority carousel
      const pendingTasks = tasks.filter(t => t.status !== 'DONE');
      
      // Sorting strategy:
      // 1. Priority order: HIGH > MEDIUM > LOW
      // 2. Earliest due date first (nulls go last)
      // 3. Tie-breaker: Oldest creation date first
      const priorityWeight = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      
      const sortedPending = [...pendingTasks].sort((a, b) => {
        // Primary: priority weight
        const pA = priorityWeight[a.priority] ?? 3;
        const pB = priorityWeight[b.priority] ?? 3;
        if (pA !== pB) return pA - pB;

        // Secondary: due date
        if (a.due_date && b.due_date) {
          const dateA = new Date(a.due_date);
          const dateB = new Date(b.due_date);
          if (dateA - dateB !== 0) return dateA - dateB;
        } else if (a.due_date) {
          return -1;
        } else if (b.due_date) {
          return 1;
        }
        
        // Tie-breaker: Oldest created first
        return new Date(a.created_at) - new Date(b.created_at);
      });

      setPriorityTasks(sortedPending);
      setActivePriorityIndex(0);

      // Keep focusTask as first item for backward compat
      setFocusTask(sortedPending.length > 0 ? sortedPending[0] : null);

    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCopyTenantId = () => {
    navigator.clipboard.writeText(user.tenant_id || user.tenantId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleOpenFocusTask = (task) => {
    setSelectedTask(task);
    setModalMode('detail');
    setIsModalOpen(true);
  };

  const handleSaveCallback = () => {
    fetchDashboardData();
  };

  return (
    <div className="fade-in font-sans text-left pb-10">
      
      {/* 1. Welcoming Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-on-background tracking-tight">Dashboard Overview</h2>
          <p className="text-xs text-gray-500 mt-0.5">Monitor your multi-tenant metrics and active focus areas.</p>
        </div>
 
        {/* Share Tenant Info for Admin */}
        {user.role === 'ADMIN' && (
          <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-2xs flex flex-col gap-1 max-w-sm">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
              🏢 INVITE TEAM MEMBERS (TENANT ID)
            </span>
            <div className="flex items-center gap-2">
              <code className="text-2xs font-mono text-primary bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant truncate select-all max-w-[200px]">
                {user.tenant_id || user.tenantId}
              </code>
              <button
                onClick={handleCopyTenantId}
                className="px-2 py-0.5 text-2xs font-semibold rounded bg-surface-container-low hover:bg-surface-container-high border border-outline-variant text-primary cursor-pointer transition-colors shrink-0"
              >
                {copySuccess ? 'Copied! ✅' : 'Copy 📋'}
              </button>
            </div>
          </div>
        )}
      </div>
 
      {error && (
        <div className="p-3 bg-red-50/10 border border-red-500/30 rounded-xl text-error mb-6 font-medium text-sm">
          {error}
        </div>
      )}
 
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-outline-variant border-t-primary rounded-full animate-custom-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 2. Three Columns Summary Metrics (Google Stitch Style) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Metric 1: Total Tasks */}
            <div className="bg-surface-container-lowest py-4 px-5 rounded-xl shadow-2xs border border-outline-variant hover:shadow-xs transition-shadow group flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-sky-50 text-primary p-2.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">task</span>
                </div>
                <span className="text-3xs text-gray-500 font-semibold uppercase tracking-wider mt-1">
                  {metrics.total > 0 ? '+12% vs last week' : 'Fresh space'}
                </span>
              </div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Tasks</h3>
              <p className="text-3xl font-black text-on-background mt-1">{metrics.total}</p>
            </div>
 
            {/* Metric 2: In Progress */}
            <div className="bg-surface-container-lowest py-4 px-5 rounded-xl shadow-2xs border border-outline-variant hover:shadow-xs transition-shadow group flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-amber-50 text-amber-700 p-2.5 rounded-lg group-hover:bg-amber-700 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                </div>
                <span className="text-3xs text-amber-600 font-bold uppercase tracking-wider mt-1">Active focus</span>
              </div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">In Progress</h3>
              <p className="text-3xl font-black text-primary mt-1">{metrics.inProgress}</p>
            </div>
 
            {/* Metric 3: Completed */}
            <div className="bg-surface-container-lowest py-4 px-5 rounded-xl shadow-2xs border border-outline-variant hover:shadow-xs transition-shadow group flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
                <span className="text-3xs text-emerald-600 font-bold uppercase tracking-wider mt-1">
                  {metrics.total > 0 ? `${Math.round((metrics.done / metrics.total) * 100)}% Done` : '0% Done'}
                </span>
              </div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed</h3>
              <p className="text-3xl font-black text-on-background mt-1">{metrics.done}</p>
            </div>
 
          </section>

          {/* 3. Dynamic Priority Tasks Carousel & Create Slot */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side: Priority Tasks Carousel */}
            {priorityTasks.length > 0 ? (
              <div 
                className={(user.role === 'ADMIN' || user.role === 'MANAGER') ? 'lg:col-span-2' : 'lg:col-span-3'}
              >
                {/* Carousel Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11.5px] font-extrabold text-gray-500 uppercase tracking-widest">⚡ Priority Queue</span>
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] font-bold">
                      {activePriorityIndex + 1} / {priorityTasks.length}
                    </span>
                  </div>
                  {priorityTasks.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActivePriorityIndex(i => i > 0 ? i - 1 : priorityTasks.length - 1)}
                        className="w-7 h-7 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px] text-gray-600">chevron_left</span>
                      </button>
                      <button
                        onClick={() => setActivePriorityIndex(i => i < priorityTasks.length - 1 ? i + 1 : 0)}
                        className="w-7 h-7 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px] text-gray-600">chevron_right</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Active Task Card */}
                {(() => {
                  const task = priorityTasks[activePriorityIndex];
                  if (!task) return null;
                  
                  const priorityColors = {
                    HIGH: 'bg-red-600',
                    MEDIUM: 'bg-amber-400',
                    LOW: 'bg-blue-600'
                  };
                  
                  const priorityLabels = {
                    HIGH: '🔥 High Priority',
                    MEDIUM: '⚠️ Medium Priority',
                    LOW: '📌 Low Priority'
                  };
                  
                  const isDarkText = task.priority === 'MEDIUM';
                  const bgColor = priorityColors[task.priority] || 'bg-primary';
                  const textClass = isDarkText ? 'text-slate-900' : 'text-white';
                  const subtextClass = isDarkText ? 'text-slate-800' : 'text-white/80';
                  
                  return (
                    <div 
                      className={`${bgColor} ${textClass} p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-5 relative overflow-hidden group select-none`}
                      style={{ minHeight: '200px' }}
                    >
                      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-105 transition-transform duration-500"></div>
                      
                      {/* Details */}
                      <div className="flex-1 z-10 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md border ${
                              isDarkText 
                                ? 'bg-slate-900/10 border-slate-900/15 text-slate-900' 
                                : 'bg-white/20 border-white/10 text-white'
                            }`}>
                              {priorityLabels[task.priority] || '📌 Task'}
                            </span>
                            <span className={`${subtextClass} text-2xs font-semibold`}>
                              {task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString()}` : 'No deadline'}
                            </span>
                          </div>

                          <h4 className={`text-xl font-black mb-2 leading-snug tracking-tight ${textClass}`}>
                            {task.title}
                          </h4>
                          
                          <p className={`text-xs leading-relaxed mb-4 max-w-lg line-clamp-3 ${isDarkText ? 'text-slate-850' : 'opacity-90'}`}>
                            {task.description || 'No description provided. Click below to inspect fields and discuss with the team.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-3 select-none">
                            <div className={`w-7 h-7 rounded-full ring-2 bg-sky-200 text-primary font-bold flex items-center justify-center text-xs ${
                              isDarkText ? 'ring-slate-900/20' : 'ring-white/30'
                            }`}>
                              {task.assignee_name?.charAt(0) || 'U'}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleOpenFocusTask(task)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
                              isDarkText 
                                ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg' 
                                : 'bg-white text-gray-800 hover:bg-gray-50 hover:shadow-lg'
                            }`}
                          >
                            Open Task Details
                          </button>
                        </div>
                      </div>

                      {/* Progress Visual */}
                      <div className={`w-full md:w-48 rounded-xl p-3.5 backdrop-blur-md z-10 self-center md:self-auto flex flex-col justify-between h-full min-h-[120px] text-left shrink-0 border ${
                        isDarkText 
                          ? 'bg-slate-900/10 border-slate-900/15' 
                          : 'bg-white/10 border-white/15'
                      }`}>
                        <div>
                          <p className={`text-[9px] font-extrabold uppercase tracking-widest mb-3 ${subtextClass}`}>Task Status</p>
                          <div className="flex items-end justify-between mb-1.5">
                            <span className={`text-lg font-bold leading-none ${textClass}`}>
                              {task.status === 'TODO' ? '0%' : task.status === 'IN_PROGRESS' ? '50%' : '100%'}
                            </span>
                            <span className={`text-[10px] leading-none font-bold uppercase tracking-wider ${subtextClass}`}>
                              {task.status === 'TODO' ? 'Not Started' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                            </span>
                          </div>
                        </div>
                        <div className={`w-full h-1 rounded-full ${isDarkText ? 'bg-slate-900/20' : 'bg-white/20'}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isDarkText ? 'bg-slate-900' : 'bg-white'}`}
                            style={{
                              width: task.status === 'TODO' ? '0%' : task.status === 'IN_PROGRESS' ? '50%' : '100%'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Carousel Dots */}
                {priorityTasks.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    {priorityTasks.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePriorityIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer border-none ${
                          idx === activePriorityIndex 
                            ? 'bg-primary w-5' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div 
                className={(user.role === 'ADMIN' || user.role === 'MANAGER') ? 'lg:col-span-2' : 'lg:col-span-3'}
              >
                <div 
                  className="bg-gradient-to-r from-primary to-primary-container text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between"
                  style={{ minHeight: '200px' }}
                >
                  <div>
                    <h4 className="text-lg font-black mb-1.5 text-white">📭 Nothing on Focus</h4>
                    <p className="text-xs opacity-90 leading-relaxed max-w-md">
                      All set! There are currently no pending or high priority tasks left on your dashboard workspace. Take a break, or add a new goal.
                    </p>
                  </div>
                  <Link to="/tasks" className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-gray-50 transition-all active:scale-95 cursor-pointer max-w-xs text-center decoration-none mt-3">
                    Explore Task Board
                  </Link>
                </div>
              </div>
            )}

            {/* Right Side: Create New Slot (Interaction Prompt Card) */}
            {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
              <div
                onClick={() => navigate('/tasks')}
                className="bg-dashed border-2 border-dashed border-outline-variant p-5 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-primary hover:bg-surface-container-low transition-all cursor-pointer min-h-[180px]"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container-high text-outline group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center mb-3 shadow-3xs">
                  <span className="material-symbols-outlined text-[22px] font-bold">add</span>
                </div>
                <p className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors">Create New Task</p>
                <p className="text-[10px] text-gray-400 group-hover:text-gray-500 mt-0.5">What's the next big goal?</p>
              </div>
            )}

          </section>

          {/* 4. Dashboard Workspace Task List */}
          <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-2xs mt-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-extrabold text-on-background">📋 Tenant Workspace Tasks</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Quickly preview and track all dynamic tasks in your space.</p>
              </div>
              <Link to="/tasks" className="text-primary hover:underline text-xs font-bold transition-colors cursor-pointer">
                View Workspace Board →
              </Link>
            </div>

            {allTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs italic">
                No active tasks found. Click "Create New Task" to add your first workspace goal.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
                <table className="w-full border-collapse text-left min-w-max">
                  <thead>
                    <tr className="border-b border-outline-variant/30 bg-surface-container-low/60 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-4">Task Title</th>
                      <th className="py-2.5 px-4">Priority</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Due Date</th>
                      <th className="py-2.5 px-4">Assignee</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTasks.map(t => (
                      <tr 
                        key={t.id} 
                        onClick={() => handleOpenFocusTask(t)}
                        className="border-b border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors cursor-pointer text-xs"
                      >
                        <td className="py-3 px-4 font-bold text-on-surface max-w-xs truncate">
                          {t.title}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`pill text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                            t.priority === 'LOW' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                            t.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`pill text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                            t.status === 'TODO' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                            t.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-medium">
                          {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No deadline'}
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[8px] uppercase shrink-0">
                              {(t.assignee_name || 'U').charAt(0)}
                            </div>
                            <span className="truncate max-w-[80px]">{t.assignee_name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => handleOpenFocusTask(t)}
                            className="px-2.5 py-1 text-[10px] font-bold rounded bg-surface hover:bg-surface-container-low border border-outline-variant/40 text-primary cursor-pointer transition-colors shadow-3xs"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      )}

      {/* Task Modal for Details */}
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

export default Dashboard;
