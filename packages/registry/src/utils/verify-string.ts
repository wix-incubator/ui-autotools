export function isValidSimulationTitle(stringToVerify: string): boolean {
  const verificationExpression =  /^[\s\w\,\.\-\(\)]+$/; // Match letters, numbers, acceptable symbols, and spaces

  return verificationExpression.test(stringToVerify);
}

export function isValidComponentName(stringToVerify: string): boolean {
  const verificationExpression =  /^[a-zA-Z]+$/; // Match only letters

  return verificationExpression.test(stringToVerify);
}
