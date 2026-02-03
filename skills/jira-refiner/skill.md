# JIRA Refiner

## Metadata
- **ID**: jira-refiner
- **Version**: 1.0.0
- **Author**: System
- **Category**: Analysis
- **Icon**: magnifying-glass
- **Tags**: jira, analysis, confluence, summary

## Description
Analyzes a JIRA ticket comprehensively by gathering data from multiple sources
(JIRA details, comments, attachments, linked Confluence pages) and providing
a refined summary with actionable insights.

This skill is perfect for:
- Understanding complex tickets quickly
- Onboarding to a new project
- Sprint planning and refinement sessions
- Status updates to stakeholders

## Triggers
These natural language patterns will activate this skill:

```yaml
patterns:
  - "refine jira {jira_id}"
  - "analyze jira {jira_id}"
  - "explain jira {jira_id}"
  - "what is {jira_id} about"
  - "summarize {jira_id}"
  - "tell me about jira {jira_id}"
  - "give me details on {jira_id}"
  - "refine {jira_id}"
```

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| jira_id | string | Yes | - | The JIRA ticket ID (e.g., PROJ-1234) |
| depth | enum | No | deep | Analysis depth: `shallow` (JIRA only) or `deep` (includes Confluence) |
| include_comments | boolean | No | true | Whether to include comment analysis |
| include_attachments | boolean | No | true | Whether to analyze attachment metadata |

## Workflow Steps

### Step 1: Validate Input
```yaml
action: validate
rules:
  - field: jira_id
    pattern: "^[A-Z]+-\\d+$"
    error: "Invalid JIRA ID format. Expected format: PROJ-1234"
```

### Step 2: Fetch JIRA Details
```yaml
tool: jira.get_issue
input:
  issue_key: "{{jira_id}}"
  expand:
    - changelog
    - renderedFields
output: jira_data
on_error:
  action: fail
  message: "Could not fetch JIRA ticket {{jira_id}}. Please verify the ticket exists and you have access."
```

### Step 3: Fetch Comments
```yaml
tool: jira.get_comments
input:
  issue_key: "{{jira_id}}"
  order_by: created
  max_results: 50
output: jira_comments
condition: "{{include_comments}}"
on_error:
  action: continue
  default: []
```

### Step 4: Get Linked Issues
```yaml
tool: jira.get_issue_links
input:
  issue_key: "{{jira_id}}"
output: linked_issues
on_error:
  action: continue
  default: []
```

### Step 5: Search Confluence for Related Pages
```yaml
tool: confluence.search
input:
  cql: "text ~ '{{jira_id}}' OR text ~ '{{jira_data.fields.summary}}'"
  limit: 10
  expand:
    - content.body.view
output: confluence_pages
condition: "{{depth == 'deep'}}"
on_error:
  action: continue
  default: { results: [] }
```

### Step 6: Fetch Confluence Page Contents
```yaml
tool: confluence.get_pages_batch
input:
  page_ids: "{{confluence_pages.results | map('id') | list}}"
  body_format: storage
output: confluence_content
condition: "{{confluence_pages.results | length > 0}}"
on_error:
  action: continue
  default: []
```

### Step 7: Analyze with LLM
```yaml
tool: llm.complete
prompt_file: prompts/analyze.md
model: default
input:
  jira: "{{jira_data}}"
  comments: "{{jira_comments}}"
  linked_issues: "{{linked_issues}}"
  confluence: "{{confluence_content}}"
  depth: "{{depth}}"
output: analysis
```

### Step 8: Generate Summary
```yaml
tool: llm.complete
prompt_file: prompts/summarize.md
model: default
input:
  analysis: "{{analysis}}"
  original_jira: "{{jira_data}}"
  user_context: "{{context.user_role}}"
output: final_summary
```

### Step 9: Store Results
```yaml
tool: database.upsert
input:
  table: jira_analyses
  key:
    jira_id: "{{jira_id}}"
  data:
    jira_id: "{{jira_id}}"
    summary: "{{final_summary}}"
    raw_analysis: "{{analysis}}"
    confluence_refs: "{{confluence_pages.results | map('id') | list}}"
    analyzed_at: "{{now()}}"
    analyzed_by: "{{context.user_id}}"
output: stored_record
```

## Output Schema

```json
{
  "jira_id": "string",
  "title": "string",
  "status": "string",
  "summary": {
    "one_liner": "string - Single sentence summary",
    "overview": "string - 2-3 paragraph detailed summary",
    "key_points": ["string - Array of bullet points"],
    "technical_details": "string - Technical context if applicable"
  },
  "analysis": {
    "problem_statement": "string",
    "business_impact": "string",
    "technical_context": "string",
    "complexity": "simple | medium | complex",
    "complexity_reasoning": "string"
  },
  "related_documents": [
    {
      "type": "confluence | jira",
      "id": "string",
      "title": "string",
      "relevance": "high | medium | low",
      "snippet": "string"
    }
  ],
  "linked_issues": [
    {
      "key": "string",
      "type": "blocks | is blocked by | relates to | etc",
      "summary": "string",
      "status": "string"
    }
  ],
  "timeline": [
    {
      "date": "ISO date string",
      "event": "string",
      "actor": "string"
    }
  ],
  "recommendations": ["string - Suggested next steps"],
  "metadata": {
    "analyzed_at": "ISO date string",
    "depth": "shallow | deep",
    "sources_consulted": ["string"]
  }
}
```

## UI Configuration

```yaml
display:
  type: card
  layout: sections

sections:
  - id: summary
    title: Summary
    icon: document-text
    expanded: true
    fields:
      - path: summary.one_liner
        type: text
        style: headline
      - path: summary.overview
        type: markdown
      - path: summary.key_points
        type: bullet-list

  - id: analysis
    title: Analysis
    icon: lightbulb
    expanded: false
    fields:
      - path: analysis.problem_statement
        label: Problem Statement
        type: text
      - path: analysis.business_impact
        label: Business Impact
        type: text
      - path: analysis.complexity
        label: Complexity
        type: badge
        color_map:
          simple: green
          medium: yellow
          complex: red

  - id: related
    title: Related Documents
    icon: link
    expanded: false
    fields:
      - path: related_documents
        type: list
        item_template: document-card

  - id: timeline
    title: Activity Timeline
    icon: clock
    expanded: false
    fields:
      - path: timeline
        type: timeline

actions:
  - id: copy
    label: Copy Summary
    icon: clipboard
    action: copy_to_clipboard
    data: summary.overview

  - id: share
    label: Share
    icon: share
    action: share_dialog

  - id: export
    label: Export PDF
    icon: download
    action: export_pdf

  - id: followup
    label: Create Follow-up
    icon: plus
    action: create_jira
    prefill:
      parent: "{{jira_id}}"
      description: "Follow-up from analysis: {{summary.one_liner}}"
```

## Examples

### Example 1: Basic Usage
**User**: "What is PROJ-1234 about?"

**Response**: Provides full analysis with summary, related docs, and recommendations.

### Example 2: Shallow Analysis
**User**: "Give me a quick summary of PROJ-5678"

**System detects**: shallow depth requested
**Response**: JIRA-only analysis without Confluence search.

### Example 3: Specific Focus
**User**: "Analyze PROJ-9999 and tell me who worked on it"

**Response**: Emphasizes timeline and contributor analysis.

## Error Handling

| Error | Behavior |
|-------|----------|
| JIRA not found | Return error with suggestion to check ticket ID |
| No Confluence access | Continue with JIRA-only analysis, note limitation |
| LLM timeout | Retry once, then return partial results |
| Rate limited | Queue for retry, notify user of delay |

## Changelog

### 1.0.0 (2024-01-15)
- Initial release
- Core JIRA analysis
- Confluence integration
- LLM summarization
