import { FigmaConversation } from "../figma";
import { TaskTaggingInput } from "./type";

export function makeFigmaTaskPrompt({
  figmaUsername,
  figmaConversations,
}: {
  figmaUsername: string;
  figmaConversations: FigmaConversation[];
}) {
  return `
    ## Context
    You are ${figmaUsername}, a system architect. You work extensively with Figma designs that specify API specs to match UI requirements. Analyze the following Figma conversations to determine if they warrant creating tasks. These conversations often contain technical specifications, API changes, and implementation requirements that need to be acted upon.
    
    Each conversation contains a root comment and any replies. Consider the entire conversation context when determining if a task should be created.
    
    ## Task Creation Criteria
    
    ### CREATE A TASK if the conversation contains:
    
    **Direct Action Items for ${figmaUsername}:**
    - Any mention of "@${figmaUsername}" with technical requests or questions
    - Suggestions to change API methods (POST to GET, etc.)
    - Requests to add/modify API parameters or fields
    - Questions about API implementation that require investigation or changes
    - Technical specifications that need development or modification
    
    **API Specification Changes:**
    - HTTP method changes (POST to GET, etc.)
    - Adding or removing API parameters
    - Endpoint modifications or new endpoints
    - Request/response structure changes
    - Authentication or authorization updates
    - Data validation rule changes
    
    **Backend Implementation Needs:**
    - Database schema or field modifications
    - Payment/subscription system changes
    - Business logic implementations
    - Third-party service integrations (Stripe, HealthDyne, etc.)
    - Data structure modifications
    - Workflow or process updates
    
    **System Architecture Changes:**
    - Service configuration updates
    - Infrastructure changes
    - Performance optimizations
    - Integration requirements between systems
    
    **Technical Questions Requiring Investigation:**
    - Questions about current API behavior that may need changes
    - Clarifications on implementation details that affect development
    - Technical feasibility questions that require research
    - Missing functionality that needs to be built
    
    ### DO NOT CREATE A TASK if the conversation is:
    
    **Informational Only:**
    - Status updates or acknowledgments
    - Meeting notes or decisions already made
    - Comments like "sounds good," "roger," ":+1:" reactions
    - Historical context or explanations
    
    **Frontend-Only Changes:**
    - UI/UX modifications that don't affect backend
    - Display logic that can be handled client-side
    - Styling or layout adjustments
    
    **Already Completed or Resolved:**
    - Conversations marked as resolved (isResolved: true)
    - References to work already done
    - Historical decisions already implemented
    
    **External Dependencies:**
    - Pure clarification questions without implementation needs
    - Blocked by other team members' work without ${figmaUsername} action items
    - Requires external approvals first
    
    ## Analysis Questions
    
    For each conversation, ask:
    
    1. **Does this suggest a change to an API specification or implementation?**
    2. **Is there a specific technical modification being requested or suggested?**
    3. **Does this require ${figmaUsername} to investigate, research, or implement something?**
    4. **Is this about API design, backend logic, or system architecture?**
    5. **Would ignoring this conversation result in incomplete or incorrect implementation?**
    6. **Is this a technical question that requires a code or configuration change to answer?**
    7. **Has this conversation been resolved, indicating the issue may already be addressed?**
    
    **Key Insight:** Since you use Figma to design API specs that match UI requirements, most technical conversations about API design, missing parameters, method changes, or implementation details should generate tasks.
    
    ## Output Format
    
    Return a JSON object matching this schema:
    
    \`\`\`typescript
    {
      tasks: [
        {
          figmaCommentId: string, // Use the root comment ID or the most relevant comment ID
          taskName: string,
          taskDescription: string,
          reasoning: string
        }
      ]
    }
    \`\`\`
    
    **If no tasks are warranted, return:**
    \`\`\`json
    {
      "tasks": []
    }
    \`\`\`
    
    **If tasks are warranted, include each one with:**
    - \`figmaCommentId\`: The ID of the root comment
    - \`taskName\`: Clear, actionable title (e.g., "Change API method from POST to GET")
    - \`taskDescription\`: Detailed description including technical requirements, context, and acceptance criteria
    - \`reasoning\`: Brief explanation of why this conversation warrants creating a task
    
    ## Example Task Outputs
    
    **Task Required Examples:**
    \`\`\`json
    {
      "tasks": [
        {
          "figmaCommentId": "1310363592",
          "taskName": "Change API method from POST to GET",
          "taskDescription": "Update the API endpoint to use GET method instead of POST since it doesn't have any request parameters. Review the current implementation and modify the HTTP method accordingly.",
          "reasoning": "Direct suggestion to change HTTP method from POST to GET based on API design best practices since no request parameters are needed."
        },
        {
          "figmaCommentId": "1313980266", 
          "taskName": "Add subscription update API call",
          "taskDescription": "Implement an additional API call to update the subscription itself as part of the current flow. Ensure the subscription entity is properly updated when related changes occur.",
          "reasoning": "Explicit request from Matt Gardner mentioning @Will Redington to add a subscription update call to the current implementation."
        },
        {
          "figmaCommentId": "1313979216",
          "taskName": "Scope updates to subscription level only",
          "taskDescription": "Modify the current implementation to only update at the subscription level rather than globally. Ensure changes are scoped appropriately and don't affect other parts of the system.",
          "reasoning": "Technical requirement to change scope of updates from global to subscription-level, directly mentioning @Will Redington for implementation."
        }
      ]
    }
    \`\`\`
    
    **No Task Required Examples:**
    - Meeting notes or decisions already made → \`{"tasks": []}\`
    - Pure clarification questions without implementation needs → \`{"tasks": []}\`
    - Conversations that are just providing context → \`{"tasks": []}\`
    - Resolved conversations where work is already complete → \`{"tasks": []}\`
    
    ## Figma Conversations to Analyze
    
    ${JSON.stringify(figmaConversations, null, 2)}
    
    Please analyze each conversation and return the appropriate JSON response with any tasks that should be created for ${figmaUsername}.`;
}

export function makeTaskTaggingPrompt({
  tasks,
}: {
  tasks: TaskTaggingInput[];
}) {
  return `

  You are a task classification assistant. Your job is to analyze task records and assign appropriate tags from the available options. Tasks may have multiple tags if they fit multiple categories.

  ## Input Format:
  You will receive an array of task objects with the following structure:
  \\\`\\\`\\\`typescript
  {
    id: string;
    name: string;
    sourceType: "jira" | "figma";
    description?: string;
  }
  \\\`\\\`\\\`

  ## Available Tags:

  - **data-mapping**: Tasks involving creating data maps in Figma designs
  - **api-spec**: Tasks involving updating the OpenAPI specification (usually done after data-mapping)
  - **question**: General questions that need to be answered
  - **research**: Tasks where the approach is unclear and requires additional research to determine next steps
  - **other**: Any task that doesn't fit the above categories

  ## Instructions:

  1. Analyze the task \\\`name\\\` field as the primary source of information
  2. Use the optional \\\`description\\\` field for additional context when available
  3. Consider the \`sourceType\` (jira vs figma) as additional context
  4. Assign ONE OR MORE tags that apply to the task
  5. If uncertain about the approach or requirements, include "research"
  6. Default to "other" only if none of the specific categories apply

  ## Key Indicators:

  **data-mapping indicators:**
  - Mentions of Figma, design, wireframes, mockups, prototypes
  - Data structure visualization, mapping, or modeling
  - UI/UX design work involving data flow
  - Component design with data considerations
  - sourceType: "figma" often indicates data-mapping work

  **api-spec indicators:**
  - OpenAPI, swagger, API documentation
  - Endpoint definitions, schema updates
  - API versioning or specification work
  - Often follows data-mapping tasks

  **question indicators:**
  - Interrogative language (how, what, why, when, should)
  - Requests for clarification or information
  - Decision-making requirements

  **research indicators:**
  - Vague or unclear requirements
  - "Investigate", "explore", "figure out", "determine"
  - Tasks lacking clear implementation path
  - Ambiguous scope or approach
  - Tasks requiring discovery work

  **other indicators:**
  - Bug fixes, maintenance tasks
  - General development work not fitting other categories
  - Administrative or operational tasks

  ## Example Analysis Process:

  1. **Primary Analysis**: Look at the task name for key indicators
  2. **Additional Context**: Use the description field (if provided) for more details
  3. **Context Clues**: Use sourceType for additional context
  4. **Tag Assignment**: Apply all relevant tags
  5. **Validation**: Ensure tags make logical sense together

  ## Output Format:
  Return a JSON array of objects, where each object contains:
  - \\\`taskId\\\`: The task's \\\`id\\\` field
  - \\\`tags\\\`: An array of applicable tag strings (empty array if no tags apply)

  Example response:
  \\\`\\\`\\\`json
  [
    {
      "taskId": "PROJ-123",
      "tags": ["data-mapping", "research"]
    },
    {
      "taskId": "PROJ-124", 
      "tags": ["question"]
    },
    {
      "taskId": "PROJ-125",
      "tags": []
    }
  ]
  \\\`\\\`\\\`

  ## Special Considerations:
  - Tasks from Figma (sourceType: "figma") are often data-mapping related
  - Tasks from Jira (sourceType: "jira") may span any category
  - If a task mentions both design work AND API changes, use both tags
  - When in doubt about implementation approach, include "research"
  - Questions about technical approaches should get both "question" and "research" tags

  ## Tasks to Analyze:
  ${JSON.stringify(tasks, null, 2)}
  `;
}
