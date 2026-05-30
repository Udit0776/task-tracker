import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load team users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setError('');
    setSuccessMsg('');
    setUpdatingUserId(userId);
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setSuccessMsg('User role updated successfully.');
      
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      );
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleClass = (role) => {
    if (role === 'ADMIN') return 'bg-purple-50 text-purple-700 border border-purple-100';
    if (role === 'MANAGER') return 'bg-blue-50 text-blue-700 border border-blue-100';
    return 'bg-slate-50 text-slate-600 border border-slate-100';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 fade-in font-sans text-left">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-on-background mb-1">
          👥 Team Administration
        </h1>
        <p className="text-sm text-gray-500">
          Manage organization user roles and elevate or demote team access privileges.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-5 font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm mb-5 font-semibold">
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-outline-variant border-t-primary rounded-full animate-custom-spin" />
        </div>
      ) : (
        <div className="bg-surface-container-lowest p-0 overflow-x-auto rounded-2xl border border-outline-variant/40 shadow-sm">
          <table className="w-full border-collapse text-left min-w-max">
            <thead>
              <tr className="border-b border-outline-variant/40 bg-surface-container-low">
                <th className="py-3 px-5 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Full Name</th>
                <th className="py-3 px-5 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Email Address</th>
                <th className="py-3 px-5 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Current Role</th>
                <th className="py-3 px-5 text-gray-500 font-bold text-[10px] uppercase tracking-wider text-right">Assign New Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((member, index) => (
                <tr key={member.id} className={`border-b border-outline-variant/20 hover:bg-surface-container-low transition-all duration-200 ${member.id === user.id ? 'bg-primary/5' : ''}`}>
                  
                  {/* Name */}
                  <td className="py-3 px-5 text-xs font-bold text-on-surface">
                    {member.name} {member.id === user.id && <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-bold ml-1.5">You</span>}
                  </td>
                  
                  {/* Email */}
                  <td className="py-3 px-5 text-xs text-on-surface-variant font-medium">{member.email}</td>
                  
                  {/* Role */}
                  <td className="py-3 px-5">
                    <span className={`pill text-[9px] uppercase px-2 py-0.5 rounded font-extrabold border ${getRoleClass(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  
                  {/* Dropdown */}
                  <td className="py-3 px-5 text-right">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      disabled={member.id === user.id || updatingUserId === member.id}
                      className="py-1 px-2.5 rounded-lg bg-surface border border-outline-variant text-on-surface text-xs font-bold cursor-pointer outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
