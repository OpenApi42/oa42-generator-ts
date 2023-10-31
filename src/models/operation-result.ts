import { StatusCode } from "@oa42/oa42-lib";
import { Parameter } from "./parameter.js";

export interface OperationResult {
  uri: URL;
  statusKind: string;
  statusCodes: StatusCode[];
  headerParameters: Parameter[];
}
