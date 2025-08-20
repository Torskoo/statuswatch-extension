
export function nanoid(size = 16) {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (const b of bytes) id += alphabet[b % alphabet.length];
  return id;
}
