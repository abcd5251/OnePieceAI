import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { baseSepolia } from "wagmi/chains";
import { useAccount, useReadContract } from "wagmi";
import {
  waitForTransactionReceipt,
  signTypedData,
  readContract,
} from "@wagmi/core";
import { ToastContainer, toast } from "react-toastify";

import {
  EXECUTOR,
  USDC,
  USDC_DECIMAL,
  PERMIT_EXPIRY,
  TYPES,
} from "../../helpers/constants";
import CurrencyInput from "../CurrencyInput";
import { config } from "../../config";
import { usdcAbi } from "../../abis/usdc";
import { execution } from "../../helpers/mock-backend";
import { createMorphoCall } from "../../helpers/strategy";
import { serializeAmount } from "../../helpers/utils";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface DepositFormData {
  deposit: {
    currency: string;
    amount: string;
  };
}

interface StakeScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StakeScreen({ isOpen, onClose }: StakeScreenProps) {
  const { control, handleSubmit } = useForm<DepositFormData>();
  const [inputValue, setinputValue] = useState(0);
  const { address } = useAccount();
  const { account, signAndSubmitTransaction } = useWallet();

  // async function onSubmit(data: DepositFormData) {
  //   const timestampInSeconds = Math.floor(Date.now() / 1000);
  //   const deadline = BigInt(timestampInSeconds) + BigInt(PERMIT_EXPIRY);
  //   const amount = serializeAmount(data.deposit.amount, USDC_DECIMAL);

  //   const nonce = await readContract(config, {
  //     abi: usdcAbi,
  //     address: USDC,
  //     functionName: "nonces",
  //     args: [address!],
  //   });

  //   const signature = await signTypedData(config, {
  //     domain: {
  //       name: "USDC",
  //       chainId: baseSepolia.id,
  //       verifyingContract: USDC,
  //       version: "2",
  //     },
  //     types: TYPES,
  //     primaryType: "Permit",
  //     message: {
  //       owner: address!,
  //       spender: EXECUTOR,
  //       value: amount,
  //       nonce: nonce!,
  //       deadline,
  //     },
  //   });

  //   const calls = await createMorphoCall(address!, amount, deadline, signature);
  //   const tx = await execution(address!, calls);

  //   console.log("Tx done");
  //   console.log("Call tx", tx);
  //   toast.promise(
  //     waitForTransactionReceipt(config, {
  //       hash: tx,
  //     }),
  //     {
  //       pending: "Transaction is pending...",
  //       success: `Transaction confirmed ! \n Tx hash: ${tx}`,
  //       error: "Transaction failed",
  //     }
  //   );
  // }

  async function onSubmit(data: DepositFormData) {
    const amount = serializeAmount(data.deposit.amount, 10 ** 8);

    console.log(amount.toString());

    const response = await signAndSubmitTransaction({
      sender: account!.address,
      data: {
        function:
          "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::deposit",
        typeArguments: ["0x1::aptos_coin::AptosCoin"],
        functionArguments: ["Main Account", amount.toString(), false],
      },
    });

    toast.success("Transaction sent");

    console.log(response);
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0  flex items-center justify-center z-50">
        <div className="bg-gray-900/80 absolute t-0 left-0 w-full h-full z-0"></div>
        <div className="bg-[#1E90FF] text-white rounded-lg shadow-lg p-6 w-[90vw] max-w-[600px] z-10 relative">
          {/* Header */}
          <div className="flex justify-center items-center border-b border-white pb-2">
            <div className="items-center">
              <span className="text-3xl inline-block">🛡️</span>
              <img src="/morpho/eventInfo.svg" className="h-6 inline-block" />
            </div>
            <img
              src="/morpho/cancel.svg"
              className="h-10 absolute -right-2 top-2 cursor-pointer"
              onClick={onClose}
            />
          </div>

          {/* Body */}
          <div className="mt-4 flex flex-col">
            <p
              className="text-xl text-center"
              style={{
                textShadow: " -2px 2.5px 0px #000000",
                WebkitTextFillColor: "white",
                WebkitTextStroke: "0.4px black",
              }}
            >
              Ready for this Strategy? Let's stake!
            </p>
            <div className="mt-4 flex items-center gap-x-2 justify-center">
              <div className="flex items-center">
                <img src="/aries/aries-logo-white.png" className="h-8" />
                <p className="bg-black pl-2 pr-3">ARIES MARKET </p>
              </div>
              <div className="flex justify-start items-center">
                <img src="/heart-icon.png" className="h-8 z-2"></img>
                <p className="bg-black ml-[-5px] pl-2 pr-3">
                  APY:
                  <span className="text-[#C689FF]">3.72%</span>
                </p>
              </div>
              <div>
                <p className="bg-black ml-[-5px] pl-2 pr-3 text-[#33FF6C]">
                  LOW RISK
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p>
                Once you confirm, your funds will be allocated automatically. No
                extra steps—just sit back and let the AI optimize for you
              </p>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-y-3"
            >
              <Controller
                name="deposit"
                control={control}
                rules={{
                  required: "Please enter an amount",
                  validate: {
                    positive: (value) =>
                      parseFloat(value.amount) > 0 ||
                      "Amount must be greater than 0",
                  },
                }}
                render={({ field }) => <CurrencyInput {...field} />}
              />
              <div className="self-center max-sm:mt-auto mt-5">
                <button type="submit">
                  <img
                    src="/Stake/confirm.svg"
                    className="h-16 mt-6 cursor-pointer"
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
    </>
  );
}
