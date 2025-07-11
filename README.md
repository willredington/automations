# Automations Project

This project syncs tasks from Jira and Figma into a Notion database, using AI to determine actionable items and generate tags. Infrastructure is managed with AWS CDK.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)

## Setup

1. **Install dependencies**

   ```sh
   npm install
   ```

2. **Configure AWS CLI**

   - Install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
   - Configure credentials:
     ```sh
     aws configure
     ```
   - Ensure your user has permissions to deploy CDK stacks (CloudFormation, IAM, Lambda, etc).

3. **Install AWS CDK**

   ```sh
   npm install -g aws-cdk
   ```

   - Bootstrap your environment (only needed once per AWS account/region):
     ```sh
     cdk bootstrap
     ```

4. **Set Up Integrations & Environment Variables**

   - Copy `.env.example` to `.env` and fill in all required values:
     ```sh
     cp apps/infrastructure/.env.example apps/infrastructure/.env
     ```

   ### Notion Setup

   1. **Create a Notion Database**: In your Notion workspace, create a new database (table).
   2. **Create a Notion Integration**: Go to [Notion Integrations](https://www.notion.so/my-integrations), create a new integration, and save the generated API token (`NOTION_API_TOKEN`).
   3. **Share Database with Integration**: In Notion, open your database, click "Share", and invite your integration to access the database.
   4. **Get Database ID**: Copy the database ID from the URL and set it as `NOTION_DB_ID`.

   ### Jira Setup

   1. **Create a Jira API Token**: Go to [Jira API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens), create a new token, and save it as `RVO_JIRA_API_TOKEN`.
   2. **Get Jira Email**: Use your Atlassian/Jira account email as `RVO_JIRA_EMAIL`.
   3. **Get Jira API URL**: Use your Jira instance's base API URL (e.g., `https://your-domain.atlassian.net/rest/api/3`) as `RVO_JIRA_API_URL`.

   ### Figma Setup

   1. **Create a Figma Personal Access Token**: Go to [Figma Settings](https://www.figma.com/developers/api#access-tokens), generate a new token, and save it as `FIGMA_API_TOKEN`.
   2. **Get Figma Username**: Use your Figma username as `FIGMA_USERNAME` (for @mention detection).

   ### Anthropic (AI) Setup

   1. **Get an Anthropic API Key**: Sign up at [Anthropic Console](https://console.anthropic.com/) and generate an API key. Set it as `ANTHROPIC_API_KEY`.

   - Required variables:
     - `NOTION_DB_ID`: Notion database ID
     - `NOTION_API_TOKEN`: Notion integration token
     - `RVO_JIRA_EMAIL`: Jira user email
     - `RVO_JIRA_API_URL`: Jira API base URL
     - `RVO_JIRA_API_TOKEN`: Jira API token
     - `FIGMA_API_TOKEN`: Figma API token
     - `FIGMA_USERNAME`: Your Figma username (for @mentions)
     - `ANTHROPIC_API_KEY`: API key for AI (Anthropic)

5. **Deploy the Infrastructure**
   ```sh
   cd apps/infrastructure
   cdk deploy
   ```
   - This will deploy the AWS resources defined in the CDK stack.

## Usage

Once deployed and environment variables are set, the automation will sync Jira issues and actionable Figma comments to Notion, using AI to determine tasks and generate tags as needed.
