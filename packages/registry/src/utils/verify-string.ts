export function isAlphanumeric(stringToVerify: string): boolean {
  const verificationExpression =  /^[\s\w\,\.\-\(\)]+$/;

  return verificationExpression.test(stringToVerify);
}
