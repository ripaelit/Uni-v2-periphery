import { ethers } from 'hardhat';
import { addLiquidity } from '../utils/testUtils';
import { getTargetAddress } from '../utils/deployUtils';
import hre from "hardhat";
import fs from 'fs';
import { Contract } from 'ethers';

// Input token addresses and amounts
const tokenAAddr = '0x94C7d9644A8C8D8F5131AdF91d64271cF7691358';
const tokenBAddr = '0x6fcd44e2200DfA9eC5546d95965DC59f5DD0553f';
const amountA = '100';
const amountB = '100';

export default async function main() {
  const network = hre.network.name;
  let [owner] = await ethers.getSigners();
  const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02");
  const routerAddress = getTargetAddress('../deployment.json', network, 'UniswapV2Router02');
  let router = UniswapV2Router02.attach(routerAddress);
  let json = JSON.parse(fs.readFileSync(`abi/TestToken.json`, 'utf-8'));
  let TestTokenABI = json.abi;
  let tokenA = new Contract(tokenAAddr, TestTokenABI, owner);
  let tokenB = new Contract(tokenBAddr, TestTokenABI, owner);
  let decimalsA = await tokenA.decimals();
  let decimalsB = await tokenB.decimals();
  const amountAWei = ethers.utils.parseUnits(amountA, decimalsA);
  const amountBWei = ethers.utils.parseUnits(amountB, decimalsB);
  await addLiquidity(owner, router, tokenA, amountAWei, tokenB, amountBWei);
}

if (require.main === module) {
  main()
}
