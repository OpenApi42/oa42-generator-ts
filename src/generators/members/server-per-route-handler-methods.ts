import * as models from "../../models/index.js";
import { c, l, toCamel, toPascal } from "../../utils/index.js";

/**
 * This class generated methods for the server class that take a
 * `ServerIncomingRequest` and respond with a `ServerOutgoingRequest`. These
 * methods are basically a wrapper for the operation handlers. Authentication
 * is also triggered by these functions.
 */
export function* generateServerRouteHandleMethodsCode(apiModel: models.Api) {
  yield* generateAllMethods(apiModel);
}

/**
 * all route handler functions
 */
function* generateAllMethods(apiModel: models.Api) {
  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      yield* generateMethod(pathModel, operationModel);
    }
  }
}

/**
 * single function to handle a route
 * @param pathModel
 * @param operationModel
 */
function* generateMethod(
  pathModel: models.Path,
  operationModel: models.Operation,
) {
  const routeHandlerName = toCamel(operationModel.name, "route", "handler");

  yield c`
    private ${routeHandlerName}(
      routeParameters: Record<string, string>,
      serverIncomingRequest: lib.ServerIncomingRequest,
    ): lib.ServerOutgoingResponse {
      ${generateMethodBody(pathModel, operationModel)}
    }
  `;
}

/**
 * function statements for route handler
 * @param pathModel
 * @param operationModel
 */
function* generateMethodBody(
  pathModel: models.Path,
  operationModel: models.Operation,
) {
  const operationHandlerName = toCamel(
    operationModel.name,
    "operation",
    "handler",
  );

  const operationIncomingRequestName = toPascal(
    operationModel.name,
    "incoming",
    "request",
  );

  const operationOutgoingResponseName = toPascal(
    operationModel.name,
    "outgoing",
    "response",
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
    let incomingOperationRequest: ${operationIncomingRequestName};
  `;

  if (operationModel.bodies.length === 0) {
    yield* generateRequestContentTypeCodeBody();
  } else {
    yield c`
      if(requestContentTypeHeader == null) {
        throw new lib.MissingRequestContentType();
      }

      switch(requestContentTypeHeader) {
        ${generateRequestContentTypeCodeCaseClauses(operationModel)};
      }
    `;
  }

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
    let serverOutgoingResponse: lib.ServerOutgoingResponse ;
    switch(outgoingOperationResponse.status) {
      ${generateStatusCodeCaseClauses(operationModel)}
    }
  `;

  yield c`
    return serverOutgoingResponse
  `;
}

function* generateRequestContentTypeCodeCaseClauses(
  operationModel: models.Operation,
) {
  for (const bodyModel of operationModel.bodies) {
    yield c`
      case ${l(bodyModel.contentType)}:
      {
        ${generateRequestContentTypeCodeBody(bodyModel)}
        break;
      }
    `;
  }
  yield c`
    default:
      throw new lib.UnexpectedRequestContentType();
  `;
}

function* generateRequestContentTypeCodeBody(bodyModel?: models.Body) {
  if (bodyModel == null) {
    yield c`
      incomingOperationRequest = {
        parameters: requestParameters,
        contentType: null,
      };
    `;
    return;
  }

  switch (bodyModel.contentType) {
    case "text/plain":
      yield c`
        incomingOperationRequest = {
          parameters: requestParameters,
          contentType: requestContentTypeHeader,
          async *stream(signal) {
            yield* incomingOperationRequest.stream(signal);
          },
          async *lines(signal) {
            throw new Error("TODO");
          },
          async value() {
            throw new Error("TODO");
          },
        };
      `;
      break;

    case "application/json":
      yield c`
        incomingOperationRequest = {
          parameters: requestParameters,
          contentType: requestContentTypeHeader,
          async *stream(signal) {
            yield* incomingOperationRequest.stream(signal);
          },
          async *entities(signal) {
            throw new Error("TODO");
          },
          async entity() {
            throw new Error("TODO");
          },
        };
      `;
      break;

    default:
      yield c`
        incomingOperationRequest = {
          parameters: requestParameters,
          contentType: requestContentTypeHeader,
          async *stream(signal) {
            yield* incomingOperationRequest.stream(signal);
          },
        };
      `;
  }
}

function* generateStatusCodeCaseClauses(operationModel: models.Operation) {
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
            ${generateOperationResultBody(operationResultModel)}
            break;
          }
        `;
      }
    }
  }

  yield c`
    default:
      throw new lib.UnexpectedResponseStatusCode();
  `;
}

function* generateOperationResultBody(
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
        if (outgoingOperationResponse.parameters.${parameterName} !== undefined) {
          ${addParameterCode}    
        }
      `;
    }
  }
  if (operationResultModel.bodies.length === 0) {
    yield* generateOperationResultContentTypeBody();
    return;
  } else {
    yield c`
      switch(outgoingOperationResponse.contentType) {
        ${generateOperationResultContentTypeCaseClauses(operationResultModel)}
      }
    `;
  }
}

function* generateOperationResultContentTypeCaseClauses(
  operationResultModel: models.OperationResult,
) {
  for (const bodyModel of operationResultModel.bodies) {
    yield c`
      case ${l(bodyModel.contentType)}:
      {
        ${generateOperationResultContentTypeBody(bodyModel)}
        break;
      }
    `;
  }

  yield c`
    default:
      throw new Error("unexpected content-type");       
  `;
}

export function* generateOperationResultContentTypeBody(
  bodyModel?: models.Body,
) {
  if (bodyModel == null) {
    yield c`
      serverOutgoingResponse = {
        status: outgoingOperationResponse.status,
        headers: responseHeaders,
      }    
    `;
    return;
  }

  switch (bodyModel.contentType) {
    case "text/plain":
      yield c`
        lib.addParameter(responseHeaders, "content-type", outgoingOperationResponse.contentType);
        serverOutgoingResponse = {
          status: outgoingOperationResponse.status,
          headers: responseHeaders,
          async *stream(signal) {
            throw new Error("TODO");
          },
        }
      `;
      break;

    case "application/json":
      yield c`
        lib.addParameter(responseHeaders, "content-type", outgoingOperationResponse.contentType);
        serverOutgoingResponse = {
          status: outgoingOperationResponse.status,
          headers: responseHeaders,
          async *stream(signal) {
            throw new Error("TODO");
          },
        }
      `;
      break;

    default:
      yield c`
        lib.addParameter(responseHeaders, "content-type", outgoingOperationResponse.contentType);
        serverOutgoingResponse = {
          status: outgoingOperationResponse.status,
          headers: responseHeaders,
          async *stream(signal) {
            throw new Error("TODO");
          },
        }
      `;
  }
}
