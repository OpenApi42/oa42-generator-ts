import { Status } from "@oa42/oa42-lib";
import { Parameters } from "./parameters.js";

export interface OperationResult {
  status: Status[];
  headerParameters: Parameters[];
}
