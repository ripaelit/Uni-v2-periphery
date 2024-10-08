import {expect} from 'chai';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {ERC20, UniswapV2Router02} from '../../typechain';
import {addLiquidity, swapExactTokensForTokens, swapTokensForExactTokens, addLiquidityETH, swapExactETHForTokens, swapETHForExactTokens, swapExactTokensForETH, swapTokensForExactETH, logEstimatedSwap, logEstimatedUniV2Swap, poolInfo} from '../utils/testUtils';
import { polygonData } from '../constants';
import { BigNumber, Contract, ContractInterface } from 'ethers';
import fs from 'fs';
import { getTargetAddress } from '../utils/deployUtils';
import hre from "hardhat";
const network = hre.network.name;

describe(`UniswapV2Router02 on ${network}`, () => {
  let owner: SignerWithAddress;
  let router: UniswapV2Router02;
  let mkr: Contract;
  let dai: Contract;
  let snx: Contract;
  let bat: Contract;
  let decimalsMKR:number;
  let decimalsDAI:number;
  let decimalsSNX:number;
  let decimalsBAT:number;
  let UniswapV2FactoryABI:ContractInterface;
  let UniswapV2PairABI:ContractInterface;
  let TestTokenABI:ContractInterface;
  let factory: Contract;

  before(async () => {
    
    [owner] = await ethers.getSigners()

    const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02")
    router = UniswapV2Router02.attach(getTargetAddress('../deployment.json', network, 'UniswapV2Router02'));

    let json = JSON.parse(fs.readFileSync(`abi/UniswapV2Factory.json`, 'utf-8'))
    UniswapV2FactoryABI = json.abi
    factory = new Contract(getTargetAddress('../deployment.json', network, 'UniswapV2Factory'), UniswapV2FactoryABI, owner);

    json = JSON.parse(fs.readFileSync(`abi/UniswapV2Pair.json`, 'utf-8'))
    UniswapV2PairABI = json.abi

    json = JSON.parse(fs.readFileSync(`abi/TestToken.json`, 'utf-8'));
    TestTokenABI = json.abi
    mkr = new Contract(getTargetAddress('FTokens.json', network, 'MKR'), TestTokenABI, owner);
    dai = new Contract(getTargetAddress('FTokens.json', network, 'DAI'), TestTokenABI, owner);
    snx = new Contract(getTargetAddress('FTokens.json', network, 'SNX'), TestTokenABI, owner);
    bat = new Contract(getTargetAddress('FTokens.json', network, 'BAT'), TestTokenABI, owner);
    decimalsMKR = await mkr.decimals()
    decimalsDAI = await dai.decimals()
    decimalsSNX = await snx.decimals()
    decimalsBAT = await bat.decimals()
  });

  after(async () => {
  });

  describe(`Test UniswapV2Router02 on ${network}`, async () => {
    // it.skip('addLiquidity', async () => {
    //   const amountMKR = ethers.utils.parseUnits("100", decimalsMKR)
    //   const amountDAI = ethers.utils.parseUnits("100", decimalsDAI)
    //   await addLiquidity(owner, router, mkr, amountMKR, dai, amountDAI)
    // });
    // it('addLiquidityETH - FUSDT/ETH', async () => {
    //   const amountFUSDT = ethers.utils.parseUnits("0.1", decimalsFUSDT);
    //   const amountETH = ethers.utils.parseEther("0.2");
    //   await addLiquidityETH(owner, router, fusdt, amountFUSDT, amountETH);
    // });
    it('query swap given in', async () => {
      const amountMKR = ethers.utils.parseUnits("0.1", decimalsMKR)
      await logEstimatedSwap(router, mkr.address, amountMKR, dai.address, BigNumber.from("0"))
    });
    it('swap given in', async () => {
      const amountMKR = ethers.utils.parseUnits("0.1", decimalsMKR);
      await poolInfo('before swap', factory, mkr.address, dai.address);
      await swapExactTokensForTokens(owner, router, mkr, amountMKR, dai);
      await poolInfo('after swap', factory, mkr.address, dai.address);
    });
    // it('Exact FWBTC -> FWETH', async () => {
    //   const amountFWBTC = ethers.utils.parseUnits("1", decimalsFWBTC)
    //   await logEstimatedSwap(router, fwbtc.address, amountFWBTC, fweth.address, BigNumber.from("0"))
    //   await swapExactTokensForTokens(owner, router, fwbtc, amountFWBTC, fweth)
    // });
    // it('Exact FWETH -> FWBTC', async () => {
    //   const amountFWETH = ethers.utils.parseUnits("10", decimalsFWETH)
    //   await logEstimatedSwap(router, fweth.address, amountFWETH, fwbtc.address, BigNumber.from("0"))
    //   await swapExactTokensForTokens(owner, router, fweth, amountFWETH, fwbtc)
    // });
    // it('Exact FWETH -> FUSDT', async () => {
    //   const amountFWETH = ethers.utils.parseUnits("10", decimalsFWETH)
    //   await logEstimatedSwap(router, fweth.address, amountFWETH, fusdt.address, BigNumber.from("0"))
    //   await swapExactTokensForTokens(owner, router, fweth, amountFWETH, fusdt)
    // });
    // it('Exact FUSDT -> FWETH', async () => {
    //   const amountFUSDT = ethers.utils.parseUnits("10000", decimalsFUSDT)
    //   await logEstimatedSwap(router, fusdt.address, amountFUSDT, fweth.address, BigNumber.from("0"))
    //   await swapExactTokensForTokens(owner, router, fusdt, amountFUSDT, fweth)
    // });
    // it('Exact FUSDT -> FUSDC', async () => {
    //   const amountFUSDT = ethers.utils.parseUnits("10000", decimalsFUSDT)
    //   await logEstimatedSwap(router, fusdt.address, amountFUSDT, fusdc.address, BigNumber.from("0"))
    //   await swapExactTokensForTokens(owner, router, fusdt, amountFUSDT, fusdc)
    // });
    // it('Exact FUSDC -> FUSDT', async () => {
    //   const amountFUSDC = ethers.utils.parseUnits("10000", decimalsFUSDC)
    //   await logEstimatedSwap(router, fusdc.address, amountFUSDC, fusdt.address, BigNumber.from("0"))
    //   await swapExactTokensForTokens(owner, router, fusdc, amountFUSDC, fusdt)
    // });
    // it('FUSDT -> Exact FUSDC', async () => {
    //   const amountFUSDC = ethers.utils.parseUnits("10000", decimalsFUSDC)
    //   await logEstimatedSwap(router, fusdt.address, BigNumber.from("0"), fusdc.address, amountFUSDC)
    //   await swapTokensForExactTokens(owner, router, fusdt, fusdc, amountFUSDC)
    // });
    // it('Exact ETH -> FUSDT', async () => {
    //   const amountETH = ethers.utils.parseEther("0.02")
    //   await logEstimatedSwap(router, polygonData.wmatic, amountETH, fusdt.address, BigNumber.from("0"))
    //   await swapExactETHForTokens(owner, router, polygonData.wmatic, amountETH, fusdt)
    // });
    // it('ETH -> Exact FUSDT', async () => {
    //   const amountFUSDT = ethers.utils.parseUnits("0.01", decimalsFUSDT)
    //   await logEstimatedSwap(router, polygonData.wmatic, BigNumber.from("0"), fusdt.address, amountFUSDT)
    //   await swapETHForExactTokens(owner, router, polygonData.wmatic, fusdt, amountFUSDT)
    // });
    // it('Exact FUSDT -> ETH', async () => {
    //   const amountFUSDT = ethers.utils.parseUnits("0.01", decimalsFUSDT)
    //   await logEstimatedSwap(router, fusdt.address, amountFUSDT, polygonData.wmatic, BigNumber.from("0"))
    //   await swapExactTokensForETH(owner, router, fusdt, amountFUSDT, polygonData.wmatic)
    // });
    // it('FUSDT -> Exact ETH', async () => {
    //   const amountETH = ethers.utils.parseEther("0.02")
    //   await logEstimatedSwap(router, fusdt.address, BigNumber.from("0"), polygonData.wmatic, amountETH)
    //   await swapTokensForExactETH(owner, router, fusdt, polygonData.wmatic, amountETH)
    // });
    // // Compare with UniswapV2
    // it('Exact USDT -> USDC', async () => {
    //   const amountUSDT = ethers.utils.parseUnits("1", decimalsUSDT)
    //   await logEstimatedUniV2Swap(owner, polygonData.uniswapV2Router02, UniswapV2Router02ABI, usdt.address, amountUSDT, usdc.address, BigNumber.from("0"))
    //   await logEstimatedSwap(router, usdt.address, amountUSDT, usdc.address, BigNumber.from("0"))
    //   await swapExactTokensForTokens(owner, router, usdt, amountUSDT, usdc)
    // });
  });
});
