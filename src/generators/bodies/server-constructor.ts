import * as models from "../../models/index.js";
import { itt } from "../../utils/iterable-text-template.js";

export function* generateServerConstructorBody(apiModel: models.Api) {
  yield itt`
    super();
  `;

  for (const pathModel of apiModel.paths) {
    yield itt`
      this.router.insertRoute(
        ${JSON.stringify(pathModel.id)},
        ${JSON.stringify(pathModel.pattern)},
      );
    `;
  }
}
