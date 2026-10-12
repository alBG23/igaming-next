export interface TaskRequest {
  taskId: string;
  assignedTo: string;
  payload: Record<string, any>;
}

export interface TaskResponse {
  taskId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  result: Record<string, any>;
  error?: string;
}
