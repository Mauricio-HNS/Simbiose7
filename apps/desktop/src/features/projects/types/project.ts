export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  repository?: string;
  environments: string[];
  integrations: string[];
}

export type ProjectSection =
  | "overview"
  | "architecture"
  | "code"
  | "data"
  | "apis"
  | "ai"
  | "agents"
  | "knowledge"
  | "cloud"
  | "mcp"
  | "automation"
  | "observability";
