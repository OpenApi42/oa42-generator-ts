import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";

/**
 * function statements for route handler
 */
export function* generateRouteHandlerMethodBody(
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

  const isRequestParametersFunction = toCamel(
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

  yield itt`
    const { 
      validateRequestEntity,
      validateResponseEntity,
      validateRequestParameters,
      validateResponseParameters,
    } = this.options;
  `;

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
          (parameterModel) => `
    ${toCamel(parameterModel.name)}: 
      lib.getParameterValue(routeParameters, ${JSON.stringify(
        parameterModel.name,
      )}),
    `,
        ),
        ...operationModel.headerParameters.map(
          (parameterModel) => `
    ${toCamel(parameterModel.name)}: 
      lib.getParameterValue(serverIncomingRequest.headers, ${JSON.stringify(
        parameterModel.name,
      )}),
    `,
        ),
        ...operationModel.queryParameters.map(
          (parameterModel) => `
    ${toCamel(parameterModel.name)}: 
      lib.getParameterValue(requestQuery, ${JSON.stringify(
        parameterModel.name,
      )}),
    `,
        ),
        ...operationModel.cookieParameters.map(
          (parameterModel) => `
    ${toCamel(parameterModel.name)}: 
      lib.getParameterValue(requestCookie, ${JSON.stringify(
        parameterModel.name,
      )}),
    `,
        ),
      ]}
    } as unknown as shared.${requestParametersName};
    if(validateRequestParameters) {
      if(!shared.${isRequestParametersFunction}(requestParameters)) {
        throw new lib.ServerRequestParameterValidationFailed();
      }
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
        throw new lib.MissingServerRequestContentType();
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
      ${generateStatusCodeCaseClauses(apiModel, operationModel)}
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
      throw new lib.UnexpectedServerRequestContentType();
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
        const mapAssertEntity = (entity: unknown) => {
          ${
            isBodyTypeFunction == null
              ? ""
              : itt`
            if(!shared.${isBodyTypeFunction}(entity)) {
              throw new lib.ServerRequestEntityValidationFailed();
            }
          `
          }
          return entity;
        };
      `;

      yield itt`
        incomingOperationRequest = {
          parameters: requestParameters,
          contentType: requestContentTypeHeader,
          stream(signal) {
            return incomingOperationRequest.stream(signal);
          },
          entities(signal) {
            let entities = lib.deserializeJsonEntities(
              incomingOperationRequest.stream,
              signal,
            ) as AsyncIterable<${
              bodyTypeName == null ? "unknown" : `shared.${bodyTypeName}`
            }>;
            if(validateRequestEntity) {
              entities = lib.mapAsyncIterable(entities, mapAssertEntity);
            }
            return entities;
          },
          async entity() {
            let entity = lib.deserializeJsonEntity(
              incomingOperationRequest.stream
            ) as Promise<${
              bodyTypeName == null ? "unknown" : `shared.${bodyTypeName}`
            }>;
            if(validateRequestEntity) {
              entity = lib.mapPromisable(entity, mapAssertEntity);
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

function* generateStatusCodeCaseClauses(
  apiModel: models.Api,
  operationModel: models.Operation,
) {
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
            ${generateOperationResultBody(
              apiModel,
              operationModel,
              operationResultModel,
            )}
            break;
          }
        `;
      }
    }
  }

  yield itt`
    default:
      throw new lib.Unreachable();
  `;
}

function* generateOperationResultBody(
  apiModel: models.Api,
  operationModel: models.Operation,
  operationResultModel: models.OperationResult,
) {
  const responseParametersName = toPascal(
    operationModel.name,
    operationResultModel.statusKind,
    "response",
    "parameters",
  );

  const isResponseParametersFunction = toCamel(
    "is",
    operationModel.name,
    operationResultModel.statusKind,
    "response",
    "parameters",
  );

  yield itt`
    if(validateResponseParameters) {
      if(!shared.${isResponseParametersFunction}(outgoingOperationResponse.parameters)) {
        throw new lib.ServerResponseParameterValidationFailed();
      }
    }
  `;

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
    yield* generateOperationResultContentTypeBody(apiModel);
    return;
  } else {
    yield itt`
      switch(outgoingOperationResponse.contentType) {
        ${generateOperationResultContentTypeCaseClauses(
          apiModel,
          operationResultModel,
        )}
      }
    `;
  }
}

function* generateOperationResultContentTypeCaseClauses(
  apiModel: models.Api,
  operationResultModel: models.OperationResult,
) {
  for (const bodyModel of operationResultModel.bodies) {
    yield itt`
      case ${JSON.stringify(bodyModel.contentType)}:
      {
        ${generateOperationResultContentTypeBody(apiModel, bodyModel)}
        break;
      }
    `;
  }

  yield itt`
    default:
      throw new lib.Unreachable();       
  `;
}

function* generateOperationResultContentTypeBody(
  apiModel: models.Api,
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
          stream(signal) {
            if("stream" in outgoingOperationResponse) {
              return outgoingOperationResponse.stream(signal);
            }
            else if("lines" in outgoingOperationResponse) {
              return lib.serializeTextLines(outgoingOperationResponse.lines(signal));
            }
            else if("value" in outgoingOperationResponse) {
              return lib.serializeTextValue(outgoingOperationResponse.value);
            }
            else {
              throw new lib.Unreachable();
            }
          },
        }
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
        const mapAssertEntity = (entity: unknown) => {
          ${
            isBodyTypeFunction == null
              ? ""
              : itt`
            if(!shared.${isBodyTypeFunction}(entity)) {
              throw new lib.ServerResponseEntityValidationFailed();
            }
          `
          }
          return entity as ${
            bodyTypeName == null ? "unknown" : `shared.${bodyTypeName}`
          };
        }
      `;

      yield itt`
        lib.addParameter(responseHeaders, "content-type", outgoingOperationResponse.contentType);
        serverOutgoingResponse = {
          status: outgoingOperationResponse.status,
          headers: responseHeaders,
          stream(signal) {
            if("stream" in outgoingOperationResponse) {
              return outgoingOperationResponse.stream(signal);
            }
            else if("entities" in outgoingOperationResponse) {
              let entities = outgoingOperationResponse.entities(signal);
              if(validateResponseEntity) {
                entities = lib.mapAsyncIterable(entities, mapAssertEntity);
              }
              return lib.serializeJsonEntities(outgoingOperationResponse.entities(signal));
            }
            else if("entity" in outgoingOperationResponse) {
              let entity = outgoingOperationResponse.entity();
              if(validateResponseEntity) {
                entity = lib.mapPromisable(entity, mapAssertEntity);
              }
              return lib.serializeJsonEntity(entity);
            }
            else {
              throw new lib.Unreachable();
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
              throw new lib.Unreachable();
            }
          },
        }
      `;
    }
  }
}
