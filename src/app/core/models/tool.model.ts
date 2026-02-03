/**
 * Models for MCP tools and integrations
 * These represent the available tools that skills can use
 */

export interface Tool {
  id: string;
  name: string;
  description: string;
  provider: ToolProvider;
  category: ToolCategory;
  isEnabled: boolean;
  isConfigured: boolean;
  healthStatus: ToolHealthStatus;
  lastHealthCheck?: Date;
}

export type ToolProvider =
  | 'jira'
  | 'confluence'
  | 'git'
  | 'sharepoint'
  | 'workday'
  | 'onenote'
  | 'llm'
  | 'database'
  | 'internal';

export type ToolCategory =
  | 'issue-tracking'
  | 'documentation'
  | 'source-control'
  | 'file-storage'
  | 'hr-systems'
  | 'notes'
  | 'ai'
  | 'data'
  | 'utility';

export type ToolHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Detailed tool definition with capabilities
 */
export interface ToolDefinition extends Tool {
  version: string;
  capabilities: ToolCapability[];
  requiredConfig: ToolConfigField[];
  rateLimit?: RateLimitConfig;
}

export interface ToolCapability {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  examples?: ToolExample[];
}

export interface ToolExample {
  description: string;
  input: Record<string, unknown>;
  output: unknown;
}

export interface ToolConfigField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'secret';
  required: boolean;
  description: string;
  default?: unknown;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  concurrentRequests: number;
}

/**
 * Tool configuration stored in database
 */
export interface ToolConfig {
  toolId: string;
  config: Record<string, unknown>;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MCP-specific types
 */
export interface MCPServer {
  id: string;
  name: string;
  transport: MCPTransport;
  status: MCPServerStatus;
  tools: string[];
  resources?: string[];
}

export type MCPTransport = 'stdio' | 'http' | 'websocket';

export type MCPServerStatus = 'running' | 'stopped' | 'error' | 'starting';

export interface MCPToolCall {
  server: string;
  tool: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolResult {
  content: MCPContent[];
  isError?: boolean;
}

export interface MCPContent {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
  uri?: string;
}

/**
 * Available tools registry
 */
export const AVAILABLE_TOOLS: Partial<ToolDefinition>[] = [
  // JIRA Tools
  {
    id: 'jira.get_issue',
    name: 'Get JIRA Issue',
    description: 'Retrieve full details of a JIRA issue including fields, comments, and history',
    provider: 'jira',
    category: 'issue-tracking',
  },
  {
    id: 'jira.search',
    name: 'Search JIRA',
    description: 'Search JIRA issues using JQL (JIRA Query Language)',
    provider: 'jira',
    category: 'issue-tracking',
  },
  {
    id: 'jira.get_comments',
    name: 'Get JIRA Comments',
    description: 'Retrieve all comments on a JIRA issue',
    provider: 'jira',
    category: 'issue-tracking',
  },
  {
    id: 'jira.create_issue',
    name: 'Create JIRA Issue',
    description: 'Create a new JIRA issue',
    provider: 'jira',
    category: 'issue-tracking',
  },

  // Confluence Tools
  {
    id: 'confluence.search',
    name: 'Search Confluence',
    description: 'Search Confluence pages and spaces using CQL',
    provider: 'confluence',
    category: 'documentation',
  },
  {
    id: 'confluence.get_page',
    name: 'Get Confluence Page',
    description: 'Retrieve a Confluence page by ID including content',
    provider: 'confluence',
    category: 'documentation',
  },
  {
    id: 'confluence.create_page',
    name: 'Create Confluence Page',
    description: 'Create a new Confluence page',
    provider: 'confluence',
    category: 'documentation',
  },

  // Workday Tools
  {
    id: 'workday.search_employees',
    name: 'Search Employees',
    description: 'Search for employees by name, email, or department',
    provider: 'workday',
    category: 'hr-systems',
  },
  {
    id: 'workday.get_employee',
    name: 'Get Employee Details',
    description: 'Retrieve detailed employee information',
    provider: 'workday',
    category: 'hr-systems',
  },
  {
    id: 'workday.get_org_chart',
    name: 'Get Org Chart',
    description: 'Retrieve organizational hierarchy for an employee',
    provider: 'workday',
    category: 'hr-systems',
  },

  // Git Tools
  {
    id: 'git.get_repository',
    name: 'Get Repository',
    description: 'Get repository information and recent activity',
    provider: 'git',
    category: 'source-control',
  },
  {
    id: 'git.search_code',
    name: 'Search Code',
    description: 'Search code across repositories',
    provider: 'git',
    category: 'source-control',
  },
  {
    id: 'git.get_pull_requests',
    name: 'Get Pull Requests',
    description: 'List pull requests with optional filters',
    provider: 'git',
    category: 'source-control',
  },

  // LLM Tools
  {
    id: 'llm.complete',
    name: 'LLM Completion',
    description: 'Generate text using an LLM with a prompt',
    provider: 'llm',
    category: 'ai',
  },
  {
    id: 'llm.analyze',
    name: 'LLM Analysis',
    description: 'Analyze content and extract structured information',
    provider: 'llm',
    category: 'ai',
  },
  {
    id: 'llm.summarize',
    name: 'LLM Summarize',
    description: 'Summarize long content into key points',
    provider: 'llm',
    category: 'ai',
  },

  // Database Tools
  {
    id: 'database.query',
    name: 'Database Query',
    description: 'Execute a read-only database query',
    provider: 'database',
    category: 'data',
  },
  {
    id: 'database.upsert',
    name: 'Database Upsert',
    description: 'Insert or update a record in the database',
    provider: 'database',
    category: 'data',
  },
  {
    id: 'database.store',
    name: 'Database Store',
    description: 'Store data for later retrieval',
    provider: 'database',
    category: 'data',
  },
];
