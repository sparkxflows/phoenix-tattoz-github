import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Calendar, 
  Gift, 
  Sparkles, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  Copy, 
  Check, 
  Mail, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  Cake 
} from 'lucide-react';
import { fetchAdminMembers, deleteAdminMember } from '../lib/memberAuth';

export const AdminMembersManager: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchAdminMembers();
    if (res.success) {
      setMembers(res.members);
      setActivityLog(res.activity_log);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 15 seconds to monitor live sign-ins
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete member account "${name}"? This will revoke their saved codes.`)) {
      return;
    }
    setDeletingId(id);
    const success = await deleteAdminMember(id);
    setDeletingId(null);
    if (success) {
      setActionMsg(`Member ${name} deleted successfully.`);
      setTimeout(() => setActionMsg(''), 3000);
      loadData();
    } else {
      alert('Failed to delete member account.');
    }
  };

  // Filter members by search query
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (m.name || '').toLowerCase().includes(q);
    const emailMatch = (m.email || '').toLowerCase().includes(q);
    const bCode = (m.claims?.birthday?.code || '').toLowerCase();
    const rCode = (m.claims?.referral?.code || '').toLowerCase();
    const codeMatch = bCode.includes(q) || rCode.includes(q);
    const dobMatch = (m.birthdate || '').includes(q);
    return nameMatch || emailMatch || codeMatch || dobMatch;
  });

  const instantDiscountCount = members.filter((m) => Boolean(m.claims?.birthday)).length;
  const dobCount = members.filter((m) => Boolean(m.birthdate)).length;
  const totalLogins = members.reduce((acc, m) => acc + (m.sign_in_count || 1), 0);

  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return 'Never';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD60A] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD60A]">
              Phoenix Member Club &bull; Real-Time Sync
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
            Client Member Accounts &amp; Live Sign-In Monitor
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Live monitoring of client registrations, recorded birth dates, instant 15% discount voucher allocations, and real-time website sign-in events.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFD60A]' : 'text-zinc-400'}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* 4 Stats Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#161616] border border-zinc-800 rounded-xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Members</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[#FFD60A]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-serif mt-2">{members.length}</p>
          <span className="text-[10px] text-zinc-500 mt-0.5 block">Registered client accounts</span>
        </div>

        <div className="bg-[#161616] border border-zinc-800 rounded-xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">15% Birthday Codes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-[#FFD60A]">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#FFD60A] font-serif mt-2">{instantDiscountCount}</p>
          <span className="text-[10px] text-zinc-500 mt-0.5 block">Active 1-time discount vouchers</span>
        </div>

        <div className="bg-[#161616] border border-zinc-800 rounded-xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Birthdates Stored</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Cake className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-serif mt-2">{dobCount}</p>
          <span className="text-[10px] text-zinc-500 mt-0.5 block">Birthday month eligibility</span>
        </div>

        <div className="bg-[#161616] border border-zinc-800 rounded-xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Total Sign-Ins</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
              <LogIn className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-400 font-serif mt-2">{totalLogins}</p>
          <span className="text-[10px] text-zinc-500 mt-0.5 block">Member site visits recorded</span>
        </div>
      </div>

      {/* Real-Time Live Activity Feed ("when somebody sign in on the page so that information show in admin panel") */}
      {activityLog.length > 0 && (
        <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Live Sign-In &amp; Registration Stream
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Auto-syncs every 15s
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {activityLog.slice(0, 6).map((act) => (
              <div 
                key={act.id} 
                className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-start justify-between gap-2.5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    act.type === 'signup' 
                      ? 'bg-amber-500/20 text-[#FFD60A] border border-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {act.type === 'signup' ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="text-xs font-bold text-white truncate">{act.member_name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        act.type === 'signup' ? 'bg-amber-500/20 text-[#FFD60A]' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {act.type === 'signup' ? 'New Member' : 'Signed In'}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 truncate block mt-0.5">{act.member_email}</span>
                    {act.discount_code && (
                      <span className="text-[9px] font-mono text-[#FFD60A] block mt-0.5">
                        Code: {act.discount_code}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                  {formatTimeAgo(act.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Directory Controls */}
      <div className="bg-[#161616] p-3 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search members by name, email, DOB, or voucher code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD60A]"
          />
        </div>

        <div className="text-xs text-zinc-400 px-1 font-medium shrink-0">
          Showing <strong>{filteredMembers.length}</strong> of {members.length} members
        </div>
      </div>

      {/* Members Table */}
      {loading && members.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-[#161616] rounded-2xl border border-zinc-800">
          <RefreshCw className="w-8 h-8 text-[#FFD60A] animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-medium">Fetching registered members from server database...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-white">No Member Accounts Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No member accounts matched your search terms.'
              : 'When visitors register or sign in on the website, their full profile, birth date, and claim codes will instantly appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#161616] border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/90 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Member Name &amp; Email</th>
                  <th className="py-3 px-4">Date of Birth</th>
                  <th className="py-3 px-4">15% Birthday Code</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Last Sign-In</th>
                  <th className="py-3 px-4 text-center">Logins</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredMembers.map((member) => {
                  const bdayClaim = member.claims?.birthday;
                  return (
                    <tr key={member.id} className="hover:bg-zinc-900/50 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-[#FFD60A] text-black font-black text-xs flex items-center justify-center shrink-0">
                            {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                          </div>
                          <div>
                            <span className="font-bold text-white block text-xs">{member.name}</span>
                            <span className="text-[11px] text-zinc-400 block">{member.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Birth Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {member.birthdate ? (
                          <div className="flex items-center gap-1.5">
                            <Cake className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-200 font-semibold font-mono">
                              {new Date(member.birthdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">Not provided</span>
                        )}
                      </td>

                      {/* 15% Birthday Voucher Code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {bdayClaim ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#FFD60A] bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                              {bdayClaim.code}
                            </span>
                            <button
                              onClick={() => handleCopy(bdayClaim.code)}
                              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 cursor-pointer"
                              title="Copy code"
                            >
                              {copiedCode === bdayClaim.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">Unclaimed</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-300">
                        {member.created_at ? new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                      </td>

                      {/* Last Sign-In */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-zinc-300 font-medium">
                          <Clock className="w-3 h-3 text-[#FFD60A]" />
                          <span>{formatTimeAgo(member.last_login)}</span>
                        </div>
                      </td>

                      {/* Total Logins */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-300 font-mono font-bold">
                          {member.sign_in_count || 1}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(member.id, member.name)}
                          disabled={deletingId === member.id}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 border border-rose-900/30 transition-colors cursor-pointer"
                          title="Delete member account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
