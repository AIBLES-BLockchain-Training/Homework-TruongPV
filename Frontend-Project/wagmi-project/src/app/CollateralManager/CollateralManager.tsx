"use client";

import React from "react";
import GetAdmin from "./Get/GetAdmin";
import GetAddCollateral from "./Get/GetAddCollateral";
import GetAllValidCollateralToken from "./Get/GetAllValidCollateralToken";
import GetLTVLimit from "./Get/GetLTVLimit";
import GetBorrower from "./Get/GetBorrower";
import GetCollateralAsset from "./Get/GetCollateralAsset";
import GetAssetPrice from "./Get/GetAssetPrice";
import GetCollateralAmount from "./Get/GetCollateralAmount";
import GetTotalCollateralValue from "./Get/GetTotalCollateralValue";
import GetValidCollateralTokens from "./Get/GetValidCollateralToken";
import GetInterestRate from "./Get/GetInterestRate";
import GetIsApprovedCollateral from "./Get/GetIsApprovedCollateral";
import GetIsCollateralLocked from "./Get/GetIsCollateralLocked";
import GetLendingPool from "./Get/GetLendingPool";
import GetMockToken from "./Get/GetMockToken";
import GetPendingCollateralRequests from "./Get/GetPendingCollateralRequests";
import GetPriceOracle from "./Get/GetPriceOracle";
import GetValidCollateralTokenList from "./Get/GetValidCollateralTokenList";
import GetRemoveCollateralFee from "./Get/GetRemoveCollateralFee";
import AddCollateral from "./Set/AddCollateral";
import RemoveCollateral from "./Set/RemoveCollateral";
import ApproveCollateralRequest from "./Set/ApproveCollateralRequest";
import LockCollateral from "./Set/LockCollateral";
import RejectCollateralRequest from "./Set/RejectCollateralRequest";
import SetContractAddresses from "./Set/SetContractAddress";
import SetFees from "./Set/SetFees";
import SetLTVLimit from "./Set/SetLTVLimit";
import SubmitCollateralRequest from "./Set/SubmitCollateralRequest";
import UnlockCollateral from "./Set/UnLockCollateral";
import App from '../connect';

const CollateralManager = () => {
  return (
    <div className="main-container">
      {/* Page Header */}
      <div className="page-header fade-in">
        <h1 className="page-title">🔐 Collateral Manager</h1>
        <p className="page-description">
          Manage your collateral assets, lock/unlock positions, and monitor collateral health. 
          Secure your loans with approved crypto assets.
        </p>
      </div>

      {/* Wallet Connection */}
      <App />

      {/* Functions Grid */}
      <div className="grid-container">
        {/* Column 1 - Write Functions (Collateral Operations) */}
        <div className="column1">
          <div className="section-header">
            <h3>
              <span className="section-badge">Write</span>
              Collateral Operations
            </h3>
          </div>
          <AddCollateral />
          <RemoveCollateral />
          <LockCollateral />
          <UnlockCollateral />
          <SubmitCollateralRequest />
        </div>

        {/* Column 2 - Write Functions (Admin) */}
        <div className="column2">
          <div className="section-header">
            <h3>
              <span className="section-badge">Write</span>
              Admin Functions
            </h3>
          </div>
          <ApproveCollateralRequest />
          <RejectCollateralRequest />
          <SetContractAddresses />
          <SetFees />
          <SetLTVLimit />
        </div>

        {/* Column 3 - Read Functions (User Data) */}
        <div className="column3">
          <div className="section-header">
            <h3>
              <span className="section-badge">Read</span>
              User Collateral
            </h3>
          </div>
          <GetCollateralAmount />
          <GetTotalCollateralValue />
          <GetCollateralAsset />
          <GetIsCollateralLocked />
          <GetAddCollateral />
          <GetPendingCollateralRequests />
        </div>

        {/* Column 4 - Read Functions (Contract Data) */}
        <div className="column4">
          <div className="section-header">
            <h3>
              <span className="section-badge">Read</span>
              Contract Info
            </h3>
          </div>
          <GetAdmin />
          <GetBorrower />
          <GetLendingPool />
          <GetInterestRate />
          <GetPriceOracle />
          <GetMockToken />
          <GetLTVLimit />
          <GetRemoveCollateralFee />
          <GetIsApprovedCollateral />
          <GetValidCollateralTokens />
          <GetValidCollateralTokenList />
          <GetAllValidCollateralToken />
          <GetAssetPrice />
        </div>
      </div>
    </div>
  );
};

export default CollateralManager;
