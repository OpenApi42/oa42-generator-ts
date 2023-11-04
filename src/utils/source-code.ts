export class Code {
  public constructor(private value: string) {
    //
  }

  public toString() {
    return this.value;
  }

  public static literal(value: unknown) {
    return new Code(JSON.stringify(value));
  }

  public static identifier(...parts: string[]) {
    return new Code(parts.join("."));
  }

  public static fromTemplate(
    strings: TemplateStringsArray,
    ...codes: (Code | Iterable<Code>)[]
  ) {
    const values = new Array<string>();
    for (let index = 0; index < strings.length + values.length; index++) {
      if (index % 2 === 0) {
        values.push(strings[index / 2]);
      } else {
        if (codes instanceof Code) {
          codes = [codes];
        }

        if (Symbol.iterator in codes) {
          for (const code of codes) {
            values.push(code.toString());
          }
          continue;
        }

        throw new TypeError("type not supported");
      }
    }

    return new Code(values.join(""));
  }
}

export const c = Code.fromTemplate;
export const i = Code.identifier;
export const l = Code.literal;
