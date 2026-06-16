export async function requestWalletSignature(serializedTransaction: string): Promise<string> {
  return Promise.resolve(`mock-signature:${serializedTransaction.length}`);
}
