import { ethers, network, run } from "hardhat"
import {chainIds, amoyData, mumbaiData, polygonData, WETH} from "../constants"
import { BigNumber, BigNumberish, Contract } from "ethers"
import fs from 'fs';
import hre from 'hardhat';

export const getTargetAddress = (fileName:string, network: string, contractName: string) => {
  let jsonObj;
  try {
    if (!fs.existsSync(fileName)) {
      jsonObj = Object.create({});
      jsonObj[network] = {};
      fs.writeFileSync(fileName, JSON.stringify(jsonObj));
      console.log(`Created ${fileName}`);
    }
  } catch (error) {
    throw(error);
  }
  jsonObj = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
  if (!jsonObj[network]) {
    throw new Error("Target is not found");
  }

  return jsonObj[network][contractName];
};

export const setTargetAddress = async (
  fileName: string,
  network: string,
  contractName: string,
  address: string
) => {
  let jsonObj;
  try {
    if (!fs.existsSync(fileName)) {
      jsonObj = Object.create({});
      jsonObj[network] = {};
      fs.writeFileSync(fileName, JSON.stringify(jsonObj));
      console.log(`Created ${fileName}`);
    }
  } catch (error) {
    throw(error);
  }

  try {
    jsonObj = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
    if (!jsonObj[network]) {
      jsonObj[network] = {};
    }
    jsonObj[network][contractName] = address;
    fs.writeFileSync(fileName, JSON.stringify(jsonObj));
    console.log(
      `${network} | ${contractName} | ${jsonObj[network][contractName]}`
    );
  } catch (error) {
    throw(error);
  }
};

export const deployFactory = async () => {
  try {
    const network = hre.network.name;
    let [deployer] = await ethers.getSigners();
    const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
    const feeToSetter = deployer.address;
    const factory = await UniswapV2Factory.deploy(feeToSetter, {
      gasPrice: await ethers.provider.getGasPrice()
    });
    await factory.deployed();
    const factoryAddress = factory.address;
    setTargetAddress('../deployment.json', network, 'UniswapV2Factory', factoryAddress);
    return factoryAddress;
  } catch (error) {
    throw(error);
  }
}

export const verifyContract = async (fileName:string, contractName:string, args:Array<any>) => {
  const network = hre.network.name;
  try {
    const contractAddr = getTargetAddress(fileName, network, contractName);
    await run(`verify:verify`, {
      address: contractAddr,
      constructorArguments: args,
    });
    console.log(`Verified ${contractName} in ${network}`);
  } catch (error) {
    throw(error);
  }
}

export const deployRouter = async () => {
  try {
    const network = hre.network.name;
    const factoryAddr = getTargetAddress('../deployment.json', network, 'UniswapV2Factory');
    const weth = WETH[network];
    if (!weth) {
      throw new Error(`WETH is not found in ${network}`)
    }
    const UniswapV2Router02 = await ethers.getContractFactory('UniswapV2Router02');
    const router = await UniswapV2Router02.deploy(
      factoryAddr,
      weth, {
        gasPrice: await ethers.provider.getGasPrice()
      }
    );
    await router.deployed();
    const routerAddress = router.address;
    setTargetAddress('../deployment.json', network, 'UniswapV2Router02', routerAddress);
    return routerAddress;
  } catch (error) {
    throw(error);
  }
}

export const deployAll = async (
  txIds:number[]
) => {
  let [deployer] = await ethers.getSigners();
  const network = hre.network.name;

  let factoryAddress:string = "";
  let routerAddress:string = "";

  // if (txIds.includes(1)) {
  //   factoryAddress = await deployFactory();
  //   console.log(`Success tx 1: Deployed Factory to ${factoryAddress}`);
  // } else {
  //   try {
  //     factoryAddress = getTargetAddress('../deployment.json', network, 'UniswapV2Factory');
  //   } catch (error) {
  //     throw(error);
  //   }
  // }

  // if (txIds.includes(2)) {
  //   try {
  //     const factory = await ethers.getContractAt("UniswapV2Factory", factoryAddress);
  //     let tx = await factory.setFeeTo(deployer.address, {
  //       gasPrice: await ethers.provider.getGasPrice()
  //     });
  //     await tx.wait();
  //     console.log(`Success tx 2: Set FeeTo ${deployer.address}`);
  //   } catch (error) {
  //     throw(error);
  //   }
  // }

  if (txIds.includes(3)) {
    try {
      routerAddress = await deployRouter();
      console.log(`Success tx 5: Deployed Router to ${routerAddress}`);
    } catch (error) {
      throw(error);
    }
  }
}

export const verifyAll = async () => {
  const network = hre.network.name;
  let [deployer] = await ethers.getSigners();

  // await verifyContract('../deployment.json', 'UniswapV2Factory', [deployer.address])
  
  const factoryAddr = getTargetAddress('../deployment.json', network, 'UniswapV2Factory');
  const weth = WETH[network];
    if (!weth) {
      throw new Error(`WETH is not found in ${network}`)
    }
  await verifyContract('../deployment.json', 'UniswapV2Router02', [factoryAddr, weth])
}