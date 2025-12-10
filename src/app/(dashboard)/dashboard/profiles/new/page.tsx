'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Globe,
  Shield,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  useTemplates,
  useGroups,
  useProxies,
  useCreateProfile,
} from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const languages = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja-JP', name: 'Japanese' },
];

export default function NewProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = React.useState(1);

  // API hooks
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const { data: groups, isLoading: groupsLoading } = useGroups();
  const { data: proxiesData, isLoading: proxiesLoading } = useProxies();
  const createProfile = useCreateProfile();

  const proxies = proxiesData?.items || [];

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    templateId: '',
    groupId: '',
    proxyId: '',
    timezone: '',
    language: 'en-US',
    notes: '',
    tags: [] as string[],
  });

  const [newTag, setNewTag] = React.useState('');

  const selectedTemplate = templates?.find((t) => t.id === formData.templateId);

  const handleTemplateSelect = (templateId: string) => {
    setFormData((prev) => ({ ...prev, templateId }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async () => {
    try {
      await createProfile.mutateAsync({
        name: formData.name,
        templateId: formData.templateId,
        groupId: formData.groupId || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        timezone: formData.timezone || undefined,
        language: formData.language,
        proxy: formData.proxyId || undefined,
        notes: formData.notes || undefined,
      });
      toast({
        title: 'Profile created',
        description: 'Your new profile has been created successfully.',
      });
      router.push('/dashboard/profiles');
    } catch (error) {
      toast({
        title: 'Failed to create profile',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const canProceed = () => {
    if (step === 1) return !!formData.templateId;
    if (step === 2) return !!formData.name.trim();
    return true;
  };

  const isLoading = templatesLoading || groupsLoading || proxiesLoading;

  // Organize templates by type
  const desktopTemplates = templates?.filter((t) => !['Android', 'iOS'].includes(t.os)) || [];
  const mobileTemplates = templates?.filter((t) => ['Android', 'iOS'].includes(t.os)) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/profiles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Profile</h1>
          <p className="text-muted-foreground">
            Set up a new browser profile with unique fingerprint
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                s < step
                  ? 'bg-primary text-primary-foreground'
                  : s === step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 w-16 ${
                  s < step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Choose a Template</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Select a browser fingerprint template. This determines the browser type,
            operating system, and base fingerprint characteristics.
          </p>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="desktop">Desktop</TabsTrigger>
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="grid gap-3 sm:grid-cols-2">
                {templates?.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={formData.templateId === template.id}
                    onSelect={() => handleTemplateSelect(template.id)}
                  />
                ))}
              </TabsContent>

              <TabsContent value="desktop" className="grid gap-3 sm:grid-cols-2">
                {desktopTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={formData.templateId === template.id}
                    onSelect={() => handleTemplateSelect(template.id)}
                  />
                ))}
              </TabsContent>

              <TabsContent value="mobile" className="grid gap-3 sm:grid-cols-2">
                {mobileTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={formData.templateId === template.id}
                    onSelect={() => handleTemplateSelect(template.id)}
                  />
                ))}
              </TabsContent>
            </Tabs>
          )}
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Profile Details</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Give your profile a name and configure basic settings.
          </p>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Profile Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Chrome - Shopping US"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group">Group</Label>
                <Select
                  value={formData.groupId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, groupId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No group</SelectItem>
                    {groups?.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                          {group.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, timezone: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-detect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto-detect from template</SelectItem>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this profile..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Proxy Configuration</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Optionally assign a proxy to this profile. You can change this later.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Proxy</Label>
              <div className="grid gap-3">
                <div
                  className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    !formData.proxyId
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, proxyId: '' }))
                  }
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">No Proxy</p>
                    <p className="text-sm text-muted-foreground">
                      Connect directly without a proxy
                    </p>
                  </div>
                  {!formData.proxyId && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>

                {proxies.map((proxy) => {
                  const isWorking = proxy.status === 'working';
                  return (
                    <div
                      key={proxy.id}
                      className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                        formData.proxyId === proxy.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      } ${!isWorking ? 'opacity-60' : ''}`}
                      onClick={() =>
                        isWorking &&
                        setFormData((prev) => ({ ...prev, proxyId: proxy.id }))
                      }
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{proxy.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {proxy.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isWorking ? (
                            <span className="text-green-600">Working</span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Connection failed
                            </span>
                          )}
                          {proxy.latency && isWorking && (
                            <span className="ml-2">• {proxy.latency}ms</span>
                          )}
                        </p>
                      </div>
                      {formData.proxyId === proxy.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href="/dashboard/proxies"
                className="text-primary hover:underline"
              >
                Add a new proxy
              </Link>
              <span>or configure proxy settings later</span>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 rounded-lg bg-muted/50 p-4">
            <h3 className="font-medium mb-3">Profile Summary</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template</span>
                <span>{selectedTemplate?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{formData.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Group</span>
                <span>
                  {groups?.find((g) => g.id === formData.groupId)?.name ||
                    'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proxy</span>
                <span>
                  {proxies.find((p) => p.id === formData.proxyId)?.name ||
                    'No proxy'}
                </span>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tags</span>
                  <span>{formData.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/profiles">Cancel</Link>
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createProfile.isPending}>
              {createProfile.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {createProfile.isPending ? 'Creating...' : 'Create Profile'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    os: string;
    browser: string;
  };
  selected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  const isMobile = ['Android', 'iOS'].includes(template.os);
  const Icon = isMobile ? Smartphone : Monitor;

  return (
    <div
      className={`relative flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all ${
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'hover:bg-muted/50 hover:border-muted-foreground/25'
      }`}
      onClick={onSelect}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg ${
          selected ? 'bg-primary/10' : 'bg-muted'
        }`}
      >
        <Icon
          className={`h-6 w-6 ${
            selected ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
      </div>
      <div className="flex-1">
        <p className="font-medium">{template.name}</p>
        <p className="text-sm text-muted-foreground">
          {template.os} • {template.browser}
        </p>
      </div>
      {selected && (
        <div className="absolute right-3 top-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
