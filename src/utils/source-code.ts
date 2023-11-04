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
    ...values: (Code | Iterable<Code>)[]
  ): Iterable<Code> {
    for (let index = 0; index < strings.length + values.length; index++) {
      if (index % 2 === 0) {
        yield new Code(strings[index / 2]);
      } else {
        const codes = values[(index - 1) / 2];
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
export const r = Code.raw;
