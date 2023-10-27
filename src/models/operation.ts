import { Method } from "../utils/index.js";
import { AuthenticationRequirement } from "./authentication-requirement.js";
import { Parameters } from "./parameters.js";

export interface Operation {
  method: Method;
  name: string;
  queryParameters: Parameters[];
  headerParameters: Parameters[];
  pathParameters: Parameters[];
  cookieParameters: Parameters[];
  /**
   * all authentications from the second level should pass, any authentications
   * of the first level should pass
   */
  authenticationRequirements: AuthenticationRequirement[][];
}
