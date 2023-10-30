import { Authentication } from "./authentication.js";
import { Path } from "./path.js";

export interface Api {
  paths: Array<Path>;
  authentication: Array<Authentication>;
}
