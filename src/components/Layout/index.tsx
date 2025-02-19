"use client";

// import { useAccount } from "wagmi";
import WelcomeScreen from "../WelcomeScreen";
import DefiScreen from "../DefiScreen";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Layout() {
  const [isDeposited, setIsDeposited] = useState(false);
  const { account } = useWallet();

  if (account?.address && isDeposited) {
    return <DefiScreen />;
  } else {
    // wallet not connected.
    return <WelcomeScreen setIsDeposited={setIsDeposited} />;
  }
}
