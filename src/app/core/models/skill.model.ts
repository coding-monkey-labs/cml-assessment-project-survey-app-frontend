/**
 * Models for the runtime skill system
 * Skills are defined in Markdown files and loaded at runtime
 */

export interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: SkillCategory;
  icon: string;
  tags: string[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SkillCategory =
  | 'analysis'
  | 'people'
  | 'documentation'
  | 'development'
  | 'communication'
  | 'reporting'
  | 'custom';

/**
 * Full skill definition as parsed from MD file
 */
export interface SkillDefinition extends Skill {
  triggers: SkillTrigger[];
  inputParameters: SkillParameter[];
  workflowSteps: WorkflowStep[];
  outputSchema: Record<string, unknown>;
  uiConfig?: SkillUIConfig;
  errorHandling?: ErrorHandlingConfig[];
}

export interface SkillTrigger {
  pattern: string;
  regex?: RegExp;
  extractedParams: string[];
}

export interface SkillParameter {
  name: string;
  type: ParameterType;
  required: boolean;
  default?: unknown;
  description: string;
  validation?: ParameterValidation;
}

export type ParameterType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'array'
  | 'object';

export interface ParameterValidation {
  pattern?: string;
  min?: number;
  max?: number;
  enum?: string[];
  errorMessage?: string;
}

/**
 * Workflow step definitions
 */
export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  tool?: string;
  action?: string;
  input: Record<string, unknown>;
  output: string;
  condition?: string;
  onError?: ErrorAction;
  promptFile?: string;
}

export type StepType = 'tool' | 'llm' | 'action' | 'conditional' | 'loop';

export interface ErrorAction {
  action: 'fail' | 'continue' | 'retry';
  message?: string;
  default?: unknown;
  maxRetries?: number;
}

/**
 * UI Configuration for skill results display
 */
export interface SkillUIConfig {
  displayType: 'card' | 'list' | 'table' | 'profile-card' | 'custom';
  layout: 'single' | 'two-column' | 'sections';
  sections: UISection[];
  actions: UIAction[];
}

export interface UISection {
  id: string;
  title: string;
  icon?: string;
  expanded?: boolean;
  fields: UIField[];
}

export interface UIField {
  path: string;
  type: UIFieldType;
  label?: string;
  style?: string;
  icon?: string;
  colorMap?: Record<string, string>;
  maxItems?: number;
  itemTemplate?: string;
}

export type UIFieldType =
  | 'text'
  | 'markdown'
  | 'badge'
  | 'bullet-list'
  | 'list'
  | 'timeline'
  | 'avatar'
  | 'email-link'
  | 'phone-link'
  | 'mini-org-chart';

export interface UIAction {
  id: string;
  label: string;
  icon: string;
  action: UIActionType;
  data?: string;
}

export type UIActionType =
  | 'copy_to_clipboard'
  | 'share_dialog'
  | 'export_pdf'
  | 'create_jira'
  | 'mailto'
  | 'open_url';

export interface ErrorHandlingConfig {
  error: string;
  behavior: string;
}

/**
 * Skill execution tracking
 */
export interface SkillExecution {
  id: string;
  skillId: string;
  conversationId: string;
  inputParams: Record<string, unknown>;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  steps: StepExecution[];
  output?: unknown;
  error?: SkillExecutionError;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface StepExecution {
  stepId: string;
  stepName: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  skipped?: boolean;
  skipReason?: string;
}

export interface SkillExecutionError {
  code: string;
  message: string;
  step?: string;
  details?: unknown;
}

/**
 * Skill matching result from intent classification
 */
export interface SkillMatch {
  skill: Skill;
  confidence: number;
  extractedParams: Record<string, unknown>;
  matchedTrigger: string;
}

/**
 * Skill creation/editing
 */
export interface SkillDraft {
  name: string;
  description: string;
  category: SkillCategory;
  triggers: string[];
  inputParameters: SkillParameter[];
  workflowSteps: WorkflowStepDraft[];
}

export interface WorkflowStepDraft {
  name: string;
  type: StepType;
  toolId?: string;
  config: Record<string, unknown>;
}
