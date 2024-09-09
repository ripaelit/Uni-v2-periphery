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
import { defaultAbiCoder } from 'ethers/lib/utils';
import Univ2TradingEngine from '../utils/Univ2TradingEngine';
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
    it.skip('addLiquidity', async () => {
      const amountMKR = ethers.utils.parseUnits("100", decimalsMKR)
      const amountDAI = ethers.utils.parseUnits("100", decimalsDAI)
      await addLiquidity(owner, router, mkr, amountMKR, dai, amountDAI)
    });
    // it('addLiquidityETH - FUSDT/ETH', async () => {
    //   const amountFUSDT = ethers.utils.parseUnits("0.1", decimalsFUSDT);
    //   const amountETH = ethers.utils.parseEther("0.2");
    //   await addLiquidityETH(owner, router, fusdt, amountFUSDT, amountETH);
    // });
    it('query swap given in', async () => {
      const path = [mkr.address, dai.address];
      const payload = defaultAbiCoder.encode(['address[]'], [path]);
      await Univ2TradingEngine.queryTrade(owner, owner.address, mkr.address, '0.1', dai.address, '0', payload);
      // const amountMKR = ethers.utils.parseUnits("0.1", decimalsMKR)
      // await logEstimatedSwap(router, mkr.address, amountMKR, dai.address, BigNumber.from("0"))
    });
    it('swap given in', async () => {
      // const amountMKR = ethers.utils.parseUnits("0.1", decimalsMKR);
      // await poolInfo('before swap', factory, mkr.address, dai.address);
      // await swapExactTokensForTokens(owner, router, mkr, amountMKR, dai);
      // await poolInfo('after swap', factory, mkr.address, dai.address);
      const path = [mkr.address, dai.address];
      const payload = defaultAbiCoder.encode(['address[]'], [path]);
      await Univ2TradingEngine.queryBalance('Before Trade', owner.address, [mkr.address, dai.address]);
      await Univ2TradingEngine.executeTrade(owner, owner.address, mkr.address, '0.1', dai.address, '0', payload);
      await Univ2TradingEngine.queryBalance('After Trade', owner.address, [mkr.address, dai.address]);
    });
  });
});
