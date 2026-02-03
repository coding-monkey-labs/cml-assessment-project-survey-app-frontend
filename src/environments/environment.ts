/**
 * Development environment configuration
 */
export const environment = {
  production: false,

  // Backend API URL
  apiUrl: 'http://localhost:8000',

  // WebSocket URL for streaming (derived from apiUrl if not set)
  wsUrl: 'ws://localhost:8000',

  // Feature flags
  features: {
    // Enable skill creator for users
    skillCreator: true,

    // Enable streaming responses
    streaming: true,

    // Enable debug mode (shows tool calls, timing, etc.)
    debugMode: true,

    // Enable offline mode with cached skills
    offlineMode: false,
  },

  // LLM Configuration
  llm: {
    // Default model to use
    defaultModel: 'gpt-4',

    // Available models
    models: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'],

    // Max tokens for responses
    maxTokens: 4096,
  },

  // Tool configuration
  tools: {
    // Timeout for tool calls in milliseconds
    timeout: 30000,

    // Max retries for failed tool calls
    maxRetries: 3,
  },

  // UI Configuration
  ui: {
    // Default theme
    theme: 'light',

    // Show tool execution details in chat
    showToolDetails: true,

    // Max messages to display in chat
    maxChatMessages: 100,
  },
};
