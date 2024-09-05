import { mintTestToken } from '../utils/testUtils';

// Input token addresses
const tokenAddresses = [
  "0x94C7d9644A8C8D8F5131AdF91d64271cF7691358",
  "0x6fcd44e2200DfA9eC5546d95965DC59f5DD0553f",
  "0x52D5B06b7c937A563938eB5D4baF290A19a8569A",
  "0x86a98eb31721f997Fed65f2aEa535DD428dCe193",
]

const toAddress = "0x5B9Ecd030f9e8e02c7c7c82A213a3f5b66480a10";

export default async function main() {
  for (let tokenAddress of tokenAddresses) {
    await mintTestToken(toAddress, tokenAddress, '10000');
  }
}

if (require.main === module) {
  main()
}
