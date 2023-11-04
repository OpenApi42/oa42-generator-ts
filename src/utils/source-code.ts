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

  public static identifier(...parts: string[]): Code {
    return new Code(parts.join("."));
  }

  public static *fromTemplate(
    strings: TemplateStringsArray,
    ...codes: (Code | Iterable<Code>)[]
  ): Iterable<Code> {
    for (let index = 0; index < strings.length + codes.length; index++) {
      if (index % 2 === 0) {
        yield new Code(strings[index / 2]);
      } else {
        if (codes instanceof Code) {
          yield codes;
        } else {
          for (const code of codes) {
            if (code instanceof Code) {
              yield code;
            }
          }
        }
      }
    }
  }
}

export const c = Code.fromTemplate;
export const l = Code.literal;
export const i = Code.identifier;
