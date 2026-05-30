import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Page Views
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TaskBoard from './pages/TaskBoard';
import UserManagement from './pages/UserManagement';

function AppLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  // Ticking time for premium feel
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  if (!user) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    if (role === 'ADMIN') return 'Admin Level';
    if (role === 'MANAGER') return 'Manager Level';
    return 'Team Member';
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-lg font-bold px-3 py-2 flex items-center gap-2 transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-secondary-container text-on-secondary-container shadow-sm border border-outline-variant/30'
        : 'text-gray-600 hover:bg-surface-container-high hover:text-on-background'
    }`;

  const getTodayDate = () => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-background font-sans">
      
      {/* 1. Left Sidebar Navigation (Desktop only) */}
      <aside className="w-56 border-r border-outline-variant p-4 shrink-0 h-full bg-surface-container-low flex flex-col justify-between sticky top-0 z-40 hidden md:flex text-left">
        <div>
          {/* Brand Logo */}
          <div className="mb-6 px-2">
            <h1 className="text-xl font-black text-primary tracking-tight">TaskPulse</h1>
            <p className="text-[10px] text-gray-500 mt-0.5">Manage your daily flow</p>
          </div>

          {/* Profile Card */}
          <div className="flex items-center gap-2.5 mb-6 px-3 py-2 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/60">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-primary shrink-0 select-none text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-on-background leading-tight">{user.name}</p>
              <p className="text-[10px] text-gray-500 font-medium leading-tight">{getRoleLabel(user.role)}</p>
            </div>
          </div>

          {/* Sidebar Links */}
          <nav className="space-y-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span className="text-xs font-bold">Dashboard</span>
            </NavLink>
            
            <NavLink to="/tasks" className={navLinkClass}>
              <span className="material-symbols-outlined text-[18px]">task</span>
              <span className="text-xs font-bold">Task Board</span>
            </NavLink>
            
            {user.role === 'ADMIN' && (
              <NavLink to="/users" className={navLinkClass}>
                <span className="material-symbols-outlined text-[18px]">group</span>
                <span className="text-xs font-bold">Team Settings</span>
              </NavLink>
            )}
          </nav>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <main className="flex-1 h-screen overflow-y-auto bg-background flex flex-col relative">
        
        {/* Top Header AppBar */}
        <header className="flex items-center justify-between px-4 sm:px-6 min-h-[3.5rem] py-2 w-full sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant/30 shadow-2xs">
          {/* Left Side: Organization Name and Date/Time */}
          <div className="flex flex-col text-left justify-center">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
              <span className="text-xs sm:text-sm font-black text-on-background tracking-tight leading-tight">
                {user.tenant_name || 'My Workspace'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px] sm:text-[9px] font-bold uppercase tracking-wider select-none leading-none shrink-0">
                Isolated Space
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] sm:text-[10px] text-gray-500 font-semibold leading-none flex-wrap">
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>calendar_today</span>
              <span>{getTodayDate()}</span>
              <span>•</span>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>schedule</span>
              <span>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Right Side: User Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-container-low border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer outline-none select-none"
            >
              {/* User Avatar Circle */}
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-2xs select-none text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left overflow-hidden max-w-[120px]">
                <span className="text-[11px] font-bold truncate text-on-background leading-none mb-0.5">{user.name}</span>
                <span className="text-[9px] text-gray-500 font-medium leading-none">{getRoleLabel(user.role)}</span>
              </div>
              <span className="material-symbols-outlined text-gray-500 text-[16px]">expand_more</span>
            </button>

            {/* Dropdown Menu Overlay */}
            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setDropdownOpen(false)}
                />
                
                <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                  {/* User Profile */}
                  <div className="flex items-center gap-3 pb-3 mb-3 border-b border-outline-variant/40">
                    <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg select-none">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold truncate text-on-background">{user.name}</p>
                      <p className="text-2xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Spaces/Roles */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between items-center bg-surface-container-low px-3 py-2 rounded-lg">
                      <span className="text-gray-500 font-medium">Role:</span>
                      <span className="px-2 py-0.5 text-3xs font-extrabold uppercase bg-primary text-on-primary rounded-md">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 bg-surface-container-low px-3 py-2 rounded-lg">
                      <span className="text-gray-500 font-medium text-3xs uppercase tracking-wider">Tenant Space:</span>
                      <span className="font-semibold text-on-background text-2xs truncate">
                        {user.tenant_name || 'My Workspace'}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-2 border border-red-200/50 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Logout from Space
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Route Render Canvas */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-8 py-6">
          {children}
        </div>
        
      </main>

    </div>
  );
}

function AppContent() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
