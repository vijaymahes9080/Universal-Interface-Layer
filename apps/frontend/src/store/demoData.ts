/**
 * Demo mode: serves realistic mock data when the UIL backend is unreachable.
 * Activated automatically in production (GitHub Pages) builds.
 */

import type { WorkspaceSummary, WorkspaceDetail, ExecutionLog } from './store'

// Vite replaces import.meta.env at build time; safe in both dev and prod
const env = (import.meta as any).env ?? {}
export const IS_DEMO_MODE: boolean =
  env.VITE_DEMO_MODE === 'true' || env.MODE === 'production'


export const DEMO_WORKSPACES: WorkspaceSummary[] = [
  {
    id: 'ws_demo_001',
    name: 'MCA Exam Preparation',
    prompt: 'Prepare study schedule, revision docs, and reminders for MCA exam next week.',
    status: 'completed',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    tasks_count: 5,
    completed_tasks: 5
  },
  {
    id: 'ws_demo_002',
    name: 'Startup Research & Deck',
    prompt: 'Launch my new SaaS startup concept with market research and pitch deck.',
    status: 'executing',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    tasks_count: 7,
    completed_tasks: 4
  },
  {
    id: 'ws_demo_003',
    name: 'GitHub Repo Health Audit',
    prompt: 'Audit the Universal Interface Layer GitHub repository and list all open issues.',
    status: 'completed',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    tasks_count: 3,
    completed_tasks: 3
  }
]

export const DEMO_WORKSPACE_DETAILS: Record<string, WorkspaceDetail> = {
  ws_demo_001: {
    ...DEMO_WORKSPACES[0],
    tasks: [
      {
        id: 'task_001_1', name: 'Parse MCA Exam Intent', description: 'Extract key revision topics from user prompt.', plugin: 'files', action: 'read_file',
        inputs: { path: 'mca_syllabus.pdf' }, outputs: { content: 'Data Structures, OS, DBMS, Networks...' },
        status: 'completed', dependencies: [], retry_count: 0
      },
      {
        id: 'task_001_2', name: 'Generate Study Schedule', description: 'Write a 7-day revision plan document.', plugin: 'files', action: 'write_file',
        inputs: { path: 'study_plan.md', content: '# Study Plan...' }, outputs: { success: true },
        status: 'completed', dependencies: ['task_001_1'], retry_count: 0
      },
      {
        id: 'task_001_3', name: 'Set Calendar Reminders', description: 'Schedule daily 3-hour revision blocks.', plugin: 'calendar', action: 'create_event',
        inputs: { title: 'MCA Revision', duration_minutes: 180 }, outputs: { event: 'created' },
        status: 'completed', dependencies: ['task_001_2'], retry_count: 0
      },
      {
        id: 'task_001_4', name: 'Query Past Exam Pattern', description: 'Search web for previous MCA exam papers.', plugin: 'web_intelligence', action: 'fetch_url',
        inputs: { url: 'https://example.com/mca-papers' }, outputs: { snippet: '2024 MCA Exam: Data Structures 30%...' },
        status: 'completed', dependencies: [], retry_count: 0
      },
      {
        id: 'task_001_5', name: 'Send Study Confirmation Email', description: 'Draft email confirmation of study plan.', plugin: 'email', action: 'draft_email',
        inputs: { to: 'self', subject: 'MCA Study Plan Ready', body: 'Your 7-day plan is ready!' }, outputs: { draft_id: 'draft_001' },
        status: 'completed', dependencies: ['task_001_2'], retry_count: 0
      }
    ],
    files: [
      { name: 'study_plan.md', path: 'workspaces/ws_demo_001/study_plan.md', size_bytes: 2048 }
    ]
  },
  ws_demo_002: {
    ...DEMO_WORKSPACES[1],
    tasks: [
      {
        id: 'task_002_1', name: 'Web Market Research', description: 'Scrape and summarize SaaS market reports.', plugin: 'web_intelligence', action: 'fetch_url',
        inputs: { url: 'https://example.com/saas-market' }, outputs: { snippet: 'SaaS market $300B by 2026...' },
        status: 'completed', dependencies: [], retry_count: 0
      },
      {
        id: 'task_002_2', name: 'GitHub Competitor Analysis', description: 'Review open-source competitors on GitHub.', plugin: 'github', action: 'get_repo_info',
        inputs: { repo: 'openai/openai-python' }, outputs: { stars: 28000, forks: 4100 },
        status: 'completed', dependencies: [], retry_count: 0
      },
      {
        id: 'task_002_3', name: 'Write Business Plan Doc', description: 'Generate structured startup plan document.', plugin: 'files', action: 'write_file',
        inputs: { path: 'business_plan.md' }, outputs: { success: true },
        status: 'completed', dependencies: ['task_002_1', 'task_002_2'], retry_count: 0
      },
      {
        id: 'task_002_4', name: 'System Resource Check', description: 'Verify dev machine capacity for build pipeline.', plugin: 'sys_monitor', action: 'get_system_stats',
        inputs: {}, outputs: { cpu_percent: 23.5, memory_percent: 61.4 },
        status: 'completed', dependencies: [], retry_count: 0
      },
      {
        id: 'task_002_5', name: 'Create Pitch Deck Slides', description: 'Generate PowerPoint slides outline.', plugin: 'files', action: 'write_file',
        inputs: { path: 'pitch_deck_outline.md' }, outputs: { success: true },
        status: 'executing', dependencies: ['task_002_3'], retry_count: 0
      },
      {
        id: 'task_002_6', name: 'Set Launch Task Milestones', description: 'Create task list for 60-day roadmap.', plugin: 'tasks', action: 'create_task',
        inputs: { title: 'Launch v1 MVP', priority: 'high' }, outputs: {},
        status: 'pending', dependencies: ['task_002_5'], retry_count: 0
      },
      {
        id: 'task_002_7', name: 'Email Stakeholder Summary', description: 'Send startup plan summary email.', plugin: 'email', action: 'draft_email',
        inputs: { to: 'team@startup.io', subject: 'Startup Plan Ready' }, outputs: {},
        status: 'pending', dependencies: ['task_002_5'], retry_count: 0
      }
    ],
    files: [
      { name: 'business_plan.md', path: 'workspaces/ws_demo_002/business_plan.md', size_bytes: 5120 },
      { name: 'pitch_deck_outline.md', path: 'workspaces/ws_demo_002/pitch_deck_outline.md', size_bytes: 1024 }
    ]
  },
  ws_demo_003: {
    ...DEMO_WORKSPACES[2],
    tasks: [
      {
        id: 'task_003_1', name: 'Fetch GitHub Repo Info', description: 'Retrieve UIL repository metadata and star count.', plugin: 'github', action: 'get_repo_info',
        inputs: { repo: 'vijaymahes9080/Universal-Interface-Layer' }, outputs: { name: 'vijaymahes9080/Universal-Interface-Layer', stars: 12, forks: 2, open_issues: 3 },
        status: 'completed', dependencies: [], retry_count: 0
      },
      {
        id: 'task_003_2', name: 'List Open Issues', description: 'Pull all open GitHub issues for triage.', plugin: 'github', action: 'list_issues',
        inputs: { repo: 'vijaymahes9080/Universal-Interface-Layer' }, outputs: { issues: [{ id: 1, title: 'Add more plugins', state: 'open' }] },
        status: 'completed', dependencies: ['task_003_1'], retry_count: 0
      },
      {
        id: 'task_003_3', name: 'Write Audit Report', description: 'Write repository health audit markdown file.', plugin: 'files', action: 'write_file',
        inputs: { path: 'audit_report.md', content: '# UIL Repo Audit\n...' }, outputs: { success: true },
        status: 'completed', dependencies: ['task_003_2'], retry_count: 0
      }
    ],
    files: [
      { name: 'audit_report.md', path: 'workspaces/ws_demo_003/audit_report.md', size_bytes: 768 }
    ]
  }
}

export const DEMO_LOGS: ExecutionLog[] = [
  { timestamp: '07:18:32', type: 'info', workspace_id: 'ws_demo_001', message: 'Workspace "MCA Exam Preparation" completed successfully.' },
  { timestamp: '07:18:30', type: 'task_complete', task_id: 'task_001_5', message: 'Email draft sent to inbox.' },
  { timestamp: '07:18:20', type: 'task_complete', task_id: 'task_001_3', message: 'Calendar reminders scheduled for 7 days.' },
  { timestamp: '07:18:10', type: 'task_running', workspace_id: 'ws_demo_002', message: 'Executing: Create Pitch Deck Slides...' },
  { timestamp: '07:17:55', type: 'info', message: 'Consensus Engine: Plan approved. Risk Score: 0/100.' },
  { timestamp: '07:17:40', type: 'task_complete', task_id: 'task_002_4', message: 'System stats: CPU 23.5%, RAM 61.4%' },
]

export const DEMO_PLUGINS = [
  { id: 'github', name: 'GitHub DevOps Integrator', description: 'Fetches repositories, issues, and commit details.', commands: ['get_repo_info', 'list_issues', 'search_commits'], manifest: {} },
  { id: 'sql_analytics', name: 'SQL Analytics & Database Engine', description: 'Runs read-only SQL queries and reflects SQLite schemas.', commands: ['query_database', 'describe_schema'], manifest: {} },
  { id: 'web_intelligence', name: 'Web Intelligence & Extractor', description: 'Fetches web URLs and converts HTML to Markdown.', commands: ['fetch_url', 'extract_text'], manifest: {} },
  { id: 'sys_monitor', name: 'System Telemetry & Performance Monitor', description: 'Monitors CPU, Memory, Disk and process statistics.', commands: ['get_system_stats', 'list_processes'], manifest: {} },
  { id: 'files', name: 'Workspace File Operator', description: 'Reads and writes files in the sandboxed workspace folder.', commands: ['write_file', 'read_file'], manifest: {} },
  { id: 'calendar', name: 'Calendar Manager', description: 'Schedules study sessions, meetings, and dates.', commands: ['create_event', 'list_events'], manifest: {} },
  { id: 'email', name: 'Email Integrator', description: 'Drafts notifications and alerts.', commands: ['draft_email', 'send_email'], manifest: {} },
  { id: 'terminal', name: 'Sandboxed Command Terminal', description: 'Executes allowed terminal operations in workspace subfolders.', commands: ['run_command'], manifest: {} },
  { id: 'tasks', name: 'Tasks Tracker', description: 'Manages to-do items and completion states.', commands: ['create_task', 'complete_task'], manifest: {} },
  { id: 'browser', name: 'Web Browser Simulator', description: 'Searches the web, extracts page content, and crawls URLs.', commands: ['search_web', 'read_page'], manifest: {} },
]
