import { c, l } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerConstructorCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateConstructor();
  }

  private *generateConstructor() {
    yield c`
public constructor() {
  ${this.generateConstructorBody()}
}
`;
  }

  private *generateConstructorBody() {
    yield c`
super();
`;

    for (
      let pathIndex = 0;
      pathIndex < this.apiModel.paths.length;
      pathIndex++
    ) {
      const pathModel = this.apiModel.paths[pathIndex];
      yield c`
this.router.insertRoute(
  ${l(pathIndex + 1)},
  ${l(pathModel.pattern)},
);
`;
    }
  }
}
