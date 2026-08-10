import React, { useState, useEffect } from 'react';
import { ShieldCheck, User as UserIcon } from 'lucide-react';
import { apiService } from '../../services/api';
import { User } from '../../types';
import toast from 'react-hot-toast';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllUsers();
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      const res = await apiService.updateUserRole(userId, newRole);
      if (res.data.success) {
        toast.success(`Role updated to ${newRole}`);
        loadUsers();
      }
    } catch (err) {
      toast.error('Role update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
        <h2 className="text-xl font-extrabold text-white">MongoDB User Account Manager</h2>
        <p className="text-xs text-slate-400 mt-0.5">Manage customer accounts and assign administrator access</p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Role Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-white flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="p-4 text-slate-300">{u.email}</td>
                  <td className="p-4 uppercase text-[10px] font-bold text-indigo-400">{u.provider}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleRole(u._id, u.role)}
                      className="text-xs font-semibold text-indigo-400 hover:underline"
                    >
                      Set as {u.role === 'admin' ? 'Customer' : 'Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
