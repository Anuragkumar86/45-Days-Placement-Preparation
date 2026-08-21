import { Request } from 'express';

// 1. Define your interface
export interface CustomUser {
  email: string;
  name: string;
}

// 2. Target the express module directly
declare module 'express' {
  interface Request {
    user?: CustomUser;
  }
}
