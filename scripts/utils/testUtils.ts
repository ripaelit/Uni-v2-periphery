import {expect} from 'chai';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {UniswapV2Router02, ERC20} from '../../typechain';
import {BigNumber, Contract, ContractInterface} from 'ethers';
import hre from 'hardhat';
import fs from 'fs';
import { getTargetAddress } from './deployUtils';

export const queryAddLiquidity = async (
  acct: SignerWithAddress,
  router: UniswapV2Router02,
  tokenA: Contract,
  amountA: BigNumber,
  tokenB: Contract,
  amountB: BigNumber
) => {
  // console.log(`addLiquidity(${acct.address}, ${router.address}, ${tokenA.address}, ${amountA}, ${tokenB.address}, ${amountB})`)
  const result = await router.connect(acct).callStatic.addLiquidity(
    tokenA.address,
    tokenB.address,
    amountA,
    amountB,
    0,
    0,
    acct.address,
    10000000000
  );
  return result;
}

export const addLiquidity = async (
  acct: SignerWithAddress,
  router: UniswapV2Router02,
  tokenA: Contract,
  amountA: BigNumber,
  tokenB: Contract,
  amountB: BigNumber
) => {
  // console.log(`addLiquidity(${acct.address}, ${router.address}, ${tokenA.address}, ${amountA}, ${tokenB.address}, ${amountB})`)
  let tx = await router.connect(acct).addLiquidity(
    tokenA.address,
    tokenB.address,
    amountA,
    amountB,
    0,
    0,
    acct.address,
    10000000000
  )
  await tx.wait()
}

export const addLiquidityETH = async (
  acct: SignerWithAddress,
  router: UniswapV2Router02,
  token: ERC20,
  amountToken: BigNumber,
  amountETH: BigNumber
) => {
  let tx = await token.connect(acct).approve(router.address, amountToken)
  await tx.wait()
  tx = await router.connect(acct).addLiquidityETH(
    token.address,
    amountToken,
    0,
    0,
    acct.address,
    10000000000,
    {value: amountETH}
  )
  const receipt = await tx.wait()
  for (const event of receipt.events!) {
    if (event.event == "AddLiquidity") {
      console.log(`Event ${event.event} with args ${event.args}`)
    }
  }
}

// export const removeLiquidity = async (
//   acct: SignerWithAddress,
//   router: UniswapV2Router02,
//   factory: UniswapV2Factory,
//   tokenA: ERC20,
//   tokenB: ERC20,
//   liquidity: number
// ) => {
//   const pairAddress = await factory.getPair(tokenA.address, tokenB.address)
//   const pair = await ethers.getContractAt("ERC20", pairAddress)
//   let tx = await pair.connect(acct).approve(router.address, liquidity)
//   await tx.wait()
//   tx = await router.connect(acct).removeLiquidity(
//     tokenA.address,
//     tokenB.address,
//     liquidity,
//     0,
//     0,
//     acct.address,
//     10000000000
//   )
//   const receipt = await tx.wait()
//   for (const event of receipt.events!) {
//     if (event.event == "RemoveLiquidity") {
//       console.log(`Event ${event.event} with args ${event.args}`)
//     }
//   }
// }

export const querySwapExactTokensForTokens = async (
  acct: SignerWithAddress,
  router: UniswapV2Router02,
  tokenIn: Contract,
  amountIn: BigNumber,
  tokenOut: Contract
) => {
  const amounts = await router.connect(acct).callStatic.swapExactTokensForTokens(
    amountIn,
    0,
    [tokenIn.address, tokenOut.address],
    acct.address,
    10000000000
  )
  return amounts;
}

export const swapExactTokensForTokens = async (
  acct: SignerWithAddress,
  router: UniswapV2Router02,
  tokenIn: Contract,
  amountIn: BigNumber,
  tokenOut: Contract
) => {
  let tx = await router.connect(acct).swapExactTokensForTokens(
    amountIn,
    0,
    [tokenIn.address, tokenOut.address],
    acct.address,
    10000000000
  )
  await tx.wait()
}

export const swapTokensForExactTokens = async (
  acct: SignerWithAddress,
  router: UniswapV2Router02,
  tokenIn: ERC20,
  tokenOut: ERC20,
  amountOut: BigNumber
) => {
  const amountIn = await tokenIn.balanceOf(acct.address);
  let tx = await tokenIn.connect(acct).approve(router.address, amountIn);
  await tx.wait();
  tx = await router.connect(acct).swapTokensForExactTokens(
    amountOut,
    ethers.constants.MaxUint256,
    [tokenIn.address, tokenOut.address],
    acct.address,
    10000000000
  );
  const receipt = await tx.wait()
  for (const event of receipt.events!) {
    if (event.event == "Swap") {
      console.log(`Event ${event.event} with args ${event.args}`)
    }
  }
}

export const swapExactETHForTokens = async (
  acct: SignerWithAddress,
  router: UniswapV2Router02,
  weth: string,
  amountIn: BigNumber,
  token: ERC20
) => {
  let tx = await router.connect(acct).swapExactETHForTokens(
    0,
    [weth, token.address],
    acct.address,
    10000000000,
    {value: amountIn}
  )
  const receipt = await tx.wait()
  for (const event of receipt.events!) {
    if (event.event == "Swap") {
      console.log(`Event ${event.event} with args ${event.args}`)
    }
  }
}

export const swapETHForExactTokens = async (
  acct: SignerWithAddress,
  router: UniswapV2Router02,
  weth: string,
  token: ERC20,
  amountOut: BigNumber
) => {
  const amountIn = (await ethers.provider.getBalance(acct.address)).div(2);
  let tx = await router.connect(acct).swapETHForExactTokens(
    amountOut,
    [weth, token.address],
    acct.address,
    10000000000,
    {value: amountIn}
  )
  const receipt = await tx.wait()
  for (const event of receipt.events!) {
    if (event.event == "Swap") {
      console.log(`Event ${event.event} with args ${event.args}`)
    }
  }
}

export const swapExactTokensForETH = async (
  acct: SignerWithAddress,
  router: UniswapV2Router02,
  tokenIn: ERC20,
  amountIn: BigNumber,
  weth: string
) => {
  let tx = await tokenIn.connect(acct).approve(router.address, amountIn);
  await tx.wait();
  tx = await router.connect(acct).swapExactTokensForETH(
    amountIn,
    0,
    [tokenIn.address, weth],
    acct.address,
    10000000000
  );
  const receipt = await tx.wait()
  for (const event of receipt.events!) {
    if (event.event == "Swap") {
      console.log(`Event ${event.event} with args ${event.args}`)
    }
  }
}

export const swapTokensForExactETH = async (
  acct: SignerWithAddress,
  router: UniswapV2Router02,
  tokenIn: ERC20,
  weth: string,
  amountOut: BigNumber
) => {
  const amountIn = await tokenIn.balanceOf(acct.address);
  let tx = await tokenIn.connect(acct).approve(router.address, amountIn);
  await tx.wait();
  tx = await router.connect(acct).swapTokensForExactETH(
    amountOut,
    ethers.constants.MaxUint256,
    [tokenIn.address, weth],
    acct.address,
    10000000000
  );
  const receipt = await tx.wait()
  for (const event of receipt.events!) {
    if (event.event == "Swap") {
      console.log(`Event ${event.event} with args ${event.args}`)
    }
  }
}

export const parseUnits = (value:number, decimals:number) => {
  return ethers.utils.parseUnits(value.toFixed(decimals), decimals);
}

// export const quoteAddLiquidity = async (
//   router: UniswapV2Router02,
//   factory: UniswapV2Factory,
//   tokenA: ERC20,
//   amountA: BigNumber,
//   tokenB: ERC20,
//   amountB: BigNumber
// ) => {
//   const amountsQuote = await router.quoteAddLiquidity(tokenA.address, tokenB.address, amountA, amountB, 0, 0)
//   const amountInA = amountsQuote[0]
//   const amountInB = amountsQuote[1]
//   let liquidity
//   const pairAddress = await factory.getPair(tokenA.address, tokenB.address)
//   if (pairAddress == ethers.constants.AddressZero) {
//     const decimalsA = Number(await tokenA.decimals())
//     const decimalsB = Number(await tokenB.decimals())
//     const amountInAFormated = Number(ethers.utils.formatUnits(amountInA, decimalsA))
//     const amountInBFormated = Number(ethers.utils.formatUnits(amountInB, decimalsB))
//     liquidity = parseUnits(Math.sqrt(amountInAFormated * amountInBFormated), (decimalsA + decimalsB) / 2).sub(1000)
//   } else {
//     const FairSwapPair = await ethers.getContractFactory("FairSwapPair")
//     const pair = FairSwapPair.attach(pairAddress)
//     const reserves = await pair.getReserves()
//     const totalSupply = await pair.totalSupply()
//     liquidity = await pair.quoteMintLiquidity(amountA, amountB, reserves[0], reserves[1], totalSupply)
//   }
//   console.log("amountInA", amountInA.toString(), "amountInB", amountInB.toString(), "liquidity", liquidity.toString())
//   return [amountInA, amountInB, liquidity]
// }

export const poolInfo = async (
  context: string,
  factory: Contract,
  tokenInAddr: string,
  tokenOutAddr: string
) => {
  let [owner] = await ethers.getSigners();
  const tokenIn = await ethers.getContractAt('ERC20', tokenInAddr, owner);
  const tokenInName = await tokenIn.name();
  const tokenInDecimals = await tokenIn.decimals();
  const tokenOut = await ethers.getContractAt('ERC20', tokenOutAddr, owner);
  const tokenOutName = await tokenOut.name();
  const tokenOutDecimals = await tokenOut.decimals();

  let json = JSON.parse(fs.readFileSync(`abi/UniswapV2Pair.json`, 'utf-8'));
  let UniswapV2PairABI = json.abi;
  const pairAddr = await factory.getPair(tokenInAddr, tokenOutAddr);
  const pair = new Contract(pairAddr, UniswapV2PairABI, owner)
  const reserves = await pair.getReserves();
  const token0Addr = await pair.token0();
  const token1Addr = await pair.token1();
  let tokenInAmount;
  let tokenOutAmount;
  if (tokenInAddr == token0Addr && tokenOutAddr == token1Addr) {
    tokenInAmount = Number(ethers.utils.formatUnits(reserves[0], tokenInDecimals)).toFixed(3);
    tokenOutAmount = Number(ethers.utils.formatUnits(reserves[1], tokenOutDecimals)).toFixed(3);
  } else if (tokenInAddr == token1Addr && tokenOutAddr == token0Addr) {
    tokenInAmount = Number(ethers.utils.formatUnits(reserves[1], tokenInDecimals)).toFixed(3);
    tokenOutAmount = Number(ethers.utils.formatUnits(reserves[0], tokenOutDecimals)).toFixed(3);
  }
  
  let message: string = `\n        ${context}\n`;
  message = message + "        ------------------------\n";
  message = message + "        tkn names: " + tokenInName + ', ' + tokenOutName + "\n";
  message = message + "        tkn balances: " + tokenInAmount + ', ' + tokenOutAmount + "\n";
  message =
    message + "        tkn addresses: " + tokenInAddr + tokenOutAddr + "\n";
  message = message + "        ------------------------\n";
  console.log(message);
}

export const logEstimatedSwap = async (
  router: UniswapV2Router02,
  tokenInAddr: string,
  amountIn: BigNumber,
  tokenOutAddr: string,
  amountOut: BigNumber,
) => {
  let [owner] = await ethers.getSigners();
  const tokenIn = await ethers.getContractAt('ERC20', tokenInAddr, owner);
  const tokenInName = await tokenIn.name();
  const tokenInDecimals = await tokenIn.decimals();
  const tokenOut = await ethers.getContractAt('ERC20', tokenOutAddr, owner);
  const tokenOutName = await tokenOut.name();
  const tokenOutDecimals = await tokenOut.decimals();
  let amounts:any[] = [];
  if (amountIn.eq(0) && amountOut.gt(0)) {
    amounts = await router.getAmountsIn(amountOut, [tokenInAddr, tokenOutAddr])
    // console.log("Estimated swap:", tokenInAddr, tokenOutAddr, amounts[0].toString(), amounts[1].toString())
  } else if (amountIn.gt(0) && amountOut.eq(0)) {
    amounts = await router.getAmountsOut(amountIn, [tokenInAddr, tokenOutAddr])
    // console.log("Estimated swap:", tokenInAddr, tokenOutAddr, amounts[0].toString(), amounts[1].toString())
  }
  // console.log({amounts}, {tokenInDecimals}, {tokenOutDecimals})
  let amountsFormated:string[] = [];
  amountsFormated[0] = Number(ethers.utils.formatUnits(amounts[0], tokenInDecimals)).toFixed(3);
  amountsFormated[1] = Number(ethers.utils.formatUnits(amounts[1], tokenOutDecimals)).toFixed(3);
  // console.log({amountsFormated})
  let message: string = `\n        Query swap\n`;
  message = message + "        ------------------------\n";
  message = message + `        ${tokenInName} ${amountsFormated[0].toString()} ===> ${tokenOutName} ${amountsFormated[1].toString()}\n`;
  console.log(message);
}

export const logEstimatedUniV2Swap = async (
  acct: SignerWithAddress,
  routerAddress: string,
  UniswapV2Router02ABI: ContractInterface,
  tokenIn: string,
  amountIn: BigNumber,
  tokenOut: string,
  amountOut: BigNumber,
) => {
  console.log("logEstimatedUniV2Swap::")
  const router = new Contract(routerAddress, UniswapV2Router02ABI, acct)
  if (amountIn.eq(0) && amountOut.gt(0)) {
    const amounts = await router.getAmountsIn(amountOut, [tokenIn, tokenOut])
    console.log("Estimated univ2 swap:", tokenIn, tokenOut, amounts[0].toString(), amounts[1].toString())
  } else if (amountIn.gt(0) && amountOut.eq(0)) {
    const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut])
    console.log("Estimated univ2 swap:", tokenIn, tokenOut, amounts[0].toString(), amounts[1].toString())
  }
}

export const mintTestToken = async (
  toAddress:string,
  tokenAddress:string,
  amountFormated:string
) => {
  const network = hre.network.name;
  let [owner] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(owner.address);
  console.log(owner.address, {balance});

  let json = JSON.parse(fs.readFileSync(`abi/TestToken.json`, 'utf-8'));
  let TestTokenABI = json.abi
  const token = new Contract(tokenAddress, TestTokenABI, owner);
  const decimals = await token.decimals();
  const amountWei = ethers.utils.parseUnits(amountFormated, decimals);
  let tx = await token.connect(owner).mint(toAddress, amountWei);
  await tx.wait();
  const currBal = await token.balanceOf(toAddress);
  const routerAddr = getTargetAddress('../deployment.json', network, 'UniswapV2Router02');
  tx = await token.connect(owner).approve(routerAddr, currBal);
  await tx.wait();
  console.log("Current balance:", currBal.toString());
}