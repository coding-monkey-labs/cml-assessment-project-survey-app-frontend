/**
 * Core models for the Office Assistant conversation system
 */

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  metadata?: ConversationMetadata;
}

export interface ConversationMetadata {
  skillsUsed?: string[];
  toolsInvoked?: string[];
  totalTokens?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface MessageMetadata {
  skillId?: string;
  skillExecution?: SkillExecutionInfo;
  toolResults?: ToolResult[];
  isStreaming?: boolean;
  error?: MessageError;
}

export interface SkillExecutionInfo {
  skillId: string;
  skillName: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  currentStep?: string;
  totalSteps?: number;
  completedSteps?: number;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ToolResult {
  toolName: string;
  input: Record<string, unknown>;
  output: unknown;
  duration: number;
  status: 'success' | 'error';
  error?: string;
}

export interface MessageError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Chat input/output interfaces
 */
export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: ChatContext;
}

export interface ChatContext {
  activeSkill?: string;
  parameters?: Record<string, unknown>;
  previousResults?: unknown;
}

export interface ChatResponse {
  message: Message;
  conversationId: string;
  suggestedActions?: SuggestedAction[];
}

export interface SuggestedAction {
  label: string;
  action: string;
  parameters?: Record<string, unknown>;
}

/**
 * WebSocket events for real-time updates
 */
export interface StreamingEvent {
  type: StreamingEventType;
  conversationId: string;
  messageId: string;
  payload: unknown;
}

export type StreamingEventType =
  | 'message_start'
  | 'message_delta'
  | 'message_complete'
  | 'tool_start'
  | 'tool_complete'
  | 'skill_step'
  | 'error';

export interface MessageDelta {
  content: string;
  index: number;
}

export interface ToolStartEvent {
  toolName: string;
  input: Record<string, unknown>;
}

export interface ToolCompleteEvent {
  toolName: string;
  output: unknown;
  duration: number;
}

export interface SkillStepEvent {
  stepNumber: number;
  stepName: string;
  status: ExecutionStatus;
  output?: unknown;
}
