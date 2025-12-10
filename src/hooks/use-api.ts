'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FingerprintPolicyEvaluation } from '@/lib/api';
import {
  profilesAPI,
  proxiesAPI,
  groupsAPI,
  teamsAPI,
  usersAPI,
  healthAPI,
  auditAPI,
  scriptsAPI,
  templatesAPI,
  syncAPI,
  fingerprintAPI,
  fingerprintPolicyAPI,
  timeMachineAPI,
  presenceAPI,
} from '@/lib/api';

// Hook to get the access token from session
export function useAccessToken() {
  const { data: session } = useSession();
  return session?.accessToken as string | undefined;
}

// ============ PROFILES ============

export function useProfiles(params?: Parameters<typeof profilesAPI.list>[1]) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['profiles', params],
    queryFn: () => profilesAPI.list(token!, params),
    enabled: !!token,
  });
}

export function useProfile(id: string) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['profiles', id],
    queryFn: () => profilesAPI.get(token!, id),
    enabled: !!token && !!id,
  });
}

export function useCreateProfile() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof profilesAPI.create>[1]) =>
      profilesAPI.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateProfile() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof profilesAPI.update>[2] }) =>
      profilesAPI.update(token!, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles', id] });
    },
  });
}

export function useDeleteProfile() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profilesAPI.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useBulkDeleteProfiles() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => profilesAPI.bulkDelete(token!, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDuplicateProfile() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) =>
      profilesAPI.duplicate(token!, id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useExportProfiles() {
  const token = useAccessToken();
  return useMutation({
    mutationFn: (ids?: string[]) => profilesAPI.export(token!, ids),
  });
}

export function useImportProfiles() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profiles: Parameters<typeof profilesAPI.import>[1]) =>
      profilesAPI.import(token!, profiles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useRegenerateFingerprint() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profilesAPI.regenerateFingerprint(token!, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles', id] });
    },
  });
}

export function useLaunchProfile() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, clientId }: { id: string; clientId?: string }) =>
      profilesAPI.launch(token!, id, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['presence'] });
    },
  });
}

export function useReleaseProfile() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, clientId }: { id: string; clientId?: string }) =>
      profilesAPI.release(token!, id, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['presence'] });
    },
  });
}

// ============ PROXIES ============

export function useProxies(params?: Parameters<typeof proxiesAPI.list>[1]) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['proxies', params],
    queryFn: () => proxiesAPI.list(token!, params),
    enabled: !!token,
  });
}

export function useProxy(id: string) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['proxies', id],
    queryFn: () => proxiesAPI.get(token!, id),
    enabled: !!token && !!id,
  });
}

export function useCreateProxy() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof proxiesAPI.create>[1]) =>
      proxiesAPI.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateProxy() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      proxiesAPI.update(token!, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] });
      queryClient.invalidateQueries({ queryKey: ['proxies', id] });
    },
  });
}

export function useDeleteProxy() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proxiesAPI.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useTestProxy() {
  const token = useAccessToken();
  return useMutation({
    mutationFn: (data: Parameters<typeof proxiesAPI.test>[1]) =>
      proxiesAPI.test(token!, data),
  });
}

export function useCheckProxy() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proxiesAPI.check(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] });
    },
  });
}

// ============ GROUPS ============

export function useGroups() {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsAPI.list(token!),
    enabled: !!token,
  });
}

export function useCreateGroup() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof groupsAPI.create>[1]) =>
      groupsAPI.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useUpdateGroup() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof groupsAPI.update>[2] }) =>
      groupsAPI.update(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useDeleteGroup() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsAPI.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useAddProfilesToGroup() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, profileIds }: { groupId: string; profileIds: string[] }) =>
      groupsAPI.addProfiles(token!, groupId, profileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

// ============ TEAMS ============

export function useCurrentTeam() {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['team', 'current'],
    queryFn: () => teamsAPI.getCurrent(token!),
    enabled: !!token,
  });
}

export function useTeamMembers() {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['team', 'members'],
    queryFn: () => teamsAPI.listMembers(token!),
    enabled: !!token,
  });
}

export function useInviteTeamMember() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      teamsAPI.inviteMember(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
    },
  });
}

export function useUpdateTeamMember() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: { role: string } }) =>
      teamsAPI.updateMember(token!, memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
    },
  });
}

export function useRemoveTeamMember() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => teamsAPI.removeMember(token!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// ============ USERS ============

export function useCurrentUser() {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => usersAPI.getMe(token!),
    enabled: !!token,
  });
}

export function useUpdateUser() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; image?: string }) =>
      usersAPI.updateMe(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useChangePassword() {
  const token = useAccessToken();
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      usersAPI.changePassword(token!, data),
  });
}

export function useAPIKeys() {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => usersAPI.listAPIKeys(token!),
    enabled: !!token,
  });
}

export function useCreateAPIKey() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; permissions?: string[]; expiresAt?: number }) =>
      usersAPI.createAPIKey(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
}

export function useRevokeAPIKey() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyId: string) => usersAPI.revokeAPIKey(token!, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
}

// ============ HEALTH ============

export function useSystemHealth() {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['health', 'system'],
    queryFn: () => healthAPI.getSystemHealth(token!),
    enabled: !!token,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useProfileHealth(profileId: string) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['health', 'profile', profileId],
    queryFn: () => healthAPI.getProfileHealth(token!, profileId),
    enabled: !!token && !!profileId,
  });
}

export function useRunHealthCheck() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => healthAPI.runHealthCheck(token!, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
    },
  });
}

// ============ AUDIT ============

export function useAuditLogs(params?: Parameters<typeof auditAPI.list>[1]) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['audit', params],
    queryFn: () => auditAPI.list(token!, params),
    enabled: !!token,
  });
}

export function useAuditLog(id: string) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['audit', id],
    queryFn: () => auditAPI.get(token!, id),
    enabled: !!token && !!id,
  });
}

// ============ SCRIPTS ============

export function useScripts(params?: Parameters<typeof scriptsAPI.list>[1]) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['scripts', params],
    queryFn: () => scriptsAPI.list(token!, params),
    enabled: !!token,
  });
}

export function useScript(id: string) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['scripts', id],
    queryFn: () => scriptsAPI.get(token!, id),
    enabled: !!token && !!id,
  });
}

export function useCreateScript() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof scriptsAPI.create>[1]) =>
      scriptsAPI.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
    },
  });
}

export function useUpdateScript() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof scriptsAPI.update>[2] }) =>
      scriptsAPI.update(token!, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
      queryClient.invalidateQueries({ queryKey: ['scripts', id] });
    },
  });
}

export function useDeleteScript() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scriptsAPI.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
    },
  });
}

export function useExecuteScript() {
  const token = useAccessToken();
  return useMutation({
    mutationFn: ({
      scriptId,
      profileId,
      variables,
    }: {
      scriptId: string;
      profileId: string;
      variables?: Record<string, unknown>;
    }) => scriptsAPI.execute(token!, scriptId, profileId, variables),
  });
}

// ============ TEMPLATES ============

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesAPI.list(),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templatesAPI.get(id),
    enabled: !!id,
  });
}

export function usePreviewTemplate() {
  return useMutation({
    mutationFn: (id: string) => templatesAPI.preview(id),
  });
}

// ============ SYNC ============

export function useSyncStatus(profileId: string) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['sync', profileId, 'status'],
    queryFn: () => syncAPI.status(token!, profileId),
    enabled: !!token && !!profileId,
  });
}

export function useUploadSession() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      profileId,
      data,
      clientId,
    }: {
      profileId: string;
      data: Parameters<typeof syncAPI.upload>[2];
      clientId?: string;
    }) => syncAPI.upload(token!, profileId, data, clientId),
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: ['sync', profileId] });
    },
  });
}

export function useDownloadSession() {
  const token = useAccessToken();
  return useMutation({
    mutationFn: (profileId: string) => syncAPI.download(token!, profileId),
  });
}

// ============ TIME MACHINE ============

export function useSnapshots(profileId: string) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['timemachine', profileId, 'snapshots'],
    queryFn: () => timeMachineAPI.getSnapshots(token!, profileId),
    enabled: !!token && !!profileId,
  });
}

export function useCreateSnapshot() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      profileId,
      description,
    }: {
      profileId: string;
      description?: string;
    }) => timeMachineAPI.createSnapshot(token!, profileId, { description }),
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: ['timemachine', profileId] });
    },
  });
}

export function useRestoreSnapshot() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      profileId,
      snapshotId,
    }: {
      profileId: string;
      snapshotId: string;
    }) => timeMachineAPI.restore(token!, profileId, snapshotId),
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: ['timemachine', profileId] });
      queryClient.invalidateQueries({ queryKey: ['sync', profileId] });
    },
  });
}

export function usePartialRestoreSnapshot() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      profileId,
      data,
    }: {
      profileId: string;
      data: Parameters<typeof timeMachineAPI.partialRestore>[2];
    }) => timeMachineAPI.partialRestore(token!, profileId, data),
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: ['timemachine', profileId] });
      queryClient.invalidateQueries({ queryKey: ['sync', profileId] });
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'timemachine' && query.queryKey[1] === profileId && query.queryKey[2] === 'diff',
      });
    },
  });
}

export function useSnapshotDiff(profileId?: string, fromId?: string, toId?: string) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['timemachine', profileId, 'diff', fromId, toId],
    queryFn: () => timeMachineAPI.compare(token!, profileId!, fromId!, toId!),
    enabled: !!token && !!profileId && !!fromId && !!toId,
  });
}

// ============ FINGERPRINT ============

export function useFingerprintVersions(profileId: string) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['fingerprint', profileId, 'versions'],
    queryFn: () => fingerprintAPI.getVersions(token!, profileId),
    enabled: !!token && !!profileId,
  });
}

export function useFingerprintUpgradeInfo(profileId: string) {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['fingerprint', profileId, 'upgrade-info'],
    queryFn: () => fingerprintAPI.getUpgradeInfo(token!, profileId),
    enabled: !!token && !!profileId,
  });
}

export function useUpgradeFingerprint() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      profileId,
      versionId,
    }: {
      profileId: string;
      versionId?: string;
    }) => fingerprintAPI.upgrade(token!, profileId, versionId),
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: ['fingerprint', profileId] });
      queryClient.invalidateQueries({ queryKey: ['profiles', profileId] });
    },
  });
}

// ============ FINGERPRINT POLICY ============

export function useFingerprintPolicies() {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['fingerprintPolicies'],
    queryFn: () => fingerprintPolicyAPI.list(token!),
    enabled: !!token,
  });
}

export function useCreateFingerprintPolicy() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => fingerprintPolicyAPI.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fingerprintPolicies'] });
    },
  });
}

export function useUpdateFingerprintPolicy() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fingerprintPolicyAPI.update(token!, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['fingerprintPolicies'] });
      queryClient.invalidateQueries({ queryKey: ['fingerprintPolicy', id] });
    },
  });
}

export function useDeleteFingerprintPolicy() {
  const token = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fingerprintPolicyAPI.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fingerprintPolicies'] });
    },
  });
}

export function useEvaluateFingerprintPolicy() {
  const token = useAccessToken();
  return useMutation<FingerprintPolicyEvaluation, Error, { policyId: string; profileId: string }>(
    {
      mutationFn: ({ policyId, profileId }) =>
        fingerprintPolicyAPI.evaluate(token!, policyId, { profileId }),
    }
  );
}

// ============ PRESENCE ============

export function useOnlineMembers() {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['presence', 'members'],
    queryFn: () => presenceAPI.getOnlineMembers(token!),
    enabled: !!token,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useProfileLocks() {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['presence', 'locks'],
    queryFn: () => presenceAPI.getProfileLocks(token!),
    enabled: !!token,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export function useUpdatePresenceStatus() {
  const token = useAccessToken();
  return useMutation({
    mutationFn: (status: 'online' | 'away' | 'busy') =>
      presenceAPI.updateStatus(token!, status),
  });
}

// ============ DASHBOARD STATS ============

export function useDashboardStats() {
  const token = useAccessToken();

  // Combine multiple queries for dashboard stats
  const profilesQuery = useQuery({
    queryKey: ['stats', 'profiles'],
    queryFn: () => profilesAPI.list(token!, { limit: 1 }),
    enabled: !!token,
    select: (data) => ({ count: data.total }),
  });

  const proxiesQuery = useQuery({
    queryKey: ['stats', 'proxies'],
    queryFn: () => proxiesAPI.list(token!, { limit: 100 }),
    enabled: !!token,
    select: (data) => ({
      total: data.total,
      working: data.items.filter((p) => p.status === 'working').length,
      failed: data.items.filter((p) => p.status === 'failed').length,
    }),
  });

  const teamQuery = useQuery({
    queryKey: ['stats', 'team'],
    queryFn: () => teamsAPI.getCurrent(token!),
    enabled: !!token,
    select: (data) => ({ memberCount: data.memberCount }),
  });

  return {
    profiles: profilesQuery.data,
    proxies: proxiesQuery.data,
    team: teamQuery.data,
    isLoading: profilesQuery.isLoading || proxiesQuery.isLoading || teamQuery.isLoading,
    error: profilesQuery.error || proxiesQuery.error || teamQuery.error,
  };
}

// Recent profiles for dashboard
export function useRecentProfiles() {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['profiles', 'recent'],
    queryFn: () => profilesAPI.list(token!, { limit: 5, sortBy: 'lastActive', sortOrder: 'desc' }),
    enabled: !!token,
  });
}

// Recent activity for dashboard
export function useRecentActivity() {
  const token = useAccessToken();
  return useQuery({
    queryKey: ['audit', 'recent'],
    queryFn: () => auditAPI.list(token!, { limit: 5 }),
    enabled: !!token,
  });
}
