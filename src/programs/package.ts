import * as path from "node:path";
import ts from "typescript";
import * as yargs from "yargs";

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

  // todo
}
