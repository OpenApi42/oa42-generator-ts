import * as models from "../../models/index.js";
import { c, joinIterable, l, r } from "../../utils/index.js";
import { toCamel, toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class OperationsTypeCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateAllOperationTypes();
  }

  private *generateAllOperationTypes() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateOperationTypes(operationModel);
      }
    }
  }

  private *generateOperationTypes(operationModel: models.Operation) {
    const handlerTypeName = toPascal(
      operationModel.name,
      "operation",
      "handler",
    );

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

    yield c`
export type ${handlerTypeName}<A extends ServerAuthentication> = 
  (
    incomingRequest: ${operationIncomingRequestName},
    authentication: ${operationAuthenticationName}<A>,
  ) => ${operationOutgoingResponseName}
`;

    yield c`
export type ${operationAuthenticationName}<A extends ServerAuthentication> = 
  ${
    operationModel.authenticationRequirements.length > 0
      ? joinIterable(
          operationModel.authenticationRequirements.map(
            (requirements) =>
              c`Pick<A, ${
                requirements.length > 0
                  ? joinIterable(
                      requirements.map((requirement) =>
                        l(toCamel(requirement.authenticationName)),
                      ),
                      r("|"),
                    )
                  : c`{}`
              }>`,
          ),
          r("|"),
        )
      : c`{}`
  }
;
`;

    yield c`
export type ${operationIncomingRequestName} = ${joinIterable(
      this.generateRequestTypes(operationModel),
      r("|"),
    )};
`;

    yield c`
export type ${operationOutgoingResponseName} = ${joinIterable(
      this.generateResponseTypes(operationModel),
      r("|"),
    )};
`;
  }

  private *generateRequestTypes(operationModel: models.Operation) {
    if (operationModel.bodies.length === 0) {
      yield* this.generateRequestBodies(operationModel);
    }

    for (const bodyModel of operationModel.bodies) {
      yield* this.generateRequestBodies(operationModel, bodyModel);
    }
  }

  private *generateResponseTypes(operationModel: models.Operation) {
    if (operationModel.operationResults.length === 0) {
      yield c`never`;
    }

    for (const operationResultModel of operationModel.operationResults) {
      if (operationResultModel.bodies.length === 0) {
        yield* this.generateResponseBodies(
          operationModel,
          operationResultModel,
        );
      }

      for (const bodyModel of operationResultModel.bodies) {
        yield* this.generateResponseBodies(
          operationModel,
          operationResultModel,
          bodyModel,
        );
      }
    }
  }

  private *generateRequestBodies(
    operationModel: models.Operation,
    bodyModel?: models.Body,
  ) {
    const operationIncomingParametersName = toPascal(
      operationModel.name,
      "request",
      "parameters",
    );

    if (bodyModel == null) {
      yield c`
lib.IncomingEmptyRequest<shared.${operationIncomingParametersName}>
`;
      return;
    }

    switch (bodyModel.contentType) {
      case "plain/text": {
        yield c`
lib.IncomingTextRequest<
  shared.${operationIncomingParametersName},
  ${l(bodyModel.contentType)}
>
`;
        break;
      }
      case "application/json": {
        const bodySchemaId = bodyModel.schemaId;
        const bodyTypeName =
          bodySchemaId == null
            ? bodySchemaId
            : this.apiModel.names[bodySchemaId];

        yield c`
lib.IncomingJsonRequest<
  shared.${operationIncomingParametersName},
  ${l(bodyModel.contentType)},
  ${bodyTypeName == null ? "unknown" : c`shared.${bodyTypeName}`}
>
`;
        break;
      }
      default: {
        yield c`
lib.IncomingStreamRequest<
  shared.${operationIncomingParametersName},
  ${l(bodyModel.contentType)}
>
`;
        break;
      }
    }
  }

  private *generateResponseBodies(
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
      yield c`
lib.OutgoingEmptyResponse<
  ${joinIterable(
    operationResultModel.statusCodes.map((statusCode) => l(statusCode)),
    r("|"),
  )},
  shared.${operationOutgoingParametersName}
>
`;
      return;
    }

    switch (bodyModel.contentType) {
      case "plain/text": {
        yield c`
lib.OutgoingTextResponse<
  ${joinIterable(
    operationResultModel.statusCodes.map((statusCode) => l(statusCode)),
    r("|"),
  )},
  shared.${operationOutgoingParametersName},
  ${l(bodyModel.contentType)}
>
`;
        break;
      }
      case "application/json": {
        const bodySchemaId = bodyModel.schemaId;
        const bodyTypeName =
          bodySchemaId == null
            ? bodySchemaId
            : this.apiModel.names[bodySchemaId];

        yield c`
lib.OutgoingJsonResponse<
  ${joinIterable(
    operationResultModel.statusCodes.map((statusCode) => l(statusCode)),
    r("|"),
  )},
  shared.${operationOutgoingParametersName},
  ${l(bodyModel.contentType)},
  ${bodyTypeName == null ? "unknown" : c`shared.${bodyTypeName}`}
>
`;
        break;
      }
      default: {
        yield c`
lib.OutgoingStreamResponse<
  ${joinIterable(
    operationResultModel.statusCodes.map((statusCode) => l(statusCode)),
    r("|"),
  )},
  shared.${operationOutgoingParametersName},
  ${l(bodyModel.contentType)}
>
`;
        break;
      }
    }
  }
}
