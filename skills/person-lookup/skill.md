# Person Lookup

## Metadata
- **ID**: person-lookup
- **Version**: 1.0.0
- **Author**: System
- **Category**: People
- **Icon**: user
- **Tags**: people, workday, directory, org-chart

## Description
Finds detailed information about a person across multiple enterprise systems
including Workday, Active Directory, JIRA activity, and Confluence contributions.

Use this skill to:
- Find contact information for colleagues
- Understand someone's role and team
- See their recent activity and contributions
- Find their manager or direct reports

## Triggers

```yaml
patterns:
  - "find {person_name}"
  - "who is {person_name}"
  - "tell me about {person_name}"
  - "lookup {person_name}"
  - "search for {person_name}"
  - "find details about {person_name}"
  - "{person_name} contact"
  - "{person_name} info"
  - "what team is {person_name} on"
```

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| person_name | string | Yes | - | Name or email of the person to find |
| include_activity | boolean | No | true | Include JIRA/Confluence activity |
| include_org_chart | boolean | No | true | Include manager and direct reports |

## Workflow Steps

### Step 1: Search Workday
```yaml
tool: workday.search_employees
input:
  query: "{{person_name}}"
  fields:
    - name
    - email
    - title
    - department
    - manager
    - location
    - phone
    - hire_date
output: workday_results
on_error:
  action: continue
  default: { employees: [] }
```

### Step 2: Disambiguate if Multiple Results
```yaml
action: conditional
condition: "{{workday_results.employees | length > 1}}"
then:
  tool: llm.select
  prompt: |
    Multiple people match "{{person_name}}".
    Based on context, select the most likely match:
    {{workday_results.employees | tojson}}
  output: selected_person
else:
  action: set
  value: "{{workday_results.employees[0]}}"
  output: selected_person
```

### Step 3: Get Org Chart Data
```yaml
tool: workday.get_org_chart
input:
  employee_id: "{{selected_person.id}}"
  levels_up: 2
  levels_down: 1
output: org_chart
condition: "{{include_org_chart}}"
on_error:
  action: continue
  default: null
```

### Step 4: Get JIRA Activity
```yaml
tool: jira.search
input:
  jql: "assignee = '{{selected_person.email}}' OR reporter = '{{selected_person.email}}' ORDER BY updated DESC"
  max_results: 20
output: jira_activity
condition: "{{include_activity}}"
on_error:
  action: continue
  default: { issues: [] }
```

### Step 5: Get Confluence Activity
```yaml
tool: confluence.search
input:
  cql: "contributor = '{{selected_person.email}}' ORDER BY lastmodified DESC"
  limit: 10
output: confluence_activity
condition: "{{include_activity}}"
on_error:
  action: continue
  default: { results: [] }
```

### Step 6: Compile Profile
```yaml
tool: llm.complete
prompt_file: prompts/compile_profile.md
input:
  workday: "{{selected_person}}"
  org_chart: "{{org_chart}}"
  jira: "{{jira_activity}}"
  confluence: "{{confluence_activity}}"
output: profile
```

## Output Schema

```json
{
  "person": {
    "name": "string",
    "email": "string",
    "title": "string",
    "department": "string",
    "location": "string",
    "phone": "string",
    "hire_date": "string",
    "photo_url": "string"
  },
  "organization": {
    "manager": {
      "name": "string",
      "title": "string",
      "email": "string"
    },
    "direct_reports": [
      {
        "name": "string",
        "title": "string"
      }
    ],
    "team": "string",
    "org_path": ["string - Path from CEO to person"]
  },
  "activity": {
    "recent_jira": [
      {
        "key": "string",
        "summary": "string",
        "role": "assignee | reporter",
        "status": "string",
        "updated": "date"
      }
    ],
    "recent_confluence": [
      {
        "title": "string",
        "space": "string",
        "modified": "date"
      }
    ],
    "activity_summary": "string - Brief description of what they've been working on"
  },
  "contact_methods": [
    {
      "type": "email | phone | slack | teams",
      "value": "string",
      "preferred": "boolean"
    }
  ]
}
```

## UI Configuration

```yaml
display:
  type: profile-card
  layout: two-column

sections:
  - id: header
    type: profile-header
    fields:
      - path: person.photo_url
        type: avatar
        size: large
      - path: person.name
        type: text
        style: headline
      - path: person.title
        type: text
        style: subtitle
      - path: person.department
        type: badge

  - id: contact
    title: Contact
    icon: phone
    fields:
      - path: person.email
        type: email-link
      - path: person.phone
        type: phone-link
      - path: person.location
        type: text
        icon: map-pin

  - id: org
    title: Organization
    icon: sitemap
    fields:
      - path: organization
        type: mini-org-chart

  - id: activity
    title: Recent Activity
    icon: activity
    fields:
      - path: activity.activity_summary
        type: text
      - path: activity.recent_jira
        type: list
        max_items: 5

actions:
  - id: email
    label: Send Email
    icon: mail
    action: mailto
    data: "{{person.email}}"

  - id: slack
    label: Message on Slack
    icon: message-circle
    action: open_url
    data: "slack://user?team=TEAM_ID&id={{person.slack_id}}"

  - id: calendar
    label: Schedule Meeting
    icon: calendar
    action: open_url
    data: "https://outlook.office.com/calendar/compose?to={{person.email}}"
```

## Examples

### Example 1: Basic Lookup
**User**: "Who is John Smith?"

**Response**: Full profile with contact info, org chart, and recent activity.

### Example 2: Contact Only
**User**: "What is Sarah's email?"

**Response**: Quick contact card with email highlighted.

### Example 3: Team Context
**User**: "What team is Mike on and who does he report to?"

**Response**: Org-focused view showing manager and team structure.

## Error Handling

| Error | Behavior |
|-------|----------|
| Person not found | Suggest similar names or ask for clarification |
| Multiple matches | Show disambiguation list |
| Workday unavailable | Fallback to Active Directory |
| Activity fetch fails | Return profile without activity section |
