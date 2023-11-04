import * as models from "../../models/index.js";
import { c, l, toCamel, toPascal } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class AuthenticationTypesCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateAllAuthenticationTypes();
  }

  private *generateAllAuthenticationTypes() {
    for (const authenticationModel of this.apiModel.authentication) {
      yield* this.generateAuthenticationType(authenticationModel);
    }
  }

  private *generateAuthenticationType(
    authenticationModel: models.Authentication,
  ) {
    const handlerTypeName = toPascal(
      authenticationModel.name,
      "authentication",
      "handler",
    );

    yield c`
export type ${handlerTypeName}<A extends ServerAuthentication> =
  (credential: string) => A[${l(toCamel(authenticationModel.name))}];
`;
  }
}
