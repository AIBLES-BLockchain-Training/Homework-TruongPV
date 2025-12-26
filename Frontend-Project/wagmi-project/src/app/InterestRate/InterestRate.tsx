"use client";

import React from "react";
import GetAdmin from "./Get/GetAdmin";
import GetLendingPool from "./Get/GetLendingPool";
import GetBorrower from "./Get/GetBorrower";
import GetBorrowAPR from "./Get/GetBorrowAPR";
import GetBorrowAPY from "./Get/GetBorrowAPY";
import GetInterestRateParams from "./Get/GetInterestRateParams";
import GetReserveData from "./Get/GetReserveData";
import InitializeReserve from "./Set/InitializeReserve";
import GetInterestParams from "./Get/GetInterestParams";
import GetReserve from "./Get/GetReserve";
import SetContractAddress from "./Set/SetContractAddress";
import SetInterestParams from "./Set/SetInterestParams";
import UpdateInterestRate from "./Set/UpdateInterestRate";
import App from "../connect";

const InterestRate = () => {
  return (
    <div className="main-container">
      {/* Page Header */}
      <div className="page-header fade-in">
        <h1 className="page-title">📈 Interest Rate Management</h1>
        <p className="page-description">
          Configure dynamic interest rates, monitor APR/APY, and manage reserve parameters. 
          Interest rates adjust automatically based on pool utilization.
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
              Rate Configuration
            </h3>
          </div>
          <InitializeReserve />
          <SetContractAddress />
          <SetInterestParams />
          <UpdateInterestRate />
        </div>

        {/* Column 2 - Read Functions (Rates) */}
        <div className="column2">
          <div className="section-header">
            <h3>
              <span className="section-badge">Read</span>
              Interest Rates
            </h3>
          </div>
          <GetBorrowAPR />
          <GetBorrowAPY />
          <GetInterestParams />
          <GetInterestRateParams />
          <GetReserveData />
        </div>

        {/* Column 3 - Read Functions (Contract Info) */}
        <div className="column3">
          <div className="section-header">
            <h3>
              <span className="section-badge">Read</span>
              Contract Info
            </h3>
          </div>
          <GetAdmin />
          <GetLendingPool />
          <GetBorrower />
          <GetReserve />
        </div>
      </div>
    </div>
  );
};

export default InterestRate;
