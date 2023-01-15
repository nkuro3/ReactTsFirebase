export default function RamdomStr() {
  const S =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const N = 16;
  // crypto.getRandomValues(new Uint32Array(N))：符号なしのランダムな英数字を引数分生成
  return Array.from(crypto.getRandomValues(new Uint32Array(N)))
  .map((n) => S[n % S.length])
  .join("");
}
