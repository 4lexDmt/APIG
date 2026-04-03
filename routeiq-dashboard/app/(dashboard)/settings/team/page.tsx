'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, Crown, Shield, User, Trash2, CheckCircle } from 'lucide-react'

const inviteSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  role: z.enum(['admin', 'member', 'viewer']),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: string
  avatarInitials: string
}

const MOCK_MEMBERS: TeamMember[] = [
  {
    id: 'usr_001',
    name: 'Alex Chen',
    email: 'alex@company.com',
    role: 'owner',
    joinedAt: 'Jan 2026',
    avatarInitials: 'AC',
  },
  {
    id: 'usr_002',
    name: 'Jordan Smith',
    email: 'jordan@company.com',
    role: 'admin',
    joinedAt: 'Feb 2026',
    avatarInitials: 'JS',
  },
  {
    id: 'usr_003',
    name: 'Riley Park',
    email: 'riley@company.com',
    role: 'member',
    joinedAt: 'Mar 2026',
    avatarInitials: 'RP',
  },
]

const ROLE_CONFIG = {
  owner: { label: 'Owner', icon: Crown, color: 'text-yellow-400 bg-yellow-400/20' },
  admin: { label: 'Admin', icon: Shield, color: 'text-routeiq-blue bg-routeiq-blue/20' },
  member: { label: 'Member', icon: User, color: 'text-slate-300 bg-slate-700' },
  viewer: { label: 'Viewer', icon: User, color: 'text-slate-400 bg-slate-800' },
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS)
  const [invited, setInvited] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'member' },
  })

  const onSubmit = async (_data: InviteFormData) => {
    await new Promise((r) => setTimeout(r, 800))
    setInvited(true)
    reset()
    setTimeout(() => setInvited(false), 4000)
  }

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="text-slate-400 text-sm mt-1">Manage team members and their access levels</p>
      </div>

      {invited && (
        <div className="flex items-center gap-2 bg-routeiq-green/20 border border-routeiq-green/30 rounded-lg px-4 py-3 text-routeiq-green text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Invitation sent successfully!
        </div>
      )}

      {/* Member list */}
      <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold">Members ({members.length})</h2>
        </div>
        <div className="divide-y divide-white/5">
          {members.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role]
            const RoleIcon = roleConfig.icon
            return (
              <div key={member.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-routeiq-blue/40 to-purple-500/40 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {member.avatarInitials}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{member.name}</p>
                    <p className="text-slate-400 text-xs">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${roleConfig.color}`}>
                    <RoleIcon className="w-3 h-3" />
                    {roleConfig.label}
                  </span>
                  <span className="text-slate-500 text-xs">Joined {member.joinedAt}</span>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-slate-600 hover:text-routeiq-red transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invite form */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-4 h-4 text-routeiq-blue" />
          <h2 className="text-white font-semibold">Invite Team Member</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                {...register('email')}
                type="email"
                placeholder="colleague@company.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-routeiq-blue"
              />
              {errors.email && (
                <p className="text-routeiq-red text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            <select
              {...register('role')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-routeiq-blue"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p><span className="text-slate-300">Admin:</span> Full access except billing and team ownership</p>
            <p><span className="text-slate-300">Member:</span> Can manage agents, view analytics</p>
            <p><span className="text-slate-300">Viewer:</span> Read-only access to dashboard</p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-routeiq-blue hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {isSubmitting ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>
    </div>
  )
}
