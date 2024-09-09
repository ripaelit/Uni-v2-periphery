import { defaultAbiCoder } from "@ethersproject/abi"
import hre, { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import { WETH, ERC20_ABI } from "../constants";
import routerData from "../../abi/UniswapV2Router02.json";
import fs from 'fs';

const getTargetAddress = (fileName:string, network: string, contractName: string) => {
  let jsonObj = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
  if (!jsonObj[network]) return undefined;

  return jsonObj[network][contractName];
};

export default {
  async queryBalance(
    context: string,
    userAddr: string,
    assets: string[]
  ): Promise<void> {
    let title: string = `queryBalance\n`;
    let message: string = ``;
    message = message + `        context: ${context}\n`;
    message = message + `        userAddr: ${userAddr}\n`;
    message = message + `        assets: ${assets}\n`;
    this.logMessage('log_univ2.txt', title, message);

    try {
      const [deployer, lp, recipient, admin] = await ethers.getSigners();
      let tokenNames: string[] = [];
      let tokenBalances: string[] = [];
      for (let asset of assets) {
        const token = new Contract(asset, ERC20_ABI, deployer);
        const name = await token.name();
        const decimals = await token.decimals();
        const balance = await token.balanceOf(userAddr);
        const balanceFormated = ethers.utils.formatUnits(balance, decimals);
        tokenNames.push(name);
        tokenBalances.push(balanceFormated);
      }
      message = `Success\n        token balances: ${tokenBalances.join(', ')}\n`;
    } catch (error) {
      message = `Failed due to ${error}\n`
    }

    message = message + `------------------------------------------------------------\n\n`;
    this.logMessage('log_univ2.txt', '', message);
  },
  
  async queryTrade(
    sender: SignerWithAddress,
    recipientAddr: string,
    assetIn: string,
    amountIn: string,
    assetOut: string,
    amountOut: string,
    payload: string
  ): Promise<void> {
    const network = hre.network.name;
    const decodedPayload = defaultAbiCoder.decode(['address[]'], payload);
    const path:string[] = decodedPayload[0];
    let title: string = `queryTrade\n`;
    let message: string = ``;
    message = message + `        sender: ${sender.address}\n`;
    message = message + `        recipient: ${recipientAddr}\n`;
    message = message + `        assetIn: ${assetIn}\n`;
    message = message + `        amountIn: ${amountIn}\n`;
    message = message + `        assetOut: ${assetOut}\n`;
    message = message + `        amountOut: ${amountOut}\n`;
    message = message + `        path: ${path.join(`->`)}\n`;
    this.logMessage('log_univ2.txt', title, message);

    try {
      const weth = WETH[network];
      if (!weth) {
        throw new Error(`WETH is not definded in ${network}`);
      }
      const routerAddr = getTargetAddress('../deployment.json', network, 'UniswapV2Router02');
      const Router_ABI = routerData.abi;
      const router = new Contract(routerAddr, Router_ABI, sender);
      const tokenIn = new Contract(assetIn, ERC20_ABI, sender);
      const tokenOut = new Contract(assetOut, ERC20_ABI, sender);
      const decimalsIn = await tokenIn.decimals();
      const decimalsOut = await tokenOut.decimals();
      const amountInWei = ethers.utils.parseUnits(amountIn, decimalsIn);
      const amountOutWei = ethers.utils.parseUnits(amountOut, decimalsOut);
      const deadline = ethers.constants.MaxUint256;
      let amounts:BigNumber[] = [];
      
      if (Number(amountIn) > 0 && Number(amountOut) == 0) {
        if (assetIn == weth && assetOut != weth) {
          // Exact ETH => Tokens
          amounts = await router.connect(sender).callStatic.swapExactETHForTokens(
            0,
            path,
            // [weth, assetOut],
            recipientAddr,
            deadline
          );
        } else if (assetIn != weth && assetOut == weth) {
          // Exact Tokens => ETH
          amounts = await router.connect(sender).callStatic.swapExactTokensForETH(
            amountInWei,
            0,
            path,
            // [assetIn, weth],
            recipientAddr,
            deadline
          );
        } else {
          // Exact Tokens => Tokens
          console.log(`Exact tokens => tokens`)
          amounts = await router.connect(sender).callStatic.swapExactTokensForTokens(
            amountInWei,
            0,
            path,
            // [assetIn, assetOut],
            recipientAddr,
            deadline
          );
        }
        // amountTo = ethers.utils.formatUnits(amounts[1], decimalsOut);
      } else if (Number(amountIn) == 0 && Number(amountOut) > 0) {
        if (assetIn == weth && assetOut != weth) {
          // ETH => Exact Tokens
          amounts = await router.connect(sender).callStatic.swapETHForExactTokens(
            amountOutWei,
            path,
            // [weth, assetOut],
            recipientAddr,
            deadline
          )
        } else if (assetIn != weth && assetOut == weth) {
          // Tokens => Exact ETH
          amounts = await router.connect(sender).callStatic.swapTokensForExactETH(
            amountOutWei,
            ethers.constants.MaxUint256,
            path,
            // [assetIn, weth],
            recipientAddr,
            deadline
          );
        } else {
          // Tokens => Exact Tokens
          amounts = await router.connect(sender).callStatic.swapTokensForExactTokens(
            amountOutWei,
            ethers.constants.MaxUint256,
            path,
            // [assetIn, assetOut],
            recipientAddr,
            deadline
          );
        }
        // amountTo = ethers.utils.formatUnits(amounts[0], decimalsIn);
      } else {
        throw new Error(`Invalid amounts ${amountIn}, ${amountOut}`);
      }
      let amountInFormated = ethers.utils.formatUnits(amounts[0], decimalsIn);
      let amountOutFormated = ethers.utils.formatUnits(amounts[1], decimalsOut);

      message = `Success\n`;
      message = message + `        amountInQueried: ${amountInFormated}\n`;
      message = message + `        amountOutQueried: ${amountOutFormated}\n`;
    } catch (error) {
      message = `Failed due to ${error}\n`
    }

    message = message + `------------------------------------------------------------\n\n`;
    this.logMessage('log_univ2.txt', '', message);
  },
  
  async executeTrade(
    sender: SignerWithAddress,
    recipientAddr: string,
    assetIn: string,
    amountIn: string,
    assetOut: string,
    amountOut: string,
    payload: string
  ): Promise<void> {
    const network = hre.network.name;
    const decodedPayload = defaultAbiCoder.decode(['address[]'], payload);
    const path:string[] = decodedPayload[0];
    let title: string = `executeTrade\n`;
    let message: string = ``;
    message = message + `        sender: ${sender.address}\n`;
    message = message + `        recipient: ${recipientAddr}\n`;
    message = message + `        assetIn: ${assetIn}\n`;
    message = message + `        amountIn: ${amountIn}\n`;
    message = message + `        assetOut: ${assetOut}\n`;
    message = message + `        amountOut: ${amountOut}\n`;
    message = message + `        path: ${path.join(`->`)}\n`;
    this.logMessage('log_univ2.txt', title, message);

    try {
      const weth = WETH[network];
      if (!weth) {
        throw new Error(`WETH is not definded in ${network}`);
      }
      const routerAddr = getTargetAddress('../deployment.json', network, 'UniswapV2Router02');
      const Router_ABI = routerData.abi;
      const router = new Contract(routerAddr, Router_ABI, sender);
      const tokenIn = new Contract(assetIn, ERC20_ABI, sender);
      const tokenOut = new Contract(assetOut, ERC20_ABI, sender);
      const decimalsIn = await tokenIn.decimals();
      const decimalsOut = await tokenOut.decimals();
      const amountInWei = ethers.utils.parseUnits(amountIn, decimalsIn);
      const amountOutWei = ethers.utils.parseUnits(amountOut, decimalsOut);
      const deadline = ethers.constants.MaxUint256;
      
      if (Number(amountIn) > 0 && Number(amountOut) == 0) {
        if (assetIn == weth && assetOut != weth) {
          // Exact ETH => Tokens
          let tx = await router.connect(sender).swapExactETHForTokens(
            0,
            path,
            // [weth, assetOut],
            recipientAddr,
            deadline, {
              gasPrice: await ethers.provider.getGasPrice(),
              value: amountInWei
            }
          );
          await tx.wait();
        } else if (assetIn != weth && assetOut == weth) {
          // Exact Tokens => ETH
          let tx = await router.connect(sender).swapExactTokensForETH(
            amountInWei,
            0,
            path,
            // [assetIn, weth],
            recipientAddr,
            deadline, {
              gasPrice: await ethers.provider.getGasPrice()
            }
          );
          await tx.wait()
        } else {
          // Exact Tokens => Tokens
          let tx = await router.connect(sender).swapExactTokensForTokens(
            amountInWei,
            0,
            path,
            // [assetIn, assetOut],
            recipientAddr,
            deadline, {
              gasPrice: await ethers.provider.getGasPrice()
            }
          );
          await tx.wait();
        }
      } else if (Number(amountIn) == 0 && Number(amountOut) > 0) {
        if (assetIn == weth && assetOut != weth) {
          // ETH => Exact Tokens
          let tx = await router.connect(sender).swapETHForExactTokens(
            amountOutWei,
            path,
            // [weth, assetOut],
            recipientAddr,
            deadline, {
              gasPrice: await ethers.provider.getGasPrice(),
              value: amountInWei
            }
          )
          await tx.wait()
        } else if (assetIn != weth && assetOut == weth) {
          // Tokens => Exact ETH
          let tx = await router.connect(sender).swapTokensForExactETH(
            amountOutWei,
            ethers.constants.MaxUint256,
            path,
            // [assetIn, weth],
            recipientAddr,
            deadline, {
              gasPrice: await ethers.provider.getGasPrice()
            }
          );
          await tx.wait()
        } else {
          // Tokens => Exact Tokens
          let tx = await router.connect(sender).swapTokensForExactTokens(
            amountOutWei,
            ethers.constants.MaxUint256,
            path,
            // [assetIn, assetOut],
            recipientAddr,
            deadline, {
              gasPrice: await ethers.provider.getGasPrice()
            }
          );
          await tx.wait();
        }
      } else {
        throw new Error(`Invalid amounts ${amountIn}, ${amountOut}`);
      }

      message = `Success\n`;
    } catch (error) {
      message = `Failed due to ${error}\n`
    }

    message = message + `------------------------------------------------------------\n\n`;
    this.logMessage('log_univ2.txt', '', message);
  },

  logMessage(fileName: string, title: string, message: string) {
    try {
      const network = hre.network.name;
      let date = new Date();
      let dateStr = `${date.getFullYear()}.${date.getMonth()+1}.${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${network} - `;

      if (!fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, "");
      }
      let fileContent = fs.readFileSync(fileName, 'utf-8');
      title = dateStr + title;
      fileContent = fileContent + title + message;
      fs.writeFileSync(fileName, fileContent);
    } catch (error) {
      console.log({error})
    }
  }
}
