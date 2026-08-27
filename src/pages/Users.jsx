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
          <span className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-3 py-1 w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Admin</span>
          </span>
        );
      case 'PROVIDER':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-full px-3 py-1 w-fit">
            <UserCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Host Provider</span>
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 w-fit">
            <User className="w-3.5 h-3.5 text-blue-600" />
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
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-3">
            <UsersIcon className="w-7 h-7 text-purple-600" />
            <span>Registered Users</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all registered platform accounts (Guests, Host Operators, and Admins).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-xs">
            Total Users: <span className="text-slate-900 font-extrabold">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Search Box */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block mr-1" />
          {['ALL', 'USER', 'PROVIDER', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === role
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role === 'USER' ? 'Guests' : role === 'PROVIDER' ? 'Hosts' : 'Admins'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
          <p className="text-slate-500 text-sm font-medium">Fetching registered users database...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center max-w-lg mx-auto shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to Load Users</h3>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchUsers}
            className="py-2 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            Retry
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
          <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No users found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or role filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">User Profile</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Account Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((userDoc) => (
                  <tr
                    key={userDoc._id}
                    className="hover:bg-slate-50/80 transition-colors"
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
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                            {userDoc.name?.slice(0, 2).toUpperCase() || 'US'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{userDoc.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{userDoc.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-6 text-xs text-slate-700 font-medium">
                      {userDoc.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{userDoc.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not provided</span>
                      )}
                    </td>

                    {/* Account Role */}
                    <td className="py-4 px-6">{getRoleBadge(userDoc.role)}</td>

                    {/* Account Status */}
                    <td className="py-4 px-6">
                      {userDoc.status === 'SUSPENDED' ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-3 py-1 w-fit">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Suspended</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
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
