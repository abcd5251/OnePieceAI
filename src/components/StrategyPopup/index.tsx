import React, { useState } from "react";

interface StrategyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  setShowAIStrategy: (show: boolean) => void;
  setShowPopup: (show: boolean) => void;
  setShowStake: (show: boolean) => void;
}

export default function StrategyPopup({
  isOpen,
  onClose,
  setShowAIStrategy,
  setShowPopup,
  setShowStake,
}: StrategyPopupProps) {
  const [showMorpho, setShowMorpho] = useState(false);
  const handleAIStrategyClick = () => {
    setShowAIStrategy(true);
    setShowPopup(false);
  };
  const handleExecuteClick = () => {
    setShowStake(true);
    setShowPopup(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0  flex items-center justify-center z-50">
        <div className="bg-gray-900/80 absolute t-0 left-0 w-full h-full z-0"></div>
        <div className="bg-[#1E90FF] text-white rounded-lg shadow-lg p-6 w-[90vw] max-w-[600px] z-10 relative">
          {/* Header */}
          <div className="flex justify-center items-center border-b border-white pb-2">
            <div className="flex justify-center items-center">
              <span className="text-3xl inline-block">🛡️</span>
              Lending Strategy
            </div>
            <img
              src="/morpho/cancel.svg"
              className="h-10 absolute -right-2 top-2 cursor-pointer"
              onClick={onClose}
            />
          </div>

          {/* Body */}
          <div className="mt-4 relative">
            <div className="flex justify-start items-center">
              <img src="/aries/aries-logo-white.png" className="h-10" />
              <h3
                className="text-3xl ml-2"
                style={{
                  textShadow: " -2.5px 2px 0px #000000",
                  WebkitTextFillColor: "white",
                  WebkitTextStroke: "0.2px black",
                }}
              >
                Aries Markets
              </h3>
            </div>

            <div className="mt-4 flex justify-start items-center">
              <img src="/link-icon.png" className="h-8 z-2"></img>
              <p className="bg-black ml-[-5px] pl-2 pr-3">
                https://app-mobile.ariesmarkets.xyz
              </p>
            </div>

            <div className="mt-4">
              <p>
                Aries Markets is a decentralized exchange built on Move, it aims
                to aggregate and simplify the user experience across all of
                DeFi.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-x-2">
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

            {/* Action Section */}
            <div className="flex flex-col items-center gap-y-2">
              <img
                src="/morpho/AiButton.svg"
                onClick={handleAIStrategyClick}
                className="h-16 ml-1.5 cursor-pointer"
              />
              <img
                src="/morpho/deposit.svg"
                onClick={handleExecuteClick}
                className="h-16 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
