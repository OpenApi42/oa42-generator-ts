import * as models from "../../models/index.js";
import { c, l, toCamel, toPascal } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

/**
 * This class generated methods for the server class that take a
 * `ServerIncomingRequest` and respond with a `ServerOutgoingRequest`. These
 * methods are basically a wrapper for the operation handlers. Authentication
 * is also triggered by these functions.
 */
export class ServerRouteHandleMethodsCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateAllMethods();
  }

  /**
   * all route handler functions
   */
  private *generateAllMethods() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateMethod(pathModel, operationModel);
      }
    }
  }

  /**
   * single function to handle a route
   * @param pathModel
   * @param operationModel
   */
  private *generateMethod(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const routeHandlerName = toCamel(operationModel.name, "route", "handler");

    yield c`
private ${routeHandlerName}(
  routeParameters: Record<string, string>,
  serverIncomingRequest: lib.ServerIncomingRequest,
): lib.ServerOutgoingResponse {
  ${this.generateMethodBody(pathModel, operationModel)}
}
`;
  }

  /**
   * function statements for route handler
   * @param pathModel
   * @param operationModel
   */
  private *generateMethodBody(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const operationHandlerName = toCamel(
      operationModel.name,
      "operation",
      "handler",
    );

    const requestParametersName = toPascal(
      operationModel.name,
      "request",
      "parameters",
    );

    const isRequestParametersName = toCamel(
      "is",
      operationModel.name,
      "request",
      "parameters",
    );

    const operationAuthenticationName = toPascal(
      operationModel.name,
      "authentication",
    );

    const isOperationAuthenticationName = toCamel(
      "is",
      operationModel.name,
      "authentication",
    );

    const authenticationNames = Array.from(
      new Set(
        operationModel.authenticationRequirements.flatMap((requirements) =>
          requirements.map((requirement) => requirement.authenticationName),
        ),
      ),
    );

    /**
     * now lets construct the incoming request object, this object will be
     * passed to the operation handler later
     */

    /**
     * read some headers
     */

    yield c`
const requestCookieHeader =
  lib.getParameterValue(serverIncomingRequest.headers, "cookie");
const requestAcceptHeader =
  lib.getParameterValue(serverIncomingRequest.headers, "accept");
const requestContentTypeHeader =
  lib.getParameterValue(serverIncomingRequest.headers, "content-type");
`;

    /**
     * now we put the raw parameters in variables, path parameters are already
     * present, they are in the methods arguments
     */

    yield c`
const requestQuery =
  lib.parseParameters(serverIncomingRequest.query, "&", "=");
const requestCookie =
  lib.parseParameters(requestCookieHeader ?? "", "; ", "=");

`;

    /**
     * let's handle authentication
     */

    yield c`
const authentication = {
  ${authenticationNames.map(
    (name) => c`
${toCamel(name)}: this.${toCamel(name, "authentication", "handler")}?.(""),
`,
  )}
}
if(!${isOperationAuthenticationName}(authentication)) {
  throw new lib.AuthenticationFailed();
}
`;

    /**
     * create the request parameters object
     */

    yield c`
const requestParameters = {
  ${[
    ...operationModel.pathParameters.map(
      (parameterModel) => c`
${toCamel(parameterModel.name)}: 
  lib.getParameterValue(routeParameters, ${l(parameterModel.name)}),
`,
    ),
    ...operationModel.headerParameters.map(
      (parameterModel) => c`
${toCamel(parameterModel.name)}: 
  lib.getParameterValue(serverIncomingRequest.headers, ${l(
    parameterModel.name,
  )}),
`,
    ),
    ...operationModel.queryParameters.map(
      (parameterModel) => c`
${toCamel(parameterModel.name)}: 
  lib.getParameterValue(requestQuery, ${l(parameterModel.name)}),
`,
    ),
    ...operationModel.cookieParameters.map(
      (parameterModel) => c`
${toCamel(parameterModel.name)}: 
  lib.getParameterValue(requestCookie, ${l(parameterModel.name)}),
`,
    ),
  ]}
}
if(!shared.${isRequestParametersName}(requestParameters)) {
  throw new lib.RequestParameterValidationFailed();
}

`;

    /**
     * now lets construct the incoming request object, this object will be
     * passed to the operation handler later
     */

    yield c`
const incomingOperationRequest = {
  parameters: requestParameters,
  contentType: null,
};
    `;

    /**
     * execute the operation handler and collect the response
     */

    yield c`
const outgoingOperationResponse =
  this.${operationHandlerName}?.(
    incomingOperationRequest,
    authentication,
  );
if (outgoingOperationResponse == null) {
  throw new lib.OperationNotImplemented();
}
  `;

    yield c`
switch(outgoingOperationResponse.status) {
  ${this.generateStatusCodeCaseClauses(operationModel)}
}
`;
  }

  private *generateStatusCodeCaseClauses(operationModel: models.Operation) {
    for (const operationResultModel of operationModel.operationResults) {
      const statusCodes = [...operationResultModel.statusCodes];
      let statusCode;
      while ((statusCode = statusCodes.shift()) != null) {
        yield c`
case ${l(statusCode)}:
`;
        // it's te last one!
        if (statusCodes.length === 0) {
          yield c`
{
  ${this.generateOperationResultBody(operationResultModel)}
}`;
        }
      }
    }

    yield c`
default:
  throw new lib.UnexpectedResponseStatusCode();
`;
  }

  private *generateOperationResultBody(
    operationResultModel: models.OperationResult,
  ) {
    yield c`
const responseHeaders = {};
`;

    for (const parameterModel of operationResultModel.headerParameters) {
      const parameterName = toCamel(parameterModel.name);

      const addParameterCode = c`
lib.addParameter(
  responseHeaders,
  ${l(parameterModel.name)},
  outgoingOperationResponse.parameters.${parameterName}.toString(),
);
`;

      if (parameterModel.required) {
        yield addParameterCode;
      } else {
        yield c`
if (outgoingOperationResponse.${parameterName} !== undefined) {
  ${addParameterCode}    
}
`;
      }
    }

    yield c`
const serverOutgoingResponse = {
  status: outgoingOperationResponse.status,
  headers: responseHeaders,
}    
    `;

    yield c`
return serverOutgoingResponse
`;
  }
}
