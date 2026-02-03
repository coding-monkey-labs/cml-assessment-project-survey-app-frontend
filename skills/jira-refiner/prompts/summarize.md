# Summary Generation Prompt

You are creating a human-friendly summary of a JIRA ticket analysis. Your goal is to make complex technical information accessible while preserving important details.

## Analysis Results

```json
{{analysis | tojson(indent=2)}}
```

## Original JIRA Data

- **Ticket**: {{original_jira.key}}
- **Title**: {{original_jira.fields.summary}}
- **Status**: {{original_jira.fields.status.name}}
- **Priority**: {{original_jira.fields.priority.name}}
- **Assignee**: {{original_jira.fields.assignee.displayName | default("Unassigned")}}
- **Reporter**: {{original_jira.fields.reporter.displayName}}
- **Created**: {{original_jira.fields.created}}
- **Updated**: {{original_jira.fields.updated}}

{{#if user_context}}
## User Context
The person requesting this summary is: {{user_context}}
Tailor the summary appropriately for their role.
{{/if}}

---

## Your Task

Create a comprehensive yet readable summary with the following sections:

### 1. One-Liner
A single sentence (max 20 words) that captures the essence of this ticket.
- Should be understandable by anyone
- Focus on the "what" not the "how"

### 2. Overview
A 2-3 paragraph summary that includes:
- What the ticket is about
- Why it matters
- Current status and what's needed

Write in clear, professional prose. Avoid bullet points in this section.

### 3. Key Points
5-8 bullet points highlighting the most important aspects:
- Mix of technical and business points
- Each point should be actionable or informative
- Prioritize by importance

### 4. Technical Details (if applicable)
A brief section for technical readers:
- Systems involved
- Technical approach (if known)
- Potential challenges

### 5. Recommendations
3-5 actionable next steps:
- What should happen next?
- Who should be involved?
- What questions need answers?

---

## Output Format

```json
{
  "one_liner": "string - Single sentence summary",
  "overview": "string - 2-3 paragraphs in markdown format",
  "key_points": [
    "string - Important point 1",
    "string - Important point 2"
  ],
  "technical_details": "string - Technical summary in markdown (or null if not applicable)",
  "recommendations": [
    {
      "action": "string - What to do",
      "owner": "string - Who should do it (role or specific person)",
      "priority": "high | medium | low"
    }
  ],
  "tags": ["string - Relevant tags/categories"],
  "confidence_score": 0.0-1.0
}
```

## Guidelines

1. **Clarity over completeness**: It's better to be clear about less than confusing about more
2. **Active voice**: "The team should review..." not "It should be reviewed..."
3. **Specific over vague**: "Update the payment service API" not "Make some changes"
4. **Honest about unknowns**: If information is missing, say so
5. **Balanced perspective**: Include both opportunities and risks

## Confidence Score

Rate your confidence in this summary from 0.0 to 1.0 based on:
- Completeness of source information
- Clarity of the original ticket
- Amount of context available
- Consistency of information across sources

Examples:
- 0.9+: Clear ticket, good comments, related docs available
- 0.7-0.9: Good ticket but some gaps in context
- 0.5-0.7: Sparse ticket, limited information
- <0.5: Very unclear ticket, contradictory information
