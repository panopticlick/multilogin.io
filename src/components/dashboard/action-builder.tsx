'use client';

import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Play,
  GripVertical,
  Trash2,
  Copy,
  Settings2,
  MoreHorizontal,
  Navigation,
  MousePointer,
  Type,
  Clock,
  ArrowDown,
  Camera,
  FileText,
  GitBranch,
  Repeat,
  Code,
  Save,
  Zap,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

// Types
type ActionType =
  | 'navigate'
  | 'click'
  | 'type'
  | 'wait'
  | 'scroll'
  | 'screenshot'
  | 'extract'
  | 'condition'
  | 'loop'
  | 'script';

interface ActionStep {
  id: string;
  type: ActionType;
  name: string;
  config: Record<string, unknown>;
  order: number;
  enabled: boolean;
  timeout?: number;
  retries?: number;
  onError?: 'stop' | 'continue' | 'retry';
}

// Action type configurations
const actionTypes: Record<
  ActionType,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    description: string;
    defaultConfig: Record<string, unknown>;
    configFields: Array<{
      key: string;
      label: string;
      type: 'text' | 'number' | 'select' | 'textarea' | 'boolean';
      placeholder?: string;
      options?: Array<{ value: string; label: string }>;
      required?: boolean;
    }>;
  }
> = {
  navigate: {
    label: 'Navigate',
    icon: Navigation,
    color: 'text-blue-500 bg-blue-500/10',
    description: 'Go to a URL',
    defaultConfig: { url: '', waitUntil: 'load' },
    configFields: [
      { key: 'url', label: 'URL', type: 'text', placeholder: 'https://example.com', required: true },
      {
        key: 'waitUntil',
        label: 'Wait Until',
        type: 'select',
        options: [
          { value: 'load', label: 'Page Load' },
          { value: 'domcontentloaded', label: 'DOM Ready' },
          { value: 'networkidle', label: 'Network Idle' },
        ],
      },
    ],
  },
  click: {
    label: 'Click',
    icon: MousePointer,
    color: 'text-green-500 bg-green-500/10',
    description: 'Click an element',
    defaultConfig: { selector: '', button: 'left', clickCount: 1 },
    configFields: [
      { key: 'selector', label: 'Selector', type: 'text', placeholder: '#button, .class, [data-id]', required: true },
      {
        key: 'button',
        label: 'Button',
        type: 'select',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
          { value: 'middle', label: 'Middle' },
        ],
      },
      { key: 'clickCount', label: 'Click Count', type: 'number', placeholder: '1' },
    ],
  },
  type: {
    label: 'Type',
    icon: Type,
    color: 'text-purple-500 bg-purple-500/10',
    description: 'Type text into an input',
    defaultConfig: { selector: '', text: '', delay: 50, clear: false },
    configFields: [
      { key: 'selector', label: 'Selector', type: 'text', placeholder: 'input[name="email"]', required: true },
      { key: 'text', label: 'Text', type: 'textarea', placeholder: 'Text to type...', required: true },
      { key: 'delay', label: 'Delay (ms)', type: 'number', placeholder: '50' },
      { key: 'clear', label: 'Clear First', type: 'boolean' },
    ],
  },
  wait: {
    label: 'Wait',
    icon: Clock,
    color: 'text-amber-500 bg-amber-500/10',
    description: 'Wait for time or element',
    defaultConfig: { type: 'time', value: 1000 },
    configFields: [
      {
        key: 'type',
        label: 'Wait For',
        type: 'select',
        options: [
          { value: 'time', label: 'Time (ms)' },
          { value: 'selector', label: 'Element' },
          { value: 'navigation', label: 'Navigation' },
        ],
      },
      { key: 'value', label: 'Value', type: 'text', placeholder: '1000 or selector', required: true },
    ],
  },
  scroll: {
    label: 'Scroll',
    icon: ArrowDown,
    color: 'text-cyan-500 bg-cyan-500/10',
    description: 'Scroll the page',
    defaultConfig: { target: 'page', direction: 'down', amount: 500 },
    configFields: [
      {
        key: 'target',
        label: 'Target',
        type: 'select',
        options: [
          { value: 'page', label: 'Page' },
          { value: 'element', label: 'Element' },
        ],
      },
      { key: 'selector', label: 'Selector (if element)', type: 'text', placeholder: '.scrollable' },
      { key: 'amount', label: 'Amount (px)', type: 'number', placeholder: '500' },
    ],
  },
  screenshot: {
    label: 'Screenshot',
    icon: Camera,
    color: 'text-pink-500 bg-pink-500/10',
    description: 'Take a screenshot',
    defaultConfig: { fullPage: false, type: 'png' },
    configFields: [
      { key: 'fullPage', label: 'Full Page', type: 'boolean' },
      { key: 'selector', label: 'Element Selector (optional)', type: 'text', placeholder: '.container' },
      {
        key: 'type',
        label: 'Format',
        type: 'select',
        options: [
          { value: 'png', label: 'PNG' },
          { value: 'jpeg', label: 'JPEG' },
        ],
      },
    ],
  },
  extract: {
    label: 'Extract',
    icon: FileText,
    color: 'text-orange-500 bg-orange-500/10',
    description: 'Extract data from page',
    defaultConfig: { selector: '', attribute: 'textContent', variable: '' },
    configFields: [
      { key: 'selector', label: 'Selector', type: 'text', placeholder: 'h1.title', required: true },
      {
        key: 'attribute',
        label: 'Attribute',
        type: 'select',
        options: [
          { value: 'textContent', label: 'Text Content' },
          { value: 'innerHTML', label: 'Inner HTML' },
          { value: 'href', label: 'Link (href)' },
          { value: 'src', label: 'Source (src)' },
          { value: 'value', label: 'Value' },
        ],
      },
      { key: 'variable', label: 'Save to Variable', type: 'text', placeholder: 'pageTitle', required: true },
    ],
  },
  condition: {
    label: 'If/Else',
    icon: GitBranch,
    color: 'text-indigo-500 bg-indigo-500/10',
    description: 'Conditional logic',
    defaultConfig: { condition: '', thenSteps: [], elseSteps: [] },
    configFields: [
      { key: 'condition', label: 'Condition', type: 'text', placeholder: '{{variable}} === "value"', required: true },
    ],
  },
  loop: {
    label: 'Loop',
    icon: Repeat,
    color: 'text-teal-500 bg-teal-500/10',
    description: 'Repeat actions',
    defaultConfig: { type: 'count', count: 5, steps: [] },
    configFields: [
      {
        key: 'type',
        label: 'Loop Type',
        type: 'select',
        options: [
          { value: 'count', label: 'Fixed Count' },
          { value: 'while', label: 'While Condition' },
          { value: 'forEach', label: 'For Each Element' },
        ],
      },
      { key: 'count', label: 'Count (if fixed)', type: 'number', placeholder: '5' },
      { key: 'condition', label: 'Condition (if while)', type: 'text', placeholder: '{{index}} < 10' },
    ],
  },
  script: {
    label: 'Script',
    icon: Code,
    color: 'text-red-500 bg-red-500/10',
    description: 'Run custom JavaScript',
    defaultConfig: { code: '' },
    configFields: [
      { key: 'code', label: 'JavaScript Code', type: 'textarea', placeholder: 'return document.title;', required: true },
    ],
  },
};

// Generate unique ID
function generateId(): string {
  return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Sortable Action Item Component
function SortableActionItem({
  step,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggle,
}: {
  step: ActionStep;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const actionConfig = actionTypes[step.type];
  const Icon = actionConfig.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg border transition-all',
        isDragging && 'opacity-50 shadow-lg',
        isSelected && 'ring-2 ring-primary border-primary',
        !step.enabled && 'opacity-50',
        'bg-card hover:bg-muted/50'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Step Number */}
      <span className="w-6 h-6 rounded-full bg-muted text-xs font-medium flex items-center justify-center">
        {index + 1}
      </span>

      {/* Icon */}
      <div className={cn('p-1.5 rounded', actionConfig.color)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <button
        onClick={onSelect}
        className="flex-1 min-w-0 text-left"
      >
        <p className="font-medium text-sm truncate">{step.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {actionConfig.label}
          {typeof step.config.selector === 'string' && step.config.selector && ` • ${step.config.selector}`}
          {typeof step.config.url === 'string' && step.config.url && ` • ${step.config.url}`}
        </p>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Switch
                checked={step.enabled}
                onCheckedChange={onToggle}
                className="scale-75"
              />
            </TooltipTrigger>
            <TooltipContent>
              {step.enabled ? 'Disable step' : 'Enable step'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Action Item for Drag Overlay
function ActionItemOverlay({ step }: { step: ActionStep }) {
  const actionConfig = actionTypes[step.type];
  const Icon = actionConfig.icon;

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border bg-card shadow-xl">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <div className={cn('p-1.5 rounded', actionConfig.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="font-medium text-sm">{step.name}</span>
    </div>
  );
}

// Action Palette Component (左侧动作列表)
function ActionPalette({
  onAddAction,
}: {
  onAddAction: (type: ActionType) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground px-2">Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(actionTypes) as [ActionType, typeof actionTypes[ActionType]][]).map(
          ([type, config]) => (
            <TooltipProvider key={type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onAddAction(type)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border transition-all',
                      'hover:bg-muted/50 hover:border-primary/50',
                      'focus:outline-none focus:ring-2 focus:ring-primary'
                    )}
                  >
                    <div className={cn('p-1.5 rounded', config.color)}>
                      <config.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{config.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{config.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        )}
      </div>
    </div>
  );
}

// Step Configuration Panel
function StepConfigPanel({
  step,
  onUpdate,
  onClose,
}: {
  step: ActionStep;
  onUpdate: (updates: Partial<ActionStep>) => void;
  onClose: () => void;
}) {
  const actionConfig = actionTypes[step.type];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Configure Step
        </h3>
        <div className="flex items-center gap-2">
          <Badge className={actionConfig.color}>
            {actionConfig.label}
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close editor">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Step Name */}
        <div className="space-y-2">
          <Label htmlFor="step-name">Step Name</Label>
          <Input
            id="step-name"
            value={step.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Enter step name..."
          />
        </div>

        {/* Action-specific fields */}
        {actionConfig.configFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.type === 'text' && (
              <Input
                id={field.key}
                value={(step.config[field.key] as string) || ''}
                onChange={(e) =>
                  onUpdate({
                    config: { ...step.config, [field.key]: e.target.value },
                  })
                }
                placeholder={field.placeholder}
              />
            )}
            {field.type === 'number' && (
              <Input
                id={field.key}
                type="number"
                value={(step.config[field.key] as number) || ''}
                onChange={(e) =>
                  onUpdate({
                    config: { ...step.config, [field.key]: parseInt(e.target.value) || 0 },
                  })
                }
                placeholder={field.placeholder}
              />
            )}
            {field.type === 'textarea' && (
              <Textarea
                id={field.key}
                value={(step.config[field.key] as string) || ''}
                onChange={(e) =>
                  onUpdate({
                    config: { ...step.config, [field.key]: e.target.value },
                  })
                }
                placeholder={field.placeholder}
                rows={3}
              />
            )}
            {field.type === 'select' && (
              <Select
                value={(step.config[field.key] as string) || ''}
                onValueChange={(value) =>
                  onUpdate({
                    config: { ...step.config, [field.key]: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.type === 'boolean' && (
              <Switch
                id={field.key}
                checked={(step.config[field.key] as boolean) || false}
                onCheckedChange={(checked) =>
                  onUpdate({
                    config: { ...step.config, [field.key]: checked },
                  })
                }
              />
            )}
          </div>
        ))}

        {/* Advanced Options */}
        <div className="pt-4 border-t space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Advanced</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={step.timeout || ''}
                onChange={(e) =>
                  onUpdate({ timeout: parseInt(e.target.value) || undefined })
                }
                placeholder="30000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retries">Retries</Label>
              <Input
                id="retries"
                type="number"
                value={step.retries || ''}
                onChange={(e) =>
                  onUpdate({ retries: parseInt(e.target.value) || undefined })
                }
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="onError">On Error</Label>
            <Select
              value={step.onError || 'stop'}
              onValueChange={(value) =>
                onUpdate({ onError: value as ActionStep['onError'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stop">Stop Execution</SelectItem>
                <SelectItem value="continue">Continue</SelectItem>
                <SelectItem value="retry">Retry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Action Builder Component
export function ActionBuilder({
  initialSteps = [],
  scriptName = 'Untitled Script',
  onSave,
  onRun,
  className,
}: {
  initialSteps?: ActionStep[];
  scriptName?: string;
  onSave?: (steps: ActionStep[]) => void;
  onRun?: (steps: ActionStep[]) => void;
  className?: string;
}) {
  const [steps, setSteps] = React.useState<ActionStep[]>(initialSteps);
  const [selectedStepId, setSelectedStepId] = React.useState<string | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [isDirty, setIsDirty] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedStep = selectedStepId
    ? steps.find((s) => s.id === selectedStepId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
      setIsDirty(true);
    }
  };

  const addStep = (type: ActionType) => {
    const config = actionTypes[type];
    const newStep: ActionStep = {
      id: generateId(),
      type,
      name: `${config.label} ${steps.length + 1}`,
      config: { ...config.defaultConfig },
      order: steps.length,
      enabled: true,
    };
    setSteps([...steps, newStep]);
    setSelectedStepId(newStep.id);
    setIsDirty(true);
  };

  const updateStep = (id: string, updates: Partial<ActionStep>) => {
    setSteps((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    setIsDirty(true);
  };

  const deleteStep = (id: string) => {
    setSteps((items) => items.filter((item) => item.id !== id));
    if (selectedStepId === id) {
      setSelectedStepId(null);
    }
    setIsDirty(true);
  };

  const duplicateStep = (id: string) => {
    const step = steps.find((s) => s.id === id);
    if (step) {
      const newStep: ActionStep = {
        ...step,
        id: generateId(),
        name: `${step.name} (copy)`,
        order: steps.length,
      };
      setSteps([...steps, newStep]);
      setIsDirty(true);
    }
  };

  const toggleStep = (id: string) => {
    const step = steps.find((s) => s.id === id);
    if (step) {
      updateStep(id, { enabled: !step.enabled });
    }
  };

  const activeStep = activeId ? steps.find((s) => s.id === activeId) : null;

  return (
    <div className={cn('grid grid-cols-[280px_1fr_320px] gap-4 h-[600px]', className)}>
      {/* Left Panel - Action Palette */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Add Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <ActionPalette onAddAction={addStep} />
        </CardContent>
      </Card>

      {/* Center Panel - Steps List */}
      <Card className="overflow-hidden flex flex-col">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between shrink-0">
          <CardTitle className="text-base">{scriptName}</CardTitle>
          <div className="flex items-center gap-2">
            {isDirty && (
              <Badge variant="outline" className="text-amber-500 border-amber-500">
                Unsaved
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSave?.(steps)}
              disabled={!isDirty}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              onClick={() => onRun?.(steps)}
              disabled={steps.length === 0}
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 flex-1 overflow-auto">
          {steps.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
              <Zap className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="font-medium">No steps yet</p>
              <p className="text-sm text-muted-foreground">
                Click an action from the left panel to add your first step
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steps.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <SortableActionItem
                      key={step.id}
                      step={step}
                      index={index}
                      isSelected={selectedStepId === step.id}
                      onSelect={() => setSelectedStepId(step.id)}
                      onDelete={() => deleteStep(step.id)}
                      onDuplicate={() => duplicateStep(step.id)}
                      onToggle={() => toggleStep(step.id)}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeStep ? <ActionItemOverlay step={activeStep} /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Right Panel - Step Configuration */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 h-full overflow-auto">
          {selectedStep ? (
            <StepConfigPanel
              step={selectedStep}
              onUpdate={(updates) => updateStep(selectedStep.id, updates)}
              onClose={() => setSelectedStepId(null)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Settings2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="font-medium">No step selected</p>
              <p className="text-sm text-muted-foreground">
                Click a step to configure it
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Compact Script Card for listing
export function ScriptCard({
  script,
  onRun,
  onEdit,
}: {
  script: {
    id: string;
    name: string;
    description?: string;
    steps: number;
    lastRun?: Date;
    successRate: number;
  };
  onRun?: () => void;
  onEdit?: () => void;
}) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-semibold">{script.name}</h4>
            {script.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {script.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{script.steps} steps</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {script.successRate >= 90 ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                )}
                {script.successRate}% success
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button size="sm" onClick={onRun}>
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ActionBuilder;
