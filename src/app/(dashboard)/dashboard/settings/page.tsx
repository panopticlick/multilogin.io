'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FingerprintPolicyManager } from '@/components/dashboard/fingerprint-policy-manager';
import {
  User,
  Lock,
  Bell,
  Moon,
  Sun,
  Monitor,
  Shield,
  Trash2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCurrentUser, useUpdateUser, useChangePassword } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const { toast } = useToast();

  // API hooks
  const { data: userData, isLoading: isLoadingUser } = useCurrentUser();
  const updateUserMutation = useUpdateUser();
  const changePasswordMutation = useChangePassword();

  // Form states
  const [name, setName] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  // Notification settings
  const [notifications, setNotifications] = React.useState({
    email: true,
    security: true,
    updates: false,
    marketing: false,
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Update form when user data is loaded
  React.useEffect(() => {
    if (userData) {
      setName(userData.name || '');
    }
  }, [userData]);

  const handleSaveProfile = async () => {
    try {
      await updateUserMutation.mutateAsync({ name });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
        variant: 'success',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">Profile</h2>
            <p className="text-sm text-muted-foreground">
              Your personal information
            </p>
          </div>
        </div>

        {isLoadingUser ? (
          <>
            <div className="flex items-center gap-6 mb-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-6 mb-6">
              <UserAvatar user={{ name, email: userData?.email || '' }} size="xl" />
              <div>
                <Button variant="outline" size="sm">
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSaveProfile}
                disabled={updateUserMutation.isPending || !name || name === userData?.name}
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Security Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">Security</h2>
            <p className="text-sm text-muted-foreground">
              Password and authentication
            </p>
          </div>
        </div>

        {isLoadingUser ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleChangePassword}
                disabled={
                  changePasswordMutation.isPending ||
                  !currentPassword ||
                  !newPassword ||
                  newPassword !== confirmPassword
                }
              >
                {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </>
        )}

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
          </div>
          <Button variant="outline">Enable 2FA</Button>
        </div>
      </Card>

      {/* Appearance Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Monitor className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">Appearance</h2>
            <p className="text-sm text-muted-foreground">
              Customize how the app looks
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Select your preferred theme
              </p>
            </div>
            {mounted && (
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Language</p>
              <p className="text-sm text-muted-foreground">
                Select your preferred language
              </p>
            </div>
            <Select defaultValue="en">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notifications Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Configure how you receive notifications
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, email: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Security Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified about security events
              </p>
            </div>
            <Switch
              checked={notifications.security}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, security: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Product Updates</p>
              <p className="text-sm text-muted-foreground">
                New features and improvements
              </p>
            </div>
            <Switch
              checked={notifications.updates}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, updates: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing</p>
              <p className="text-sm text-muted-foreground">
                Tips, offers, and promotions
              </p>
            </div>
            <Switch
              checked={notifications.marketing}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, marketing: checked }))
              }
            />
          </div>
        </div>
      </Card>

      {/* Fingerprint Policy Manager */}
      <FingerprintPolicyManager />

      {/* Data Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Download className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">Data</h2>
            <p className="text-sm text-muted-foreground">
              Export or delete your data
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your data as JSON
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-destructive/50">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <h2 className="font-semibold text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">
              Irreversible account actions
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All your data including profiles,
                  proxies, and session data will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <div className="my-4">
                <Label htmlFor="confirm-delete">
                  Type <span className="font-mono font-bold">DELETE</span> to
                  confirm
                </Label>
                <Input id="confirm-delete" placeholder="DELETE" className="mt-2" />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive">Delete Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
}
