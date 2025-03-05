import { AxiosResponse } from 'axios';
export type ThenArgs<T> = T extends Promise<infer U> ? U : T;
export type AxiosArgs<T> = T extends AxiosResponse<infer U> ? U : undefined;

export type ApiResponse<T> = AxiosArgs<ThenArgs<AxiosResponse<T>>>;

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type EventData =
  | { type: 'text'; content: string }
  | { type: 'tool'; data: ToolEvent }
  | { type: 'state'; data: { status: ChatStatusState } };

export type ToolType = 'search_controls' | 'search_web' | 'math_evaluator' | 'assessment';

export interface ToolEvent {
  id: string;
  isDone: boolean;
  tool: ToolType;
}

export type ChatStatusState = 'idle' | 'initializing' | 'working' | 'finalising';
