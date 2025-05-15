// IPC Response type
export interface IPCResponse<T = any> {
  code: number;
  msg?: string;
  data?: T;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewUser {
  username: string;
  email: string;
}