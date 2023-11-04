export type NestedCode = Iterable<NestedCode> | Code;

export class Code {
  public constructor(private value: string) {
    //
  }

  public toString() {
    return this.value;
  }

  public static literal(value: unknown): Code {
    return new Code(JSON.stringify(value));
  }

  public static raw(value: string): Code {
    return new Code(value);
  }

  public static *fromTemplate(
    strings: TemplateStringsArray,
    ...values: NestedCode[]
  ): NestedCode {
    for (let index = 0; index < strings.length + values.length; index++) {
      if (index % 2 === 0) {
        yield new Code(strings[index / 2]);
      } else {
        yield values[(index - 1) / 2];
      }
    }
  }

  public static fromNested(nestedCode: NestedCode) {
    const codes = [...flattenNestedCode(nestedCode)];
    const value = codes.map((code) => code.toString()).join("");
    return new Code(value);
  }
}

export const c = Code.fromTemplate;
export const l = Code.literal;
export const r = Code.raw;

function* flattenNestedCode(nestedCode: NestedCode): Iterable<Code> {
  if (
    Symbol.iterator in nestedCode &&
    typeof nestedCode[Symbol.iterator] == "function"
  ) {
    for (const code of nestedCode) {
      yield* flattenNestedCode(code);
    }
  } else {
    yield nestedCode as Code;
  }
}
