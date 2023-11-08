import * as models from "../../models/index.js";
import { itt } from "../../utils/iterable-text-template.js";

export function* generateClientOperationFunctionBody(
  apiModel: models.Api,
  pathModel: models.Path,
  operationModel: models.Operation,
) {
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
        ${generateContentTypeCaseClauses(apiModel, operationModel)}
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
  `;

  yield itt`
    throw new Error("TODO");
  `;
}

function* generateContentTypeCaseClauses(
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
