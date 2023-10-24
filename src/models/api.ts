import { Authorization } from "./authorization.js";
import { Path } from "./path.js";

export interface Api {
  paths: Array<Path>;
  authorizations: Array<Authorization>;
}
