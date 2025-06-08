// src/components/MainContainer.tsx
'use client';

import React from 'react';
import GetLTVLimit from "./Get/LTVLimit";
import AddCollateral from "./Set/AddCollateral";
import GetAddCollateralFee from "./Get/GetAddCollateralFee";
import GetAdmin from "./Get/GetAdmin";
import ApproveCollateral from "./Set/ApproveCollateralRequest"
import GetBorrower from "./Get/GetBorrower";
import GetCollaCollateralAsset from "./Get/GetCollateralAssets";
import GetAllValidCollateralToken from "./Get/GetAllValidCollateralTokens";
import GetAssetPrice from "./Get/GetAssetPrice";
import GetCollateralAmount from "./Get/GetCollateralAmount";
import GetTotalCollatertalValue from "./Get/GetTotalCollateralValue";
import GetValidCollateralTokens from "./Get/GetValidCollateralTokens";
import GetInterestRate from "./Get/GetInterestRate";
import IsApprovedCollateral from "./Get/IsApprovedCollateral";
import IsCollatertalLocked from "./Get/IsCollateralLocked";
import GetLendingPool from "./Get/GetLendingPool";
import LockCollateral from "./Set/LockCollateral";
import GetMockToken from "./Get/GetMockToken";
import GetPendingCollateralRequests from "./Get/GetPendingCollateralRequest";
import GetPriceOracle from "./Get/GetPriceOracle";
import RejectCollateralRequest from './Set/RejectCollateralRequest';
import RemoveCollateral from './Set/RemoveCollateral';
import GetRemoveCollateralFee from './Get/GetRemoveCollateralFee';
import SetContractAddress from './Set/SetContractAddress';
import SetFees from './Set/SetFees';
import SetLTVLimit from './Set/SetLTVLimit';
import SubmitCollateralRequest from './Set/SubmitCollateralRequest';
import UnlockCollateral from './Set/UnLockCollateral';
import ValidCollateralTokenList from './Get/ValidCollateralTokenList';
import ValidCollateralToken from './Get/ValidCollateralTokens';
import App from '../connect';
const CollateralManager = () => {
  return (
    <div className="main-container">
    <App />
    <div className="grid-container">
      <div className="column1">
        <AddCollateral />
        <ApproveCollateral />
        <LockCollateral />
        <RejectCollateralRequest />
        <RemoveCollateral />
        <SetContractAddress />
        <SetFees />
        <SetLTVLimit />
        <SubmitCollateralRequest />
        <UnlockCollateral />
      </div>
      <div className="column2">
        <GetLTVLimit />
        <GetAddCollateralFee />
        <GetAdmin />
        <GetBorrower />
        <GetCollaCollateralAsset />
        <GetAllValidCollateralToken />
        <GetAssetPrice />
        <GetCollateralAmount />
        <GetTotalCollatertalValue />
        <GetValidCollateralTokens />
        <GetInterestRate />
        <IsApprovedCollateral />
        <IsCollatertalLocked />
        <GetLendingPool />
        <GetMockToken />
        <GetPendingCollateralRequests />
        <GetPriceOracle />
        <GetRemoveCollateralFee />
        <ValidCollateralTokenList />
        <ValidCollateralToken />
      </div>
    </div>
  </div>
  );
}

export default CollateralManager;