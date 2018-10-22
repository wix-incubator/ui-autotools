// Ex: intersperse([1, 2, 3, 4], 0)  ⇨  [1, 0, 2, 0, 3, 0, 4]
export const intersperse = <T>(items: T[], separator: T) => {
  const result: T[] = [];
  for (const item of items) {
    result.push(item);
    result.push(separator);
  }
  result.pop();
  return result;
};

export const isValidJsIdentifier = (id: string) =>
  /^[a-z_$][a-z_$0-9]*$/i.test(id);
