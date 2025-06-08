// src/components/MainContainer.tsx
'use client';

import React from 'react';
import GetAdmin from "./Get/GetAdmin";
import GetAssetBalance from './Get/GetAssetBalance';
import GetBorrower from './Get/GetBorrower';
import GetCollateralManager from './Get/GetCollatertalManager';
import Deposit from './Set/Deposit';
import GetFee from './Get/GetFee';
import GetAllValidCollateralTokens from './Get/GetAllValidCollateralTokens';
import GetCurrentUtilizationRate from './Get/GetCurrrentUtilizationRate';
import GetTotalBalance from './Get/GetTotalBalance';
import GetInterestRate from './Get/GetInterestRate';
import IsApprovedCollateral from './Get/IsApprovedCollateral';
import LenderAssets from './Get/LenderAsset';
import GetPriceOracle from './Get/GetPriceOracle';
import SetContractAddress from './Set/SetContractAddress';
import SetFees from './Set/SetFee';
import GetFeeBalance from './Get/GetFeeBalance';
import GetTotalSupplied from './Get/GetTotalSupplied';
import GetTotalAssetCollateral from './Get/GetTotalAssetCollateral';
import GetTotalAssetSupplied from './Get/GetTotalAssetSupplied';
import TransferExcessAmount from './Set/TransferExcessAmount';
import TransferLoan from './Set/TransferLoan';
import Withdraw from './Set/Withdraw';
import WithdrawServiceFee from './Set/WithdrawServiceFee';

import App from '../connect';

const lendingPool = () => {
  return (
    <div className="main-container">
    <App />
    <div className="grid-container">
      <div className="column1">
       <Deposit />
        <SetContractAddress />
        <SetFees />
        <TransferExcessAmount />
        <TransferLoan />
        <Withdraw />
         <WithdrawServiceFee />
      </div>
      <div className="column2">
        <GetAdmin />
        <GetAssetBalance />
        <GetBorrower />
        <GetCollateralManager />
        <GetFee />
        <GetAllValidCollateralTokens />
        <GetCurrentUtilizationRate />
        <GetTotalBalance />
        <GetInterestRate />
        <IsApprovedCollateral />
        <LenderAssets />
        <GetPriceOracle />
        <GetFeeBalance />
        <GetTotalSupplied />
        <GetTotalAssetCollateral />
        <GetTotalAssetSupplied />
      </div>
    </div>
  </div>
  );
}

export default lendingPool;