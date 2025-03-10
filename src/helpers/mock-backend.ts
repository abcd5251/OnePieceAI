//! Only for dev environment

import type { Address, Hex } from 'viem';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sonic } from 'viem/chains';
import { parseSignature } from 'viem';

import { executorAbi } from '../abis/executor';
import { SONIC_EXECUTOR, VAULT } from './constants';
import { vaultAbi } from '../abis/vault';

const account = privateKeyToAccount(
  import.meta.env.VITE_ADMIN_PRIVATE_KEY as `0x${string}`,
);

const adminWallet = createWalletClient({
  chain: sonic,
  transport: http(),
  account,
});

export interface Call {
  target: Address;
  callData: Hex;
}

export async function deposit(
  owner: Address,
  spender: Address,
  value: bigint,
  deadline: bigint,
  signature: Hex,
) {
  const { v, r, s } = parseSignature(signature);
  const parseV = Number(v);

  const tx = await adminWallet.writeContract({
    abi: vaultAbi,
    address: VAULT,
    functionName: 'deposit',
    args: [owner, spender, value, deadline, parseV, r, s],
  });

  console.log('Deposit tx', tx);

  return tx;
}

export async function execution(user: Address, calls: Call[]) {
  //! remove const assertion on executorAbi
  const tx = await adminWallet.writeContract({
    abi: executorAbi,
    address: SONIC_EXECUTOR,
    functionName: 'execute',
    args: [calls, user],
  });

  console.log('Execution tx', tx);

  return tx;
}
