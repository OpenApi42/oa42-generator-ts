import * as models from "../../models/index.js";
import { joinIterable } from "../../utils/index.js";
import { iterableTextTemplate as itt } from "../../utils/iterable-text.js";
import { toCamel, toPascal } from "../../utils/name.js";

export function* generateOperationsTypeCode(apiModel: models.Api) {
  yield* generateAllOperationTypes(apiModel);
}

function* generateAllOperationTypes(apiModel: models.Api) {
  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      yield* generateOperationTypes(apiModel, operationModel);
    }
  }
}

function* generateOperationTypes(
  apiModel: models.Api,
  operationModel: models.Operation,
) {
  const handlerTypeName = toPascal(operationModel.name, "operation", "handler");

  const operationAuthenticationName = toPascal(
    operationModel.name,
    "authentication",
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

  yield itt`
    export type ${handlerTypeName}<A extends ServerAuthentication> = 
      (
        incomingRequest: ${operationIncomingRequestName},
        authentication: ${operationAuthenticationName}<A>,
      ) => ${operationOutgoingResponseName}
  `;

  yield itt`
    export type ${operationAuthenticationName}<A extends ServerAuthentication> = 
      ${
        operationModel.authenticationRequirements.length > 0
          ? joinIterable(
              operationModel.authenticationRequirements.map(
                (requirements) =>
                  itt`Pick<A, ${
                    requirements.length > 0
                      ? joinIterable(
                          requirements.map((requirement) =>
                            JSON.stringify(
                              toCamel(requirement.authenticationName),
                            ),
                          ),
                          "|",
                        )
                      : "{}"
                  }>`,
              ),
              "|",
            )
          : "{}"
      }
    ;
  `;

  yield itt`
    export type ${operationIncomingRequestName} = ${joinIterable(
      generateRequestTypes(apiModel, operationModel),
      "|",
    )};
  `;

  yield itt`
    export type ${operationOutgoingResponseName} = ${joinIterable(
      generateResponseTypes(apiModel, operationModel),
      "|",
    )};
  `;
}

function* generateRequestTypes(
  apiModel: models.Api,
  operationModel: models.Operation,
) {
  if (operationModel.bodies.length === 0) {
    yield* generateRequestBodies(apiModel, operationModel);
  }

  for (const bodyModel of operationModel.bodies) {
    yield* generateRequestBodies(apiModel, operationModel, bodyModel);
  }
}

function* generateResponseTypes(
  apiModel: models.Api,
  operationModel: models.Operation,
) {
  if (operationModel.operationResults.length === 0) {
    yield itt`never`;
  }

  for (const operationResultModel of operationModel.operationResults) {
    if (operationResultModel.bodies.length === 0) {
      yield* generateResponseBodies(
        apiModel,
        operationModel,
        operationResultModel,
      );
    }

    for (const bodyModel of operationResultModel.bodies) {
      yield* generateResponseBodies(
        apiModel,
        operationModel,
        operationResultModel,
        bodyModel,
      );
    }
  }
}

function* generateRequestBodies(
  apiModel: models.Api,
  operationModel: models.Operation,
  bodyModel?: models.Body,
) {
  const operationIncomingParametersName = toPascal(
    operationModel.name,
    "request",
    "parameters",
  );

  if (bodyModel == null) {
    yield itt`
      lib.IncomingEmptyRequest<shared.${operationIncomingParametersName}>
    `;
    return;
  }

  switch (bodyModel.contentType) {
    case "plain/text": {
      yield itt`
        lib.IncomingTextRequest<
          shared.${operationIncomingParametersName},
          ${JSON.stringify(bodyModel.contentType)}
        >
      `;
      break;
    }
    case "application/json": {
      const bodySchemaId = bodyModel.schemaId;
      const bodyTypeName =
        bodySchemaId == null ? bodySchemaId : apiModel.names[bodySchemaId];

      yield itt`
        lib.IncomingJsonRequest<
          shared.${operationIncomingParametersName},
          ${JSON.stringify(bodyModel.contentType)},
          ${bodyTypeName == null ? "unknown" : itt`shared.${bodyTypeName}`}
        >
      `;
      break;
    }
    default: {
      yield itt`
        lib.IncomingStreamRequest<
          shared.${operationIncomingParametersName},
          ${JSON.stringify(bodyModel.contentType)}
        >
      `;
      break;
    }
  }
}

function* generateResponseBodies(
  apiModel: models.Api,
  operationModel: models.Operation,
  operationResultModel: models.OperationResult,
  bodyModel?: models.Body,
) {
  const operationOutgoingParametersName = toPascal(
    operationModel.name,
    operationResultModel.statusKind,
    "response",
    "parameters",
  );

  if (bodyModel == null) {
    yield itt`
      lib.OutgoingEmptyResponse<
        ${joinIterable(
          operationResultModel.statusCodes.map((statusCode) =>
            JSON.stringify(statusCode),
          ),
          "|",
        )},
        shared.${operationOutgoingParametersName}
      >
    `;
    return;
  }

  switch (bodyModel.contentType) {
    case "plain/text": {
      yield itt`
        lib.OutgoingTextResponse<
          ${joinIterable(
            operationResultModel.statusCodes.map((statusCode) =>
              JSON.stringify(statusCode),
            ),
            "|",
          )},
          shared.${operationOutgoingParametersName},
          ${JSON.stringify(bodyModel.contentType)}
        >
      `;
      break;
    }
    case "application/json": {
      const bodySchemaId = bodyModel.schemaId;
      const bodyTypeName =
        bodySchemaId == null ? bodySchemaId : apiModel.names[bodySchemaId];

      yield itt`
        lib.OutgoingJsonResponse<
          ${joinIterable(
            operationResultModel.statusCodes.map((statusCode) =>
              JSON.stringify(statusCode),
            ),
            "|",
          )},
          shared.${operationOutgoingParametersName},
          ${JSON.stringify(bodyModel.contentType)},
          ${bodyTypeName == null ? "unknown" : itt`shared.${bodyTypeName}`}
        >
      `;
      break;
    }
    default: {
      yield itt`
        lib.OutgoingStreamResponse<
          ${joinIterable(
            operationResultModel.statusCodes.map((statusCode) =>
              JSON.stringify(statusCode),
            ),
            "|",
          )},
          shared.${operationOutgoingParametersName},
          ${JSON.stringify(bodyModel.contentType)}
        >
      `;
      break;
    }
  }
}
