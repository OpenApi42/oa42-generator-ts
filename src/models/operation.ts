import { Method } from "../utils/index.js";
import { Parameters } from "./parameters.js";

export interface Operation {
  method: Method;
  name: string;
  queryParameters: Parameters[];
  headerParameters: Parameters[];
  pathParameters: Parameters[];
  cookieParameters: Parameters[];
}
