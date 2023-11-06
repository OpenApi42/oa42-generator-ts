import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";

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
      yield* generateMethod(apiModel, operationModel);
    }
  }
}

/**
 * single function to handle a route
 * @param pathModel
 * @param operationModel
 */
function* generateMethod(
  apiModel: models.Api,
  operationModel: models.Operation,
) {
  const routeHandlerName = toCamel(operationModel.name, "route", "handler");

  yield itt`
    private ${routeHandlerName}(
      routeParameters: Record<string, string>,
      serverIncomingRequest: lib.ServerIncomingRequest,
    ): lib.ServerOutgoingResponse {
      ${generateMethodBody(apiModel, operationModel)}
    }
  `;
}

/**
 * function statements for route handler
 */
function* generateMethodBody(
  apiModel: models.Api,
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

  yield itt`
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

  yield itt`
    const requestQuery =
      lib.parseParameters(serverIncomingRequest.query, "&", "=");
    const requestCookie =
      lib.parseParameters(requestCookieHeader ?? "", "; ", "=");
  `;

  /**
   * let's handle authentication
   */

  yield itt`
    const authentication = {
      ${authenticationNames.map(
        (name) => itt`
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

  yield itt`
    const requestParameters = {
      ${[
        ...operationModel.pathParameters.map(
          (parameterModel) => itt`
    ${toCamel(parameterModel.name)}: 
      lib.getParameterValue(routeParameters, ${JSON.stringify(
        parameterModel.name,
      )}),
    `,
        ),
        ...operationModel.headerParameters.map(
          (parameterModel) => itt`
    ${toCamel(parameterModel.name)}: 
      lib.getParameterValue(serverIncomingRequest.headers, ${JSON.stringify(
        parameterModel.name,
      )}),
    `,
        ),
        ...operationModel.queryParameters.map(
          (parameterModel) => itt`
    ${toCamel(parameterModel.name)}: 
      lib.getParameterValue(requestQuery, ${JSON.stringify(
        parameterModel.name,
      )}),
    `,
        ),
        ...operationModel.cookieParameters.map(
          (parameterModel) => itt`
    ${toCamel(parameterModel.name)}: 
      lib.getParameterValue(requestCookie, ${JSON.stringify(
        parameterModel.name,
      )}),
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

  yield itt`
    let incomingOperationRequest: ${operationIncomingRequestName};
  `;

  if (operationModel.bodies.length === 0) {
    yield* generateRequestContentTypeCodeBody(apiModel);
  } else {
    yield itt`
      if(requestContentTypeHeader == null) {
        throw new lib.MissingRequestContentType();
      }

      switch(requestContentTypeHeader) {
        ${generateRequestContentTypeCodeCaseClauses(apiModel, operationModel)};
      }
    `;
  }

  /**
   * execute the operation handler and collect the response
   */

  yield itt`
    const outgoingOperationResponse =
      this.${operationHandlerName}?.(
        incomingOperationRequest,
        authentication,
      );
    if (outgoingOperationResponse == null) {
      throw new lib.OperationNotImplemented();
    }
  `;

  yield itt`
    let serverOutgoingResponse: lib.ServerOutgoingResponse ;
    switch(outgoingOperationResponse.status) {
      ${generateStatusCodeCaseClauses(operationModel)}
    }
  `;

  yield itt`
    return serverOutgoingResponse
  `;
}

function* generateRequestContentTypeCodeCaseClauses(
  apiModel: models.Api,
  operationModel: models.Operation,
) {
  for (const bodyModel of operationModel.bodies) {
    yield itt`
      case ${JSON.stringify(bodyModel.contentType)}:
      {
        ${generateRequestContentTypeCodeBody(apiModel, bodyModel)}
        break;
      }
    `;
  }
  yield itt`
    default:
      throw new lib.UnexpectedRequestContentType();
  `;
}

function* generateRequestContentTypeCodeBody(
  apiModel: models.Api,
  bodyModel?: models.Body,
) {
  if (bodyModel == null) {
    yield itt`
      incomingOperationRequest = {
        parameters: requestParameters,
        contentType: null,
      };
    `;
    return;
  }

  switch (bodyModel.contentType) {
    case "text/plain": {
      yield itt`
        incomingOperationRequest = {
          parameters: requestParameters,
          contentType: requestContentTypeHeader,
          async *stream(signal) {
            yield* incomingOperationRequest.stream(signal);
          },
          async *lines(signal) {
            for await(const line of lib.deserializeTextLines(incomingOperationRequest.stream, signal)){
              yield line;
            }
          },
          async value() {
            const value = await lib.deserializeTextValue(incomingOperationRequest.stream);
            return value;
          },
        };
      `;
      break;
    }

    case "application/json": {
      const bodySchemaId = bodyModel.schemaId;
      const bodyTypeName =
        bodySchemaId == null ? bodySchemaId : apiModel.names[bodySchemaId];
      const isBodyTypeFunction =
        bodyTypeName == null ? bodyTypeName : "is" + bodyTypeName;
      yield itt`
        incomingOperationRequest = {
          parameters: requestParameters,
          contentType: requestContentTypeHeader,
          async *stream(signal) {
            yield* incomingOperationRequest.stream(signal);
          },
          async *entities(signal) {
            for await(const entity of lib.deserializeJsonEntities<${
              bodyTypeName == null ? "unknown" : itt`shared.${bodyTypeName}`
            }>(incomingOperationRequest.stream, signal)){
              ${
                isBodyTypeFunction == null
                  ? ""
                  : itt`
                if(!shared.${isBodyTypeFunction}(entity)) {
                  throw new Error("validation");
                }
              `
              }
              yield entity;
            }
          },
          async entity() {
            const entity = await lib.deserializeJsonEntity<${
              bodyTypeName == null ? "unknown" : itt`shared.${bodyTypeName}`
            }>(incomingOperationRequest.stream);
            ${
              isBodyTypeFunction == null
                ? ""
                : itt`
              if(!shared.${isBodyTypeFunction}(entity)) {
                throw new Error("validation");
              }
            `
            }
            return entity;
          },
        };
      `;
      break;
    }

    default: {
      yield itt`
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
}

function* generateStatusCodeCaseClauses(operationModel: models.Operation) {
  for (const operationResultModel of operationModel.operationResults) {
    const statusCodes = [...operationResultModel.statusCodes];
    let statusCode;
    while ((statusCode = statusCodes.shift()) != null) {
      yield itt`
        case ${JSON.stringify(statusCode)}:
      `;
      // it's te last one!
      if (statusCodes.length === 0) {
        yield itt`
          {
            ${generateOperationResultBody(operationResultModel)}
            break;
          }
        `;
      }
    }
  }

  yield itt`
    default:
      throw new lib.UnexpectedResponseStatusCode();
  `;
}

function* generateOperationResultBody(
  operationResultModel: models.OperationResult,
) {
  yield itt`
    const responseHeaders = {};
  `;

  for (const parameterModel of operationResultModel.headerParameters) {
    const parameterName = toCamel(parameterModel.name);

    const addParameterCode = itt`
      lib.addParameter(
        responseHeaders,
        ${JSON.stringify(parameterModel.name)},
        outgoingOperationResponse.parameters.${parameterName}.toString(),
      );
    `;

    if (parameterModel.required) {
      yield addParameterCode;
    } else {
      yield itt`
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
    yield itt`
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
    yield itt`
      case ${JSON.stringify(bodyModel.contentType)}:
      {
        ${generateOperationResultContentTypeBody(bodyModel)}
        break;
      }
    `;
  }

  yield itt`
    default:
      throw new Error("unexpected content-type");       
  `;
}

export function* generateOperationResultContentTypeBody(
  bodyModel?: models.Body,
) {
  if (bodyModel == null) {
    yield itt`
      serverOutgoingResponse = {
        status: outgoingOperationResponse.status,
        headers: responseHeaders,
      }    
    `;
    return;
  }

  switch (bodyModel.contentType) {
    case "text/plain": {
      yield itt`
        lib.addParameter(responseHeaders, "content-type", outgoingOperationResponse.contentType);
        serverOutgoingResponse = {
          status: outgoingOperationResponse.status,
          headers: responseHeaders,
          async *stream(signal) {
            if("stream" in outgoingOperationResponse) {
              yield* outgoingOperationResponse.stream(signal);
            }
            else if("lines" in outgoingOperationResponse) {
              yield* lib.serializeTextLines(outgoingOperationResponse.lines(signal));
            }
            else if("value" in outgoingOperationResponse) {
              yield* lib.serializeTextValue(outgoingOperationResponse.value);
            }
            else {
              throw new Error("error");
            }
          },
        }
      `;
      break;
    }

    case "application/json": {
      yield itt`
        lib.addParameter(responseHeaders, "content-type", outgoingOperationResponse.contentType);
        serverOutgoingResponse = {
          status: outgoingOperationResponse.status,
          headers: responseHeaders,
          async *stream(signal) {
            if("stream" in outgoingOperationResponse) {
              yield* outgoingOperationResponse.stream(signal);
            }
            else if("entities" in outgoingOperationResponse) {
              yield* lib.serializeJsonEntities(outgoingOperationResponse.entities(signal));
            }
            else if("entity" in outgoingOperationResponse) {
              yield* lib.serializeJsonEntity(outgoingOperationResponse.entity);
            }
            else {
              throw new Error("error");
            }
          },
        }
      `;
      break;
    }

    default: {
      yield itt`
        lib.addParameter(responseHeaders, "content-type", outgoingOperationResponse.contentType);
        serverOutgoingResponse = {
          status: outgoingOperationResponse.status,
          headers: responseHeaders,
          async *stream(signal) {
            if("stream" in outgoingOperationResponse) {
              yield* outgoingOperationResponse.stream(signal);
            }
            else {
              throw new Error("error");
            }
          },
        }
      `;
    }
  }
}
