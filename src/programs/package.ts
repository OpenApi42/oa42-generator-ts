import * as oas30 from "@jns42/jns42-schema-oas-v3-0";
import * as oas31 from "@jns42/jns42-schema-oas-v3-1";
import * as swagger2 from "@jns42/jns42-schema-swagger-v2";

import * as path from "node:path";
import * as yargs from "yargs";
import { loadYAML } from "../utils/load.js";

const verbs = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
];

export function configurePackageProgram(argv: yargs.Argv) {
  return argv.command(
    "package [specification-url]",
    "create package from specification-url",
    (yargs) =>
      yargs
        .positional("specification-url", {
          description: "url to download specification from",
          type: "string",
        })
        .option("package-directory", {
          description: "where to output the package",
          type: "string",
        })
        .option("package-name", {
          description: "name of the package",
          type: "string",
        })
        .option("package-version", {
          description: "version of the package",
          type: "string",
        })
        .option("root-name-part", {
          description: "root name of the schema",
          type: "string",
          default: "schema",
        }),
    (argv) => main(argv as MainOptions),
  );
}

interface MainOptions {
  specificationUrl: string;
  packageDirectory: string;
  packageName: string;
  packageVersion: string;
  rootNamePart: string;
}

async function main(options: MainOptions) {
  let specificationUrl: URL;
  if (/^\w+\:\/\//.test(options.specificationUrl)) {
    specificationUrl = new URL(options.specificationUrl);
  } else {
    specificationUrl = new URL(
      "file://" + path.resolve(process.cwd(), options.specificationUrl),
    );
  }

  const packageDirectoryPath = path.resolve(options.packageDirectory);
  const { packageName, packageVersion, rootNamePart } = options;

  const data = await loadYAML(specificationUrl);

  if (swagger2.isSchemaJson(data)) {
    console.log("swagger2");

    for (const path in data.paths) {
      const pathItem = data.paths[path];

      if (swagger2.isPathItem(pathItem)) {
        for (const verb of verbs) {
          const operation = pathItem[verb];
          if (swagger2.isOperation(operation)) {
            console.log(
              `${verb.toUpperCase()} ${path}: ${operation.operationId}`,
            );

            const { parameters } = operation;
            for (const parameter of parameters ?? []) {
              if (swagger2.isBodyParameter(parameter)) {
                console.log(parameter.schema);
              }
            }
          }
        }
      }
    }
  }

  if (oas30.isSchema20210928(data)) {
    console.log("oas30");

    for (const path in data.paths) {
      const pathItem = data.paths[path];

      if (oas30.isPathItem(pathItem)) {
        for (const verb of verbs) {
          const operation = pathItem[verb];
          if (oas30.isOperation(operation)) {
            console.log(
              `${verb.toUpperCase()} ${path}: ${operation.operationId}`,
            );

            const { requestBody } = operation;
            if (requestBody != null) {
              if (oas30.isReference(requestBody)) {
                console.log(requestBody.$ref);
              } else {
                for (const type in requestBody.content) {
                  const { schema } = requestBody.content[type];
                  if (oas30.isDefinitionsSchema(schema)) {
                    console.log(schema);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  if (oas31.isSchema20221007(data)) {
    console.log("oas31");

    for (const path in data.paths) {
      const pathItem = data.paths[path];

      if (oas31.isPathItem(pathItem)) {
        for (const verb of verbs) {
          const operation = pathItem[verb];
          if (oas31.isOperation(operation)) {
            console.log(
              `${verb.toUpperCase()} ${path}: ${operation.operationId}`,
            );

            const { requestBody } = operation;
            if (requestBody != null) {
              if (oas31.isReference(requestBody)) {
                console.log(requestBody.$ref);
              } else {
                for (const type in requestBody.content) {
                  const { schema } = requestBody.content[type];
                  if (oas31.isDefsSchema(schema)) {
                    console.log(schema);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // todo
}
