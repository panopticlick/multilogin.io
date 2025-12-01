# Component Library - UI Specifications

## Overview

The UI is built using shadcn/ui as a base with custom extensions for domain-specific components. All components follow the design system defined below.

---

## Design System

### Colors

```css
/* CSS Variables (in globals.css) */
:root {
  /* Background */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  /* Card */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  /* Popover */
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  /* Primary - Indigo */
  --primary: 238.7 83.5% 66.7%;
  --primary-foreground: 210 40% 98%;

  /* Secondary */
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  /* Muted */
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;

  /* Accent */
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;

  /* Destructive - Red */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  /* Success - Green */
  --success: 142 76% 36%;
  --success-foreground: 210 40% 98%;

  /* Warning - Amber */
  --warning: 38 92% 50%;
  --warning-foreground: 222.2 84% 4.9%;

  /* Border & Input */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 238.7 83.5% 66.7%;

  /* Radius */
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 238.7 83.5% 66.7%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 238.7 83.5% 66.7%;
}
```

### Typography

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

### Spacing Scale

```css
/* Spacing (following Tailwind defaults) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

---

## Base Components (shadcn/ui)

Install via CLI:

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select dialog dropdown-menu table badge toast tabs checkbox radio-group switch textarea avatar alert skeleton tooltip popover command sheet scroll-area separator
```

### Required Components List

| Component | Usage |
|-----------|-------|
| Button | Actions, forms |
| Card | Content containers |
| Input | Form inputs |
| Label | Form labels |
| Select | Dropdowns |
| Dialog | Modals |
| DropdownMenu | Context menus |
| Table | Data tables |
| Badge | Status indicators |
| Toast | Notifications |
| Tabs | Tab navigation |
| Checkbox | Multi-select |
| RadioGroup | Single select |
| Switch | Toggles |
| Textarea | Multi-line input |
| Avatar | User images |
| Alert | Messages |
| Skeleton | Loading states |
| Tooltip | Hints |
| Popover | Floating content |
| Command | Command palette |
| Sheet | Side panels |
| ScrollArea | Scrolling |
| Separator | Dividers |

---

## Custom Components

### ProfileCard

A card displaying profile information with quick actions.

```tsx
// components/profiles/ProfileCard.tsx
interface ProfileCardProps {
  profile: Profile;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onLaunch?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProfileCard({
  profile,
  isSelected,
  onSelect,
  onLaunch,
  onEdit,
  onDelete
}: ProfileCardProps) {
  const isLocked = !!profile.locked_by;

  return (
    <Card className={cn(
      'relative transition-all hover:shadow-md',
      isSelected && 'ring-2 ring-primary'
    )}>
      {/* Selection checkbox */}
      <div className="absolute top-3 left-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
        />
      </div>

      {/* Status badge */}
      <div className="absolute top-3 right-3">
        <Badge variant={isLocked ? 'destructive' : 'secondary'}>
          {isLocked ? 'In Use' : 'Available'}
        </Badge>
      </div>

      <CardContent className="pt-12 pb-4">
        {/* Avatar/Icon */}
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-2xl text-white font-bold">
              {profile.name.charAt(0)}
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-center truncate">
          {profile.name}
        </h3>

        {/* Template */}
        <p className="text-sm text-muted-foreground text-center">
          {profile.template_id.replace(/_/g, ' ')}
        </p>

        {/* Tags */}
        {profile.tags?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {profile.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Last active */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          Last active {formatDistanceToNow(profile.last_active, { addSuffix: true })}
        </p>
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex gap-2 pt-0">
        <Button
          className="flex-1"
          onClick={onLaunch}
          disabled={isLocked}
        >
          <Play className="h-4 w-4 mr-1" />
          Launch
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={onDelete}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
```

---

### QuickLaunch

Command palette style quick launcher for profiles.

```tsx
// components/dashboard/QuickLaunch.tsx
interface QuickLaunchProps {
  onLaunch: (profileId: string) => void;
}

export function QuickLaunch({ onLaunch }: QuickLaunchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data } = useProfiles({ search, limit: 10 });

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        Quick launch...
        <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </Button>

      {/* Command dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search profiles..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No profiles found.</CommandEmpty>
          <CommandGroup heading="Recent Profiles">
            {data?.profiles.map(profile => (
              <CommandItem
                key={profile.id}
                value={profile.name}
                onSelect={() => {
                  onLaunch(profile.id);
                  setOpen(false);
                }}
                disabled={!!profile.locked_by}
              >
                <div className="h-8 w-8 rounded bg-gradient-to-br from-indigo-500 to-purple-500 mr-3 flex items-center justify-center">
                  <span className="text-sm text-white font-bold">
                    {profile.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{profile.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {profile.template_id}
                  </div>
                </div>
                {profile.locked_by && (
                  <Badge variant="destructive">In Use</Badge>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

---

### ProxyPoolCard

Display proxy pool with health indicators.

```tsx
// components/proxies/ProxyPoolCard.tsx
interface ProxyPoolCardProps {
  pool: ProxyPool;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProxyPoolCard({ pool, onEdit, onDelete }: ProxyPoolCardProps) {
  const healthyPercent = (pool.healthyCount / pool.proxyCount) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{pool.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={onDelete}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          {pool.type} - {pool.assignment_strategy}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Health bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Health</span>
            <span className={cn(
              healthyPercent >= 80 ? 'text-green-600' :
              healthyPercent >= 50 ? 'text-amber-600' :
              'text-red-600'
            )}>
              {pool.healthyCount}/{pool.proxyCount} healthy
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                healthyPercent >= 80 ? 'bg-green-500' :
                healthyPercent >= 50 ? 'bg-amber-500' :
                'bg-red-500'
              )}
              style={{ width: `${healthyPercent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <div className="text-2xl font-bold">{pool.proxyCount}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {pool.healthyCount}
            </div>
            <div className="text-xs text-muted-foreground">Healthy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {pool.proxyCount - pool.healthyCount}
            </div>
            <div className="text-xs text-muted-foreground">Issues</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### StatsWidget

Dashboard statistic display.

```tsx
// components/dashboard/StatsWidget.tsx
interface StatsWidgetProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function StatsWidget({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default'
}: StatsWidgetProps) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-500/10 text-green-600',
    warning: 'bg-amber-500/10 text-amber-600',
    destructive: 'bg-red-500/10 text-red-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn(
            'h-12 w-12 rounded-lg flex items-center justify-center',
            variantStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>

          {trend && (
            <div className={cn(
              'flex items-center text-sm',
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-3xl font-bold">{value}</h3>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### ActivityFeed

Real-time activity feed for team dashboard.

```tsx
// components/dashboard/ActivityFeed.tsx
interface ActivityFeedProps {
  entries: AuditEntry[];
  isLoading?: boolean;
}

const actionIcons: Record<string, LucideIcon> = {
  'profile.create': Plus,
  'profile.launch': Play,
  'profile.delete': Trash,
  'profile.update': Pencil,
  'team.invite': UserPlus,
  'team.remove': UserMinus
};

const actionColors: Record<string, string> = {
  'profile.create': 'bg-green-500',
  'profile.launch': 'bg-blue-500',
  'profile.delete': 'bg-red-500',
  'profile.update': 'bg-amber-500',
  'team.invite': 'bg-purple-500',
  'team.remove': 'bg-red-500'
};

export function ActivityFeed({ entries, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const Icon = actionIcons[entry.action] || Activity;
        const color = actionColors[entry.action] || 'bg-gray-500';

        return (
          <div key={entry.id} className="flex gap-3">
            {/* Icon */}
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
              color
            )}>
              <Icon className="h-4 w-4 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{entry.user.name}</span>
                {' '}
                <span className="text-muted-foreground">
                  {formatAction(entry.action)}
                </span>
                {' '}
                <span className="font-medium">{entry.target.name}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    'profile.create': 'created profile',
    'profile.launch': 'launched profile',
    'profile.delete': 'deleted profile',
    'profile.update': 'updated profile',
    'team.invite': 'invited',
    'team.remove': 'removed'
  };
  return map[action] || action;
}
```

---

### CreateProfileForm

Multi-step form for creating a new profile.

```tsx
// components/profiles/CreateProfileForm.tsx
const formSchema = z.object({
  name: z.string().min(1).max(100),
  templateId: z.string(),
  groupId: z.string().optional(),
  timezone: z.string(),
  language: z.string(),
  proxyType: z.enum(['none', 'pool', 'direct']),
  proxyId: z.string().optional(),
  proxy: z.string().optional(),
  notes: z.string().max(1000).optional()
});

type FormData = z.infer<typeof formSchema>;

interface CreateProfileFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export function CreateProfileForm({ onSubmit, onCancel }: CreateProfileFormProps) {
  const [step, setStep] = useState(1);
  const { data: templates } = useTemplates();
  const { data: groups } = useGroups();
  const { data: proxyPools } = useProxyPools();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      templateId: 'windows_chrome_desktop',
      timezone: 'America/New_York',
      language: 'en-US',
      proxyType: 'none'
    }
  });

  const steps = [
    { id: 1, name: 'Basic Info', icon: User },
    { id: 2, name: 'Fingerprint', icon: Fingerprint },
    { id: 3, name: 'Network', icon: Globe }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center space-x-4">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
                  step === s.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <s.icon className="h-4 w-4" />
                {s.name}
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Amazon Store #1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No Group</SelectItem>
                      {groups?.groups.map(g => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this profile..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 2: Fingerprint */}
        {step === 2 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Browser Template</FormLabel>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {templates?.templates.map(t => (
                      <div
                        key={t.id}
                        className={cn(
                          'p-4 border rounded-lg cursor-pointer transition-all',
                          field.value === t.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-muted-foreground'
                        )}
                        onClick={() => field.onChange(t.id)}
                      >
                        <div className="font-medium">{t.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {t.os} - {t.browser}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                          {Math.round(t.popularity * 100)}% usage
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="America/New_York">New York (EST)</SelectItem>
                        <SelectItem value="America/Chicago">Chicago (CST)</SelectItem>
                        <SelectItem value="America/Denver">Denver (MST)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Step 3: Network */}
        {step === 3 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="proxyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proxy Configuration</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-3 gap-3 mt-2"
                  >
                    <div className={cn(
                      'border rounded-lg p-4 cursor-pointer',
                      field.value === 'none' && 'border-primary bg-primary/5'
                    )}>
                      <RadioGroupItem value="none" id="none" className="sr-only" />
                      <Label htmlFor="none" className="cursor-pointer">
                        <div className="font-medium">No Proxy</div>
                        <div className="text-sm text-muted-foreground">
                          Use direct connection
                        </div>
                      </Label>
                    </div>

                    <div className={cn(
                      'border rounded-lg p-4 cursor-pointer',
                      field.value === 'pool' && 'border-primary bg-primary/5'
                    )}>
                      <RadioGroupItem value="pool" id="pool" className="sr-only" />
                      <Label htmlFor="pool" className="cursor-pointer">
                        <div className="font-medium">Proxy Pool</div>
                        <div className="text-sm text-muted-foreground">
                          Use shared pool
                        </div>
                      </Label>
                    </div>

                    <div className={cn(
                      'border rounded-lg p-4 cursor-pointer',
                      field.value === 'direct' && 'border-primary bg-primary/5'
                    )}>
                      <RadioGroupItem value="direct" id="direct" className="sr-only" />
                      <Label htmlFor="direct" className="cursor-pointer">
                        <div className="font-medium">Custom Proxy</div>
                        <div className="text-sm text-muted-foreground">
                          Enter manually
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('proxyType') === 'pool' && (
              <FormField
                control={form.control}
                name="proxyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Proxy Pool</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a pool" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {proxyPools?.pools.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.healthyCount}/{p.proxyCount} healthy)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch('proxyType') === 'direct' && (
              <FormField
                control={form.control}
                name="proxy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proxy URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="socks5://user:pass@1.2.3.4:1080"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Supported formats: http://, https://, socks4://, socks5://
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={step > 1 ? () => setStep(step - 1) : onCancel}
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </Button>

          {step < 3 ? (
            <Button type="button" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : (
            <Button type="submit">
              Create Profile
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
```

---

### BulkActions

Toolbar for bulk operations on selected items.

```tsx
// components/profiles/BulkActions.tsx
interface BulkActionsProps {
  selectedIds: string[];
  onClear: () => void;
}

export function BulkActions({ selectedIds, onClear }: BulkActionsProps) {
  const { data: groups } = useGroups();
  const bulkUpdate = useBulkUpdateProfiles();

  const handleMoveToGroup = async (groupId: string | null) => {
    await bulkUpdate.mutateAsync({
      action: 'move_to_group',
      profileIds: selectedIds,
      params: { groupId }
    });
    onClear();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} profile(s)?`)) return;
    await bulkUpdate.mutateAsync({
      action: 'delete',
      profileIds: selectedIds
    });
    onClear();
  };

  return (
    <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg">
      <span className="text-sm font-medium">
        {selectedIds.length} selected
      </span>

      <Separator orientation="vertical" className="h-4" />

      {/* Move to group */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <FolderMove className="h-4 w-4 mr-2" />
            Move
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleMoveToGroup(null)}>
            No Group
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {groups?.groups.map(g => (
            <DropdownMenuItem
              key={g.id}
              onClick={() => handleMoveToGroup(g.id)}
            >
              <div
                className="h-3 w-3 rounded mr-2"
                style={{ backgroundColor: g.color }}
              />
              {g.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Launch all */}
      <Button variant="ghost" size="sm">
        <Play className="h-4 w-4 mr-2" />
        Launch All
      </Button>

      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={handleDelete}
      >
        <Trash className="h-4 w-4 mr-2" />
        Delete
      </Button>

      <Separator orientation="vertical" className="h-4" />

      <Button variant="ghost" size="sm" onClick={onClear}>
        <X className="h-4 w-4 mr-2" />
        Clear
      </Button>
    </div>
  );
}
```

---

### EmptyState

Reusable empty state component.

```tsx
// components/shared/EmptyState.tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage:
<EmptyState
  icon={Users}
  title="No profiles yet"
  description="Create your first browser profile to get started with secure multi-account management."
  action={{
    label: "Create Profile",
    onClick: () => setCreateModalOpen(true)
  }}
/>
```

---

## Component Naming Conventions

| Pattern | Example | Usage |
|---------|---------|-------|
| `{Entity}Table` | `ProfileTable` | Data tables |
| `{Entity}Card` | `ProfileCard` | Card displays |
| `{Entity}Form` | `CreateProfileForm` | Forms |
| `{Entity}List` | `TeamMemberList` | List displays |
| `{Action}{Entity}Dialog` | `DeleteProfileDialog` | Dialogs |
| `{Feature}Widget` | `StatsWidget` | Dashboard widgets |
| `{Feature}Feed` | `ActivityFeed` | Activity displays |

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### Example Responsive Component

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {profiles.map(profile => (
    <ProfileCard key={profile.id} profile={profile} />
  ))}
</div>
```

---

## Animation Presets

```tsx
// lib/utils/animations.ts
import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } }
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export const staggerChildren: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

// Usage:
<motion.div
  variants={staggerChildren}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.div key={item.id} variants={slideUp}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## Testing Components

```tsx
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileCard } from './ProfileCard';

const mockProfile = {
  id: 'prof_123',
  name: 'Test Profile',
  template_id: 'windows_chrome_desktop',
  locked_by: null,
  // ... other fields
};

describe('ProfileCard', () => {
  it('renders profile name', () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText('Test Profile')).toBeInTheDocument();
  });

  it('shows available status when not locked', () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('disables launch button when locked', () => {
    const lockedProfile = { ...mockProfile, locked_by: 'other_client' };
    render(<ProfileCard profile={lockedProfile} />);
    expect(screen.getByRole('button', { name: /launch/i })).toBeDisabled();
  });

  it('calls onLaunch when launch button clicked', () => {
    const onLaunch = jest.fn();
    render(<ProfileCard profile={mockProfile} onLaunch={onLaunch} />);
    fireEvent.click(screen.getByRole('button', { name: /launch/i }));
    expect(onLaunch).toHaveBeenCalled();
  });
});
```

---

## Next Steps

1. Initialize shadcn/ui in the project
2. Create all base components
3. Build custom components as defined above
4. Set up Storybook for component documentation
