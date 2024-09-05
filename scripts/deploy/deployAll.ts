import {ethers} from 'hardhat'
import { deployAll } from '../utils/deployUtils';

export default async function main() {
  let [owner] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(owner.address);
  console.log(owner.address, {balance});

  // 3  Deploy UniswapV2Router02
  
  // const txIds:number[] = [3];
  const txIds:number[] = [3];
  await deployAll(txIds);
}

if (require.main === module) {
  main()
}
