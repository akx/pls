// via https://stackoverflow.com/a/7616484/51685
export default function hashcode(hash: number, value: string): number {
  if (value.length === 0) return hash;
  for (let i = 0; i < value.length; i++) {
    const chr = value.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}
