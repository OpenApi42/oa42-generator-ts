import { Operation } from "./operation.js";

export interface Path {
  pattern: string;
  operations: Operation[];
}
