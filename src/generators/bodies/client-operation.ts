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
    let requestInit: RequestInit;
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
      case ${JSON.stringify(bodyModel.contentType)}:
        ${generateRequestContentTypeCodeBody(apiModel, operationModel)}
        break;
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
      requestInit = {
        headers: headerParameters,
        method: ${JSON.stringify(operationModel.method.toUpperCase())},
        redirect:"manual",
      }
    `;
    return;
  }

  switch (bodyModel.contentType) {
    case "text/plain": {
      yield itt`
        const body = lib.toFetchBody();
        requestInit = {
          headers: headerParameters,
          method: ${JSON.stringify(operationModel.method.toUpperCase())},
          redirect: "manual",
          body,
        }
      `;
      break;
    }

    case "application/json": {
      yield itt`
        const body = lib.toFetchBody();
        requestInit = {
          headers: headerParameters,
          method: ${JSON.stringify(operationModel.method.toUpperCase())},
          redirect: "manual",
          body,
        }
      `;
      break;
    }

    default: {
      yield itt`
        const body = lib.toFetchBody();
        requestInit = {
          headers: headerParameters,
          method: ${JSON.stringify(operationModel.method.toUpperCase())},
          redirect: "manual",
          body,
        }
      `;
    }
  }
}
