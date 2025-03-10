import { encodeFunctionData, toHex } from 'viem';
import type { Address, Hex } from 'viem';
import { readContract } from '@wagmi/core';
import { parseSignature, encodeAbiParameters } from 'viem';

import type { Call } from './mock-backend';

import { usdcAbi } from '../abis/usdc';
import {
  EXECUTOR,
  MORPHO_BLUE,
  MORPHO_WETH_USDC_MARKET,
  ROUTER,
  SONIC_EXECUTOR,
  stS,
  USDC,
} from './constants';
import { morphoAbi } from '../abis/morpho';
import { config } from '../config';
import { routeAbi } from '../abis/router';

export async function createSwapCall(
  user: Address,
  amount: bigint,
  deadline: bigint,
  signature: Hex,
) {
  const calls: Call[] = [];
  const { v, r, s } = parseSignature(signature);

  {
    if (v) {
      const data = encodeFunctionData({
        abi: usdcAbi,
        functionName: 'permit',
        args: [user, SONIC_EXECUTOR, amount, deadline, Number(v), r, s],
      });
      calls.push({
        target: stS,
        callData: data,
      });
    }
  }

  {
    const data = encodeFunctionData({
      abi: usdcAbi,
      functionName: 'transferFrom',
      args: [user, SONIC_EXECUTOR, amount],
    });
    calls.push({
      target: stS,
      callData: data,
    });
  }

  {
    const data = encodeFunctionData({
      abi: usdcAbi,
      functionName: 'approve',
      args: [ROUTER, amount],
    });
    calls.push({
      target: stS,
      callData: data,
    });
  }

  {
    const inputs: Hex[] = [];
    const path: Hex =
      '0xe5da20f15420ad15de0fa650600afc998bbe3955000001039e2fb66102314ce7b64ce5ce3e5183bc94ad38';
    const encodedData = encodeAbiParameters(
      [
        { name: 'user', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'path', type: 'bytes' },
        { name: 'payer', type: 'bool' },
      ],
      [user, amount, BigInt(0), path, true],
    );
    inputs.push(encodedData);

    const data = encodeFunctionData({
      abi: routeAbi,
      functionName: 'execute',
      args: ['0x00', inputs, amount],
    });
    calls.push({
      target: ROUTER,
      callData: data,
    });
  }

  return calls;
}

export async function createMorphoCall(
  user: Address,
  amount: bigint,
  deadline: bigint,
  signature: Hex,
) {
  const calls: Call[] = [];

  //* Step 1  USDC Permit
  {
    const data = encodeFunctionData({
      abi: usdcAbi,
      functionName: 'permit',
      args: [user, EXECUTOR, amount, deadline, signature],
    });
    calls.push({
      target: USDC,
      callData: data,
    });
  }

  //* Step 2  USDC Transfer to Executor
  {
    const data = encodeFunctionData({
      abi: usdcAbi,
      functionName: 'transferFrom',
      args: [user, EXECUTOR, amount],
    });
    calls.push({
      target: USDC,
      callData: data,
    });
  }

  //* Step 3 Approve to morpho blue
  {
    const data = encodeFunctionData({
      abi: usdcAbi,
      functionName: 'approve',
      args: [MORPHO_BLUE, amount],
    });
    calls.push({
      target: USDC,
      callData: data,
    });
  }

  //* Step 4  Supply USDC to morpho blue
  {
    const marketParams = await getMarketParams(MORPHO_WETH_USDC_MARKET);

    const data = encodeFunctionData({
      abi: morphoAbi,
      functionName: 'supply',
      args: [marketParams, amount, BigInt(0), user, toHex('')],
    });
    calls.push({
      target: MORPHO_BLUE,
      callData: data,
    });
  }

  return calls;
}

async function getMarketParams(marketId: Hex) {
  const [loanToken, collateralToken, oracle, irm, lltv] = await readContract(
    config,
    {
      abi: morphoAbi,
      address: MORPHO_BLUE,
      functionName: 'idToMarketParams',
      args: [marketId],
    },
  );

  return {
    loanToken,
    collateralToken,
    oracle,
    irm,
    lltv,
  };
}
