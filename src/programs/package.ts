import * as oas30 from "@jns42/jns42-schema-oas-v3-0";
import * as oas31 from "@jns42/jns42-schema-oas-v3-1";
import * as swagger2 from "@jns42/jns42-schema-swagger-v2";

import * as path from "node:path";
import * as yargs from "yargs";
import { loadYAML } from "../utils/load.js";

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
  }

  if (oas30.isSchema20210928(data)) {
    console.log("oas30");
  }

  if (oas31.isSchema20221007(data)) {
    console.log("oas31");
  }

  // todo
}
