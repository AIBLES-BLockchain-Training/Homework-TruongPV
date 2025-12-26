"use client";

import React from "react";
import GetAdmin from "./Get/GetAdmin";
import GetBorrowerLoans from "./Get/GetBorrowerLoans";
import GetTotalRepayment from "./Get/GetTotalRepayment";
import GetCheckUpkeep from "./Get/GetCheckUpkeep";
import GetCollateralManager from "./Get/GetCollateralManager";
import CreateLoan from "./Set/CreateLoan";
import GetFee from "./Get/GetFee";
import GetAllLoans from "./Get/GetAllLoanIds";
import GetCurrentVariableBorrowRate from "./Get/GetCurrentVariableBorrowRate";
import GetLoanHealthFactor from "./Get/GetLoanHealthFactor";
import GetInterestRateAddress from "./Get/GetInterestRateAddress";
import GetLendingPoolAddress from "./Get/GetLendingPoolAddress";
import GetLoanCount from "./Get/GetLoanCount";
import GetLoanIdByIndex from "./Get/GetLoanIdByIndex";
import GetLoanInfoByIndex from "./Get/GetLoanInfoByIndex";
import PerformUpkeep from "./Set/PerformUpkeep";
import RepayLoan from "./Set/RepayLoan";
import GetPriceOracle from "./Get/GetPriceOracle";
import GetRickParams from "./Get/GetRickParams";
import SetContractAddress from "./Set/SetContractAddress";
import SetFee from "./Set/SetFee";
import SetRickParams from "./Set/SetRickParams";

import App from "../connect";

const Borrower = () => {
  return (
    <div className="main-container">
      {/* Page Header */}
      <div className="page-header fade-in">
        <h1 className="page-title">💰 Borrower Management</h1>
        <p className="page-description">
          Create loans, manage repayments, and monitor your borrowing positions. 
          All interactions are secured by smart contracts on the blockchain.
        </p>
      </div>

      {/* Wallet Connection */}
      <App />

      {/* Functions Grid */}
      <div className="grid-container">
        {/* Column 1 - Write Functions */}
        <div className="column1">
          <div className="section-header">
            <h3>
              <span className="section-badge">Write</span>
              Actions
            </h3>
          </div>
          <CreateLoan />
          <RepayLoan />
          <SetContractAddress />
          <SetFee />
          <SetRickParams />
          <PerformUpkeep />
        </div>

        {/* Column 2 - Read Functions (User Data) */}
        <div className="column2">
          <div className="section-header">
            <h3>
              <span className="section-badge">Read</span>
              User Information
            </h3>
          </div>
          <GetAdmin />
          <GetFee />
          <GetAllLoans />
          <GetLoanHealthFactor />
          <GetCurrentVariableBorrowRate />
          <GetBorrowerLoans />
          <GetTotalRepayment />
        </div>

        {/* Column 3 - Read Functions (Contract Data) */}
        <div className="column3">
          <div className="section-header">
            <h3>
              <span className="section-badge">Read</span>
              Contract Data
            </h3>
          </div>
          <GetCollateralManager />
          <GetInterestRateAddress />
          <GetLendingPoolAddress />
          <GetPriceOracle />
          <GetCheckUpkeep />
          <GetLoanCount />
          <GetLoanIdByIndex />
          <GetLoanInfoByIndex />
          <GetRickParams />
        </div>
      </div>
    </div>
  );
};

export default Borrower;
