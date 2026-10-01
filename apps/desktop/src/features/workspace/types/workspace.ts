export interface Workspace {
  id: string;
  name: string;
  description?: string;
  projects: string[];
}

export interface WorkspaceNavigationItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
}
