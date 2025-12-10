'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  MoreHorizontal,
  Mail,
  Shield,
  Crown,
  UserMinus,
  Clock,
  Copy,
  Check,
  Users,
} from 'lucide-react';
import {
  useCurrentTeam,
  useTeamMembers,
  useInviteTeamMember,
  useUpdateTeamMember,
  useRemoveTeamMember,
} from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

const roleLabels = {
  owner: { label: 'Owner', icon: Crown, color: 'text-yellow-600' },
  admin: { label: 'Admin', icon: Shield, color: 'text-blue-600' },
  member: { label: 'Member', icon: Users, color: 'text-gray-600' },
  viewer: { label: 'Viewer', icon: Users, color: 'text-gray-400' },
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TeamPage() {
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<string>('member');
  const [copied, setCopied] = React.useState(false);
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<any>(null);
  const [newRole, setNewRole] = React.useState<string>('member');

  const { toast } = useToast();
  const { data: team, isLoading: teamLoading } = useCurrentTeam();
  const { data: membersData, isLoading: membersLoading } = useTeamMembers();
  const inviteMutation = useInviteTeamMember();
  const updateMemberMutation = useUpdateTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  const members = membersData || [];
  const invitations: any[] = []; // API doesn't return pending invitations separately

  const handleInvite = async () => {
    if (!inviteEmail) return;

    inviteMutation.mutate(
      { email: inviteEmail, role: inviteRole },
      {
        onSuccess: () => {
          toast({
            title: 'Invitation sent',
            description: `An invitation has been sent to ${inviteEmail}`,
            variant: 'success',
          });
          setInviteDialogOpen(false);
          setInviteEmail('');
          setInviteRole('member');
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to send invitation',
            description: error?.message || 'An error occurred while sending the invitation',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleRoleChange = async () => {
    if (!selectedMember) return;

    updateMemberMutation.mutate(
      { memberId: selectedMember.id, data: { role: newRole } },
      {
        onSuccess: () => {
          toast({
            title: 'Role updated',
            description: `${selectedMember.name || selectedMember.email}'s role has been updated to ${newRole}`,
            variant: 'success',
          });
          setRoleChangeDialogOpen(false);
          setSelectedMember(null);
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to update role',
            description: error?.message || 'An error occurred while updating the role',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleRemoveMember = async (member: any) => {
    if (!confirm(`Are you sure you want to remove ${member.name || member.email} from the team?`)) {
      return;
    }

    removeMemberMutation.mutate(member.id, {
      onSuccess: () => {
        toast({
          title: 'Member removed',
          description: `${member.name || member.email} has been removed from the team`,
          variant: 'success',
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to remove member',
          description: error?.message || 'An error occurred while removing the member',
          variant: 'destructive',
        });
      },
    });
  };

  const copyInviteLink = () => {
    // Generate invite link based on team ID
    const inviteLink = `${window.location.origin}/invite/${team?.id || 'team'}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Link copied',
      description: 'Invite link copied to clipboard',
    });
  };

  const memberLimit = Number.POSITIVE_INFINITY;
  const availableSlots = Number.POSITIVE_INFINITY;
  const isLoading = teamLoading || membersLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and permissions
          </p>
          <p className="text-sm text-muted-foreground">
            Seats used: {members?.length || 0}/
            {memberLimit === Number.POSITIVE_INFINITY ? 'Unlimited' : memberLimit}{' '}
            ({availableSlots === Number.POSITIVE_INFINITY ? 'unlimited remaining' : `${availableSlots} left`})
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team. They&apos;ll receive an email
                with instructions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        Admin - Full access
                      </div>
                    </SelectItem>
                    <SelectItem value="member">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Member - Can manage profiles
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        Viewer - Read only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  Or share this invite link:
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    readOnly
                    value="https://multilogin.io/invite/abc123"
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyInviteLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={!inviteEmail || inviteMutation.isPending}>
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <p className="text-2xl font-bold">{members.length}</p>
              )}
              <p className="text-sm text-muted-foreground">Team Members</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <p className="text-2xl font-bold">{invitations.length}</p>
              )}
              <p className="text-sm text-muted-foreground">Pending Invites</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <p className="text-2xl font-bold">∞</p>
              )}
              <p className="text-sm text-muted-foreground">Unlimited seats</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <div className="border-b p-4">
          <h2 className="font-semibold">Team Members</h2>
          <p className="text-sm text-muted-foreground">
            People with access to this team
          </p>
        </div>
        <div className="divide-y">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No team members yet
            </div>
          ) : (
            members.map((member: any) => {
              const roleInfo = roleLabels[member.role as keyof typeof roleLabels];
              const RoleIcon = roleInfo.icon;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <UserAvatar user={{ name: member.name, email: member.email, image: member.image }} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{member.name || member.email}</p>
                      <Badge
                        variant="secondary"
                        className={`shrink-0 ${roleInfo.color}`}
                      >
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {roleInfo.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.email}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Joined {formatDate(member.joinedAt)}
                  </div>
                  {member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={updateMemberMutation.isPending || removeMemberMutation.isPending}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMember(member);
                            setNewRole(member.role);
                            setRoleChangeDialogOpen(true);
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveMember(member)}
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove from Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Pending Invitations */}
      {!isLoading && invitations.length > 0 && (
        <Card>
          <div className="border-b p-4">
            <h2 className="font-semibold">Pending Invitations</h2>
            <p className="text-sm text-muted-foreground">
              People who have been invited but haven&apos;t joined yet
            </p>
          </div>
          <div className="divide-y">
            {invitations.map((invitation: any) => (
              <div
                key={invitation.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{invitation.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Invited by {invitation.invitedBy || 'Team'} •{' '}
                    {formatDate(invitation.createdAt)}
                  </p>
                </div>
                <Badge variant="outline">{invitation.role}</Badge>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" disabled>
                    Resend
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" disabled>
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Role Permissions Info */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4">Role Permissions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium">Admin</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Manage all profiles and proxies</li>
              <li>• Invite and remove members</li>
              <li>• Access team settings</li>
              <li>• View audit logs</li>
            </ul>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              <h3 className="font-medium">Member</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Create and manage own profiles</li>
              <li>• Use shared proxies</li>
              <li>• Launch browser sessions</li>
              <li>• Sync session data</li>
            </ul>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-400" />
              <h3 className="font-medium">Viewer</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• View profiles and proxies</li>
              <li>• Read-only access</li>
              <li>• Cannot modify settings</li>
              <li>• Cannot launch sessions</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedMember?.name || selectedMember?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-role">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Admin - Full access
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Member - Can manage profiles
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      Viewer - Read only
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRoleChangeDialogOpen(false);
                setSelectedMember(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={updateMemberMutation.isPending || newRole === selectedMember?.role}
            >
              {updateMemberMutation.isPending ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
