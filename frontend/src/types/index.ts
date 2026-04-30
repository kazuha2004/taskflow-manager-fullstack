export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  admin: User;
  members: User[];
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  due_date: string;
  project_id: string;
  assigned_to: User;
  created_by: User;
  created_at: string;
}

export interface DashboardStats {
  total_tasks: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
}
