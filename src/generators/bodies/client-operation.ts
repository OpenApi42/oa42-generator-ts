import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";

export function* generateClientOperationFunctionBody(
  apiModel: models.Api,
  pathModel: models.Path,
  operationModel: models.Operation,
) {
  const operationIncomingResponseName = toPascal(
    operationModel.name,
    "incoming",
    "response",
  );

  yield itt`
    const {baseUrl} = options;
    if(baseUrl == null) {
      throw new Error("please set baseUrl");
    }
  `;

  yield itt`
    const {
      validateRequestEntity,
      validateResponseEntity,
      validateRequestParameters,
      validateResponseParameters,
    } = options;
  `;

  yield itt`
    const routeParameters = {};
    const queryParameters = {};
    const headerParameters = {};
    const cookieParameters = {};
  `;

  for (const parameter of operationModel.pathParameters) {
    yield itt`
      lib.addParameter(
        routeParameters,
        ${JSON.stringify(parameter.name)},
        "TODO",
      );
    `;
  }

  for (const parameter of operationModel.queryParameters) {
    yield itt`
      lib.addParameter(
        queryParameters,
        ${JSON.stringify(parameter.name)},
        "TODO",
      );
    `;
  }

  for (const parameter of operationModel.headerParameters) {
    yield itt`
      lib.addParameter(
        headerParameters,
        ${JSON.stringify(parameter.name)},
        "TODO",
      );
    `;
  }

  for (const parameter of operationModel.cookieParameters) {
    yield itt`
      lib.addParameter(
        cookieParameters,
        ${JSON.stringify(parameter.name)},
        "TODO",
      );
    `;
  }

  yield itt`
    const requestPath =
      router.stringifyRoute(
        ${JSON.stringify(pathModel.id)},
        routeParameters,
      ) +
      lib.stringifyParameters(
        queryParameters,
        "?", "&", "=",
      );
    const requestCookie = lib.stringifyParameters(
      cookieParameters,
      "", "; ", "=",
    );
    if(requestCookie !== ""){
      lib.addParameter(headerParameters, "set-cookie", requestCookie);
    }

    const requestUrl = new URL(baseUrl, requestPath);
    let body: BodyInit | null;  
    `;

  if (operationModel.bodies.length === 0) {
    yield* generateRequestContentTypeCodeBody(apiModel, operationModel);
  } else {
    yield itt`  
      switch(outgoingRequest.contentType){
        ${generateRequestContentTypeCaseClauses(apiModel, operationModel)}
      }
    `;
  }

  yield itt`
    const requestInit: RequestInit = {
      headers: headerParameters,
      method: "PUT",
      redirect: "manual",
      body,
    };
    const fetchResponse = await fetch(requestUrl, requestInit);

    const responseContentType = 
      fetchResponse.headers.get("content-type");

    let incomingResponse: ${operationIncomingResponseName};
  `;

  yield itt`
    switch(fetchResponse.status) {
      ${generateResponseStatusCodeCaseClauses(apiModel, operationModel)}
    }
  `;

  yield itt`
    return incomingResponse;
  `;
}

function* generateRequestContentTypeCaseClauses(
  apiModel: models.Api,
  operationModel: models.Operation,
) {
  for (const bodyModel of operationModel.bodies) {
    yield itt`
      case ${JSON.stringify(bodyModel.contentType)}: {
        ${generateRequestContentTypeCodeBody(
          apiModel,
          operationModel,
          bodyModel,
        )}
        break;
      }
    `;
  }

  yield itt`
    default:
      throw new lib.Unreachable();
  `;
}

function* generateResponseStatusCodeCaseClauses(
  apiModel: models.Api,
  operationModel: models.Operation,
) {
  for (const operationResultModel of operationModel.operationResults) {
    const statusCodes = [...operationResultModel.statusCodes];
    let statusCode;
    while ((statusCode = statusCodes.shift()) != null) {
      yield itt`case ${JSON.stringify(statusCode)}:`;
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
    const responseParameters = {
      ${operationResultModel.headerParameters.map((parameterModel) => {
        const parameterName = toCamel(parameterModel.name);
        return `
          ${parameterName}: fetchResponse.headers.get(${JSON.stringify(
            parameterModel.name,
          )}),
        `;
      })}
    } as unknown as shared.${responseParametersName};

    if(validateResponseParameters) {
      if(!shared.${isResponseParametersFunction}(responseParameters)) {
        throw new lib.ClientResponseParameterValidationFailed();
      }
    }
  `;

  for (const parameterModel of operationResultModel.headerParameters) {
    const parameterName = toCamel(parameterModel.name);

    // const addParameterCode = itt`
    //   lib.addParameter(
    //     responseHeaders,
    //     ${JSON.stringify(parameterModel.name)},
    //     outgoingOperationResponse.parameters.${parameterName}.toString(),
    //   );
    // `;

    // if (parameterModel.required) {
    //   yield addParameterCode;
    // } else {
    //   yield itt`
    //     if (outgoingOperationResponse.parameters.${parameterName} !== undefined) {
    //       ${addParameterCode}
    //     }
    //   `;
    // }
  }
  if (operationResultModel.bodies.length === 0) {
    yield* generateOperationResultContentTypeBody(apiModel);
    return;
  } else {
    yield itt`
      switch(responseContentType) {
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

function* generateRequestContentTypeCodeBody(
  apiModel: models.Api,
  operationModel: models.Operation,
  bodyModel?: models.Body,
) {
  if (bodyModel == null) {
    yield itt`
      body = null;
    `;
    return;
  }

  switch (bodyModel.contentType) {
    case "text/plain": {
      yield itt`
        let stream: AsyncIterable<Uint8Array>;
        if("stream" in outgoingRequest) {
          stream = outgoingRequest.stream();
        }
        else if("lines" in outgoingRequest) {
          stream = lib.serializeTextLines(outgoingRequest.lines());
        }
        else if("value" in outgoingRequest) {
          stream = lib.serializeTextValue(outgoingRequest.value());
        }
        else {
          throw new lib.Unreachable();
        }
        body = await lib.toFetchBody(stream);
      `;
      break;
    }

    case "application/json": {
      yield itt`
        let stream: AsyncIterable<Uint8Array>;
        if("stream" in outgoingRequest) {
          stream = outgoingRequest.stream();
        }
        else if("entities" in outgoingRequest) {
          stream = lib.serializeJsonEntities(outgoingRequest.entities());
        }
        else if("entity" in outgoingRequest) {
          stream = lib.serializeJsonEntity(outgoingRequest.entity());
        }
        else {
          throw new lib.Unreachable();
        }
        body = await lib.toFetchBody(stream);
      `;
      break;
    }

    default: {
      yield itt`
        let stream: AsyncIterable<Uint8Array>;
        if("stream" in outgoingRequest) {
          stream = outgoingRequest.stream();
        }
        else {
          throw new lib.Unreachable();
        }
        body = await lib.toFetchBody(stream);
      `;
    }
  }
}

function* generateOperationResultContentTypeBody(
  apiModel: models.Api,
  bodyModel?: models.Body,
) {
  if (bodyModel == null) {
    yield itt`
      incomingResponse = {
        status: fetchResponse.status,
        contentType: null,
        parameters: responseParameters,
      }
    `;
    return;
  }
  yield itt`
    const stream = (signal?: AbortSignal) => lib.fromFetchBody(fetchResponse.body!);
  `;
  switch (bodyModel.contentType) {
    case "text/plain": {
      yield itt`
        incomingResponse = {
          status: fetchResponse.status,
          contentType: responseContentType,
          parameters: responseParameters,
          stream: (signal) => {
            return stream(signal)
          },
          lines(signal) {
            return lib.deserializeTextLines(stream, signal));
          },
          value() {
            return lib.deserializeTextValue(stream);
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
              throw new lib.ClientResponseEntityValidationFailed();
            }
          `
          }
          return entity;
        };
      `;

      yield itt`
        incomingResponse = {
          status: fetchResponse.status,
          contentType: responseContentType,
          parameters: responseParameters,
          stream: (signal) => {
            return stream(signal)
          },
          entities(signal) {
            let entities = lib.deserializeJsonEntities(
              stream,
              signal,
            ) as AsyncIterable<${
              bodyTypeName == null ? "unknown" : `shared.${bodyTypeName}`
            }>;
            if(validateRequestEntity) {
              entities = lib.mapAsyncIterable(entities, mapAssertEntity);
            }
            return entities;
          },
          entity() {
            let entity = lib.deserializeJsonEntity(
              stream
            ) as Promise<${
              bodyTypeName == null ? "unknown" : `shared.${bodyTypeName}`
            }>;
            if(validateRequestEntity) {
              entity = lib.mapPromisable(entity, mapAssertEntity);
            }
            return entity;
          },
        }
      `;
      break;
    }

    default: {
      yield itt`
        incomingResponse = {
          status: fetchResponse.status,
          contentType: responseContentType,
          parameters: responseParameters,
          stream: (signal) => {
            return stream(signal)
          },
        }
      `;
    }
  }
}
