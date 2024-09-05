import { mintTestToken } from '../utils/testUtils';

// Input token addresses
const tokenAddresses = [
  "0xf0a6576D18398a86084c30650aA8E6D12a3180bc",
  "0x59dfA6edeFe31842439A01aaBD66e68CC92c6430",
  "0x64c9f29A2681C5c09f9e3cA03B7a5b178CAeAD59",
  "0x02Ef151f8376b9118b81c163BDf4906fF7EC4023",
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
