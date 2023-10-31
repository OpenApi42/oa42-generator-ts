import { Operation } from "./operation.js";

export interface Path {
  uri: URL;
  pattern: string;
  operations: Operation[];
}
