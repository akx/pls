export function stringify(object: Record<string, string>): string {
  return new URLSearchParams(object).toString();
}

export function parse(s: string): Record<string, string> {
  const params = new URLSearchParams(s);
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}
