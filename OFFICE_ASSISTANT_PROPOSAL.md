# Office Assistant - Technical Proposal

## Executive Summary

An AI-powered Office Assistant that integrates multiple enterprise tools (JIRA, Confluence, Git, SharePoint, Workday, OneNote) through a unified interface. The system features **runtime skill creation** where new capabilities can be added via markdown files without code changes.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [Skill System Design](#skill-system-design)
4. [Technology Stack](#technology-stack)
5. [Component Breakdown](#component-breakdown)
6. [Implementation Roadmap](#implementation-roadmap)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Angular 18)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Chat View   │  │ JIRA Analyzer│  │Person Lookup │  │ Skill Creator│     │
│  │  (Copilot)   │  │  (Custom UI) │  │ (Custom UI)  │  │  (No-Code)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                    │                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Shared Services & State Management                 │   │
│  │   • ConversationService  • SkillService  • ToolService  • AuthService│   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ REST API / WebSocket
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Python FastAPI)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         API Gateway Layer                             │   │
│  │   /api/chat  │  /api/skills  │  /api/tools  │  /api/conversations    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      SKILL ORCHESTRATION ENGINE                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │   │
│  │  │   Intent    │  │   Skill     │  │  Workflow   │                   │   │
│  │  │  Classifier │──│   Matcher   │──│  Executor   │                   │   │
│  │  │   (LLM)     │  │  (MD Files) │  │  (Runtime)  │                   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         MCP SERVER LAYER                              │   │
│  │   Provides standardized interface to all external tools               │   │
│  │  ┌────────┐ ┌──────────┐ ┌─────┐ ┌───────────┐ ┌───────┐ ┌───────┐  │   │
│  │  │  JIRA  │ │Confluence│ │ Git │ │SharePoint │ │Workday│ │OneNote│  │   │
│  │  │  MCP   │ │   MCP    │ │ MCP │ │   MCP     │ │  MCP  │ │  MCP  │  │   │
│  │  └────────┘ └──────────┘ └─────┘ └───────────┘ └───────┘ └───────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         LLM INTEGRATION LAYER                         │   │
│  │   • OpenAI Compatible API  • Local LLMs  • Claude  • Custom Models   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                 │
│  │   PostgreSQL   │  │  Skills Store  │  │  Vector Store  │                 │
│  │  (Main Data)   │  │  (MD Files)    │  │ (Embeddings)   │                 │
│  └────────────────┘  └────────────────┘  └────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### 1. What is MCP (Model Context Protocol)?

MCP is a standardized protocol for connecting AI assistants to external tools and data sources. Think of it as a "USB for AI" - a universal way to plug in any tool.

```
┌─────────────────┐     MCP Protocol      ┌─────────────────┐
│   AI Assistant  │◄────────────────────►│    MCP Server   │
│   (Your App)    │   standardized API    │   (JIRA, etc)   │
└─────────────────┘                       └─────────────────┘
```

**Benefits:**
- **Standardized Interface**: All tools speak the same language
- **Hot-swappable**: Add/remove tools without code changes
- **Secure**: Centralized authentication and authorization
- **Discoverable**: Tools self-describe their capabilities

### 2. Skills vs Tools

| Concept | Description | Example |
|---------|-------------|---------|
| **Tool** | A single API capability | "Get JIRA details", "Search Confluence" |
| **Skill** | A workflow combining multiple tools | "JIRA Refiner" = Get JIRA + Search Confluence + Summarize with LLM |

### 3. Runtime Skill Creation

Skills are defined in **Markdown files** that the LLM interprets at runtime:

```
skills/
├── jira-refiner/
│   ├── skill.md           # Main skill definition
│   ├── prompts/
│   │   ├── analyze.md     # Analysis prompt template
│   │   └── summarize.md   # Summary prompt template
│   └── ui-config.json     # Optional custom UI configuration
├── person-lookup/
│   └── skill.md
└── confluence-search/
    └── skill.md
```

---

## Skill System Design

### Skill Definition Format (skill.md)

```markdown
# JIRA Refiner

## Metadata
- **ID**: jira-refiner
- **Version**: 1.0.0
- **Author**: System
- **Category**: Analysis
- **Icon**: 🔍

## Description
Analyzes a JIRA ticket comprehensively by gathering data from multiple sources
and providing a refined summary with actionable insights.

## Triggers
- "refine jira {jira_id}"
- "analyze jira {jira_id}"
- "explain jira {jira_id}"
- "what is {jira_id} about"

## Input Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jira_id   | string | Yes | The JIRA ticket ID (e.g., PROJ-1234) |
| depth     | enum[shallow,deep] | No | Analysis depth (default: deep) |

## Workflow Steps

### Step 1: Fetch JIRA Details
```yaml
tool: jira.get_issue
input:
  issue_key: "{{jira_id}}"
output: jira_data
```

### Step 2: Extract Related Information
```yaml
tool: jira.get_comments
input:
  issue_key: "{{jira_id}}"
output: jira_comments
```

### Step 3: Search Confluence for Related Pages
```yaml
tool: confluence.search
input:
  query: "{{jira_id}} OR {{jira_data.summary}}"
  limit: 10
output: confluence_pages
```

### Step 4: Fetch Confluence Page Contents
```yaml
tool: confluence.get_pages_content
input:
  page_ids: "{{confluence_pages.ids}}"
output: confluence_content
condition: "{{confluence_pages.count > 0}}"
```

### Step 5: Analyze with LLM
```yaml
tool: llm.analyze
prompt_file: prompts/analyze.md
input:
  jira: "{{jira_data}}"
  comments: "{{jira_comments}}"
  confluence: "{{confluence_content}}"
output: analysis
```

### Step 6: Generate Summary
```yaml
tool: llm.summarize
prompt_file: prompts/summarize.md
input:
  analysis: "{{analysis}}"
  original_jira: "{{jira_data}}"
output: final_summary
```

### Step 7: Store Results
```yaml
tool: database.store
input:
  type: "jira_analysis"
  reference_id: "{{jira_id}}"
  data: "{{final_summary}}"
output: stored_record
```

## Output Format
```json
{
  "jira_id": "{{jira_id}}",
  "summary": "{{final_summary.summary}}",
  "key_points": "{{final_summary.key_points}}",
  "related_documents": "{{confluence_pages}}",
  "recommendations": "{{final_summary.recommendations}}",
  "stored_at": "{{stored_record.timestamp}}"
}
```

## UI Configuration
- **Display Type**: card
- **Expandable Sections**: true
- **Actions**: ["copy", "share", "export_pdf", "create_followup"]
```

### Prompt Template Example (prompts/analyze.md)

```markdown
# JIRA Analysis Prompt

You are an expert business analyst. Analyze the following JIRA ticket and related documentation.

## JIRA Ticket Details
{{jira}}

## Comments and Discussion
{{comments}}

## Related Confluence Documentation
{{confluence}}

## Your Task

Provide a comprehensive analysis including:

1. **Core Problem Statement**: What is this ticket really about?
2. **Technical Context**: What systems/components are involved?
3. **Business Impact**: Why does this matter?
4. **Dependencies**: What else is this blocked by or blocking?
5. **Risks**: What could go wrong?
6. **Estimated Complexity**: Simple/Medium/Complex with justification

Be specific and reference actual content from the provided materials.
```

---

## Technology Stack

### Frontend (Angular 18)
| Component | Technology |
|-----------|------------|
| Framework | Angular 18 (Standalone Components) |
| UI Library | Angular Material + Custom Components |
| State Management | NgRx or RxJS-based services |
| Chat Interface | Custom chat component with markdown support |
| Real-time | WebSocket (Socket.io client) |

### Backend (Python)
| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| MCP Integration | mcp-python SDK |
| LLM Integration | LangChain / LiteLLM |
| Task Queue | Celery + Redis |
| ORM | SQLAlchemy |
| Database | PostgreSQL |
| Vector Store | pgvector or ChromaDB |

### MCP Servers
| Tool | MCP Server |
|------|------------|
| JIRA | @anthropic/mcp-server-jira or custom |
| Confluence | Custom MCP server |
| Git | @anthropic/mcp-server-github |
| SharePoint | Custom MCP server |
| Workday | Custom MCP server |
| OneNote | Custom MCP server (via Graph API) |

---

## Component Breakdown

### Frontend Components

```
src/app/
├── core/
│   ├── services/
│   │   ├── assistant.service.ts      # Main orchestration service
│   │   ├── conversation.service.ts   # Chat history management
│   │   ├── skill.service.ts          # Skill loading and execution
│   │   ├── websocket.service.ts      # Real-time communication
│   │   └── auth.service.ts           # Authentication
│   ├── models/
│   │   ├── conversation.model.ts
│   │   ├── skill.model.ts
│   │   ├── tool.model.ts
│   │   └── message.model.ts
│   └── interceptors/
│       └── auth.interceptor.ts
│
├── features/
│   ├── chat/                         # Copilot-style chat interface
│   │   ├── chat.component.ts
│   │   ├── chat-input/
│   │   ├── chat-message/
│   │   ├── chat-history/
│   │   └── chat-suggestions/
│   │
│   ├── jira-analyzer/                # Custom JIRA analysis UI
│   │   ├── jira-analyzer.component.ts
│   │   ├── jira-input/
│   │   ├── jira-result-card/
│   │   └── jira-timeline/
│   │
│   ├── person-lookup/                # People search UI
│   │   ├── person-lookup.component.ts
│   │   ├── person-card/
│   │   └── org-chart/
│   │
│   ├── skill-creator/                # No-code skill builder
│   │   ├── skill-creator.component.ts
│   │   ├── workflow-designer/        # Visual workflow builder
│   │   ├── trigger-config/
│   │   ├── prompt-editor/
│   │   └── skill-tester/
│   │
│   └── dashboard/                    # Main dashboard
│       ├── dashboard.component.ts
│       ├── recent-conversations/
│       ├── skill-gallery/
│       └── quick-actions/
│
├── shared/
│   ├── components/
│   │   ├── markdown-renderer/
│   │   ├── code-block/
│   │   ├── loading-indicator/
│   │   ├── tool-result-card/
│   │   └── expandable-section/
│   └── pipes/
│       ├── relative-time.pipe.ts
│       └── highlight.pipe.ts
│
└── app.routes.ts
```

### Backend Structure (Python)

```
backend/
├── app/
│   ├── main.py                       # FastAPI app entry
│   ├── config.py                     # Configuration
│   │
│   ├── api/
│   │   ├── v1/
│   │   │   ├── chat.py               # Chat endpoints
│   │   │   ├── skills.py             # Skill management
│   │   │   ├── tools.py              # Tool status/info
│   │   │   └── conversations.py      # Conversation history
│   │   └── websocket.py              # WebSocket handler
│   │
│   ├── core/
│   │   ├── orchestrator.py           # Main skill orchestration
│   │   ├── intent_classifier.py      # LLM-based intent detection
│   │   ├── skill_matcher.py          # Match input to skills
│   │   ├── workflow_executor.py      # Execute skill workflows
│   │   └── context_manager.py        # Manage conversation context
│   │
│   ├── skills/
│   │   ├── loader.py                 # Load skills from MD files
│   │   ├── parser.py                 # Parse skill MD format
│   │   ├── validator.py              # Validate skill definitions
│   │   └── registry.py               # Skill registry
│   │
│   ├── mcp/
│   │   ├── client.py                 # MCP client wrapper
│   │   ├── servers/
│   │   │   ├── jira_server.py        # JIRA MCP server
│   │   │   ├── confluence_server.py  # Confluence MCP server
│   │   │   ├── workday_server.py     # Workday MCP server
│   │   │   └── sharepoint_server.py  # SharePoint MCP server
│   │   └── tools/                    # Individual tool implementations
│   │
│   ├── llm/
│   │   ├── provider.py               # LLM provider abstraction
│   │   ├── openai_provider.py        # OpenAI/compatible
│   │   ├── anthropic_provider.py     # Claude
│   │   └── prompt_manager.py         # Load/render prompts
│   │
│   ├── db/
│   │   ├── models/
│   │   │   ├── conversation.py
│   │   │   ├── message.py
│   │   │   ├── skill_execution.py
│   │   │   └── user.py
│   │   ├── repositories/
│   │   └── migrations/
│   │
│   └── utils/
│       ├── markdown_parser.py
│       └── template_engine.py
│
├── skills/                           # Skill MD files (runtime loaded)
│   ├── jira-refiner/
│   ├── person-lookup/
│   └── confluence-search/
│
├── tests/
├── requirements.txt
└── Dockerfile
```

---

## Database Schema

```sql
-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system', 'tool'
    content TEXT NOT NULL,
    metadata JSONB, -- tool results, skill info, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Skill executions (audit trail)
CREATE TABLE skill_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    skill_id VARCHAR(100) NOT NULL,
    input_params JSONB,
    output_data JSONB,
    status VARCHAR(20), -- 'pending', 'running', 'completed', 'failed'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);

-- Skills table (metadata, MD files stored on disk)
CREATE TABLE skills (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(20),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false, -- system vs user-created
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tool configurations
CREATE TABLE tool_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name VARCHAR(100) UNIQUE NOT NULL,
    config JSONB NOT NULL, -- API keys, endpoints, etc. (encrypted)
    is_enabled BOOLEAN DEFAULT true,
    last_health_check TIMESTAMP,
    health_status VARCHAR(20)
);
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Angular project structure
- [ ] Create basic chat interface
- [ ] Set up FastAPI backend
- [ ] Implement basic conversation storage
- [ ] Create LLM integration layer

### Phase 2: MCP Integration (Week 3-4)
- [ ] Set up MCP client in Python
- [ ] Implement JIRA MCP server
- [ ] Implement Confluence MCP server
- [ ] Create tool registry and discovery
- [ ] Basic intent classification

### Phase 3: Skill System (Week 5-6)
- [ ] Design skill MD format
- [ ] Implement skill loader/parser
- [ ] Create workflow executor
- [ ] Build skill registry
- [ ] Implement first skill: JIRA Refiner

### Phase 4: Custom UIs (Week 7-8)
- [ ] JIRA Analyzer page
- [ ] Person Lookup page
- [ ] Dashboard with recent activity
- [ ] Skill gallery view

### Phase 5: Skill Creator (Week 9-10)
- [ ] Visual workflow designer
- [ ] Trigger configuration
- [ ] Prompt editor with templates
- [ ] Skill testing interface
- [ ] Skill publishing workflow

### Phase 6: Polish & Scale (Week 11-12)
- [ ] Add remaining MCP servers (SharePoint, Workday, OneNote)
- [ ] Performance optimization
- [ ] Error handling and recovery
- [ ] Security hardening
- [ ] Documentation

---

## Example User Flows

### Flow 1: Chat-based JIRA Query

```
User: "What is JIRA-1234 about?"

System:
1. Intent Classifier detects: "jira_query" with entity "JIRA-1234"
2. Skill Matcher finds: "jira-refiner" skill
3. Workflow Executor runs:
   - Step 1: jira.get_issue("JIRA-1234") → ticket data
   - Step 2: confluence.search("JIRA-1234") → 3 related pages
   - Step 3: llm.summarize(ticket + pages) → summary
4. Response rendered in chat with expandable sections
```

### Flow 2: Custom UI - JIRA Analyzer

```
User: Navigates to /jira-analyzer
       Enters "PROJ-5678" in input field
       Clicks "Analyze"

System:
1. Direct skill invocation: jira-refiner(jira_id="PROJ-5678")
2. Real-time progress shown via WebSocket
3. Results displayed in custom card layout:
   - Summary card
   - Related documents list
   - Timeline of comments
   - Recommended actions
```

### Flow 3: Creating a New Skill

```
User: "I want to create a skill that monitors sprint progress"

System (Skill Creator UI):
1. Name: "Sprint Monitor"
2. Triggers: "how is sprint {sprint_id}", "sprint status {sprint_id}"
3. Workflow steps (drag-and-drop):
   - Get sprint details (JIRA)
   - Get all issues in sprint (JIRA)
   - Calculate completion metrics (Built-in)
   - Generate summary (LLM)
4. Test with sample sprint ID
5. Publish skill → generates sprint-monitor/skill.md
```

---

## Security Considerations

1. **API Keys**: All tool credentials stored encrypted in database
2. **MCP Security**: Each MCP server runs in isolated process
3. **Input Validation**: All user inputs sanitized before tool execution
4. **Rate Limiting**: Per-user and per-tool rate limits
5. **Audit Logging**: All skill executions logged for compliance
6. **RBAC**: Role-based access to tools and skills

---

## Next Steps

1. **Review this proposal** and provide feedback
2. **Prioritize features** - What's most important to build first?
3. **Define tool access** - Which tools do you have API access to?
4. **Choose LLM provider** - OpenAI, Claude, local models?
5. **Start implementation** - Begin with Phase 1 foundation

---

*This proposal is a living document and will evolve as we build the system.*
