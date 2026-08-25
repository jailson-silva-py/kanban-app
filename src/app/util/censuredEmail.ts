export function censuredEmail(email: string) {
  const [first, second] = email.split("@");
  const newEmailStr = first[0] + "***********" + first[first.length-1] + "@" + second
  return newEmailStr;
}
