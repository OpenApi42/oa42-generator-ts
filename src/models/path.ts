import { Method } from "../utils/index.js";
import { Operation } from "./operation.js";

export interface Path {
  pattern: string;
  operations: Record<Method, Operation>;
}
