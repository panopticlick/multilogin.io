'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  useFingerprintPolicies,
  useCreateFingerprintPolicy,
  useUpdateFingerprintPolicy,
  useDeleteFingerprintPolicy,
  useEvaluateFingerprintPolicy,
} from '@/hooks/use-api';
import type { FingerprintPolicyEvaluation } from '@/lib/api';
import { Loader2, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PolicyFormState {
  id?: string;
  name: string;
  description?: string;
  maxVersionsBehind: number;
  maxVersionsBehindMobile: number;
  allowedBrowsers: string;
}

interface FingerprintPolicySummary {
  id: string;
  name: string;
  description?: string | null;
  maxVersionsBehind: number;
  maxVersionsBehindMobile: number;
  autoUpgrade: boolean;
  allowedBrowsers?: string[];
}

const defaultForm: PolicyFormState = {
  name: '',
  description: '',
  maxVersionsBehind: 2,
  maxVersionsBehindMobile: 1,
  allowedBrowsers: 'chrome,firefox,edge',
};

export function FingerprintPolicyManager() {
  const { toast } = useToast();
  const { data: policies, isLoading } = useFingerprintPolicies();
  const createPolicy = useCreateFingerprintPolicy();
  const updatePolicy = useUpdateFingerprintPolicy();
  const deletePolicy = useDeleteFingerprintPolicy();
  const evaluatePolicy = useEvaluateFingerprintPolicy();
  const [form, setForm] = React.useState<PolicyFormState>(defaultForm);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [evaluationResult, setEvaluationResult] = React.useState<FingerprintPolicyEvaluation | null>(null);
  const [evaluationProfile, setEvaluationProfile] = React.useState('');
  const [evaluatingPolicyId, setEvaluatingPolicyId] = React.useState<string | null>(null);

  const isProcessing = createPolicy.isPending || updatePolicy.isPending || deletePolicy.isPending;

  const onCloseDialog = () => {
    setDialogOpen(false);
    setForm(defaultForm);
  };

  const handleEdit = (policy: FingerprintPolicySummary) => {
    setForm({
      id: policy.id,
      name: policy.name,
      description: policy.description ?? '',
      maxVersionsBehind: policy.maxVersionsBehind,
      maxVersionsBehindMobile: policy.maxVersionsBehindMobile,
      allowedBrowsers: policy.allowedBrowsers?.join(',') ?? '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      maxVersionsBehind: form.maxVersionsBehind,
      maxVersionsBehindMobile: form.maxVersionsBehindMobile,
      allowedBrowsers: form.allowedBrowsers.split(',').map((b) => b.trim()).filter(Boolean),
    };

    try {
      if (form.id) {
        await updatePolicy.mutateAsync({ id: form.id, data: payload });
        toast({ title: 'Policy updated', description: 'Changes saved successfully.', variant: 'success' });
      } else {
        await createPolicy.mutateAsync(payload);
        toast({ title: 'Policy created', description: 'New policy is now active.', variant: 'success' });
      }
      onCloseDialog();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save policy.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePolicy.mutateAsync(id);
      toast({ title: 'Policy deleted', description: 'Policy removed successfully.', variant: 'success' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete policy.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleEvaluate = async (policyId: string) => {
    if (!evaluationProfile) {
      toast({ title: 'Profile required', description: 'Enter a profile ID to evaluate.', variant: 'destructive' });
      return;
    }

    setEvaluatingPolicyId(policyId);
    try {
      const result = await evaluatePolicy.mutateAsync({ policyId, profileId: evaluationProfile });
      setEvaluationResult(result);
      toast({
        title: 'Evaluation complete',
        description: `Policy status: ${result.status}`,
        variant: result.status === 'violation' ? 'destructive' : 'success',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Evaluation failed.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setEvaluatingPolicyId(null);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Fingerprint Policy</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure upgrade guardrails and monitor policy compliance.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>New Policy</Button>
      </div>

      <Separator />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {policies?.map((policy) => (
            <div
              key={policy.id}
              className="rounded-lg border p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{policy.name}</span>
                  <Badge variant={policy.autoUpgrade ? 'default' : 'secondary'}>
                    {policy.autoUpgrade ? 'Auto-upgrade' : 'Manual review'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {policy.description || 'No description provided.'}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>Desktop lag ≤ {policy.maxVersionsBehind} versions</span>
                  <span>Mobile lag ≤ {policy.maxVersionsBehindMobile} versions</span>
                  <span>Browsers: {policy.allowedBrowsers?.join(', ') || 'Any'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(policy)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(policy.id)}>
                    Delete
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Profile ID"
                    value={evaluationProfile}
                    onChange={(e) => setEvaluationProfile(e.target.value)}
                    className="h-9"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={evaluatingPolicyId === policy.id || evaluatePolicy.isPending}
                    onClick={() => handleEvaluate(policy.id)}
                  >
                    {evaluatingPolicyId === policy.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Evaluate'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {!policies?.length && (
            <div className="text-sm text-muted-foreground">No policies yet. Create one to get started.</div>
          )}
        </div>
      )}

      {evaluationResult && (
        <div className="rounded-lg border p-4 bg-muted/50 flex items-start gap-3">
          {evaluationResult.status === 'violation' ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          <div>
            <p className="font-medium capitalize">{evaluationResult.status}</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
              {evaluationResult.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : onCloseDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit Policy' : 'Create Policy'}</DialogTitle>
            <DialogDescription>Define upgrade guardrails for your team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="policy-name">Name</Label>
              <Input
                id="policy-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-description">Description</Label>
              <Input
                id="policy-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="desktop-lag">Max Desktop Lag</Label>
                <Input
                  id="desktop-lag"
                  type="number"
                  min={0}
                  max={10}
                  value={form.maxVersionsBehind}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maxVersionsBehind: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-lag">Max Mobile Lag</Label>
                <Input
                  id="mobile-lag"
                  type="number"
                  min={0}
                  max={10}
                  value={form.maxVersionsBehindMobile}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maxVersionsBehindMobile: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowed-browsers">Allowed Browsers</Label>
              <Input
                id="allowed-browsers"
                value={form.allowedBrowsers}
                onChange={(e) => setForm((prev) => ({ ...prev, allowedBrowsers: e.target.value }))}
                placeholder="chrome,firefox,edge"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDialog} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
