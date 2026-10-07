import { TaskRequest, TaskResponse } from '../hermes/schemas';

export abstract class BasePersona {
  constructor(public name: string) {}

  abstract handleTask(request: TaskRequest): Promise<TaskResponse>;
}
