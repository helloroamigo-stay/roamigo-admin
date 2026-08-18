import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  Users as UsersIcon,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserCheck,
  UserX,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter
} from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getUsers();
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error('Error fetching registered users:', err);
      setError('Could not fetch registered users.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userDoc) => {
    const newStatus = userDoc.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const confirmText = newStatus === 'SUSPENDED'
      ? `Are you sure you want to suspend user "${userDoc.name}"? They will be blocked from logging into the platform.`
      : `Are you sure you want to reactivate user "${userDoc.name}"?`;

    if (!window.confirm(confirmText)) return;

    try {
      setActionLoading(userDoc._id);
      await adminAPI.updateUserStatus(userDoc._id, newStatus);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users by search term and role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-950/30 border border-purple-900/40 rounded-full px-3 py-1 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </span>
        );
      case 'PROVIDER':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 bg-brand-950/30 border border-brand-900/40 rounded-full px-3 py-1 w-fit">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Host Provider</span>
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-950/30 border border-blue-900/40 rounded-full px-3 py-1 w-fit">
            <User className="w-3.5 h-3.5" />
            <span>Guest</span>
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <UsersIcon className="w-7 h-7 text-purple-400" />
            <span>Registered Users</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage all registered platform accounts (Guests, Host Operators, and Admins).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#0f172a] border border-gray-800 rounded-xl text-xs font-semibold text-gray-300">
            Total Users: <span className="text-white font-bold">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        {/* Search Box */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e293b]/50 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-gray-500 hidden sm:block mr-1" />
          {['ALL', 'USER', 'PROVIDER', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === role
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-[#1e293b]/40 hover:bg-[#1e293b] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role === 'USER' ? 'Guests' : role === 'PROVIDER' ? 'Hosts' : 'Admins'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0f172a]/60 border border-gray-800 rounded-3xl">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
          <p className="text-gray-400 text-sm font-medium">Fetching registered users database...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-950/20 border border-red-900/40 rounded-3xl text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Failed to Load Users</h3>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchUsers}
            className="py-2 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            Retry
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 text-center bg-[#0f172a]/60 border border-gray-800 rounded-3xl">
          <UsersIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No users found</h3>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or role filter.</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400 border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-[#1e293b]/40 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">User Profile</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Account Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredUsers.map((userDoc) => (
                  <tr
                    key={userDoc._id}
                    className="hover:bg-[#1e293b]/30 transition-colors"
                  >
                    {/* User Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        {userDoc.avatar ? (
                          <img
                            src={userDoc.avatar}
                            alt={userDoc.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                            {userDoc.name?.slice(0, 2).toUpperCase() || 'US'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white text-sm">{userDoc.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span>{userDoc.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-6 text-xs text-gray-300">
                      {userDoc.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                          <span>{userDoc.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600">Not provided</span>
                      )}
                    </td>

                    {/* Account Role */}
                    <td className="py-4 px-6">{getRoleBadge(userDoc.role)}</td>

                    {/* Account Status */}
                    <td className="py-4 px-6">
                      {userDoc.status === 'SUSPENDED' ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-950/20 border border-red-900/30 rounded-full px-3 py-1 w-fit">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Suspended</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded-full px-3 py-1 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-6 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>
                          {userDoc.createdAt
                            ? new Date(userDoc.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      {userDoc.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(userDoc)}
                          disabled={actionLoading === userDoc._id}
                          className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                            userDoc.status === 'SUSPENDED'
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                          }`}
                        >
                          {actionLoading === userDoc._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                          ) : userDoc.status === 'SUSPENDED' ? (
                            'Reactivate'
                          ) : (
                            'Suspend'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
