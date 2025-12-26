"use client";

import React from "react";
import GetAdmin from "./Get/GetAdmin";
import GetAssetBalance from "./Get/GetAssetBalance";
import GetBorrower from "./Get/GetBorrower";
import GetCollatertalManager from "./Get/GetCollateralManager";
import Deposit from "./Set/Deposit";
import GetFee from "./Get/GetFee";
import GetAllValidCollateralTokens from "./Get/GetAllValidCollateralTokens";
import GetCurrentUtilizationRate from "./Get/GetCurrentUtilizationRate";
import GetTotalBalance from "./Get/GetTotalBalance";
import GetInterestRate from "./Get/GetInterestRate";
import IsApprovedCollateral from "./Get/IsApprovedCollateral";
import GetLenderAssets from "./Get/GetLenderAssets";
import GetPriceOracle from "./Get/GetPriceOracle";
import SetContractAddress from "./Set/SetContractAddress";
import SetFee from "./Set/SetFee";
import GetSetFeeBalance from "./Get/GetSetFeeBalance";
import GetTotalSupplied from "./Get/GetTotalSupplied";
import GetTotalAssetCollateral from "./Get/GetTotalAssetCollateral";
import GetTotalAssetSupplied from "./Get/GetTotalAssetSupplied";
import TransferExcessAmount from "./Set/TransferExcessAmount";
import TransferLoan from "./Set/TransferLoan";
import Withdraw from "./Set/Withdraw";
import WithdrawServiceFee from "./Set/WithdrawServiceFee";

import App from "../connect";

const LendingPool = () => {
  return (
    <div className="main-container">
      {/* Page Header */}
      <div className="page-header fade-in">
        <h1 className="page-title">🏦 Lending Pool</h1>
        <p className="page-description">
          Deposit assets to earn interest, withdraw liquidity, and manage your lending positions. 
          Monitor pool utilization and track your earnings in real-time.
        </p>
      </div>

      {/* Wallet Connection */}
      <App />

      {/* Functions Grid */}
      <div className="grid-container">
        {/* Column 1 - Write Functions (User Operations) */}
        <div className="column1">
          <div className="section-header">
            <h3>
              <span className="section-badge">Write</span>
              Lender Operations
            </h3>
          </div>
          <Deposit />
          <Withdraw />
          <TransferLoan />
        </div>

        {/* Column 2 - Write Functions (Admin) */}
        <div className="column2">
          <div className="section-header">
            <h3>
              <span className="section-badge">Write</span>
              Admin Functions
            </h3>
          </div>
          <SetContractAddress />  
          <SetFee />
          <TransferExcessAmount />
          <WithdrawServiceFee />
        </div>

        {/* Column 3 - Read Functions (User Data) */}
        <div className="column3">
          <div className="section-header">
            <h3>
              <span className="section-badge">Read</span>
              User Assets
            </h3>
          </div>
          <GetLenderAssets />
          <GetAssetBalance />
          <IsApprovedCollateral />
          <GetTotalAssetSupplied />
          <GetTotalAssetCollateral />
        </div>

        {/* Column 4 - Read Functions (Pool Data) */}
        <div className="column4">
          <div className="section-header">
            <h3>
              <span className="section-badge">Read</span>
              Pool Statistics
            </h3>
          </div>
          <GetAdmin />
          <GetBorrower />
          <GetCollatertalManager />
          <GetInterestRate />
          <GetPriceOracle />
          <GetFee />
          <GetAllValidCollateralTokens />
          <GetCurrentUtilizationRate />
          <GetTotalBalance />
          <GetSetFeeBalance />
          <GetTotalSupplied />
        </div>
      </div>
    </div>
  );
};

export default LendingPool;
