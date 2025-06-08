// src/components/MainContainer.tsx
'use client';

import React from 'react';
import GetLendingPool from "./Get/GetLendingPool";
import GetAdmin from "./Get/GetAdmin";
import GetBorrower from "./Get/GetBorrower";
import CalculateBorrowAPR from "./Get/CalculateBorrowAPR";
import CalculateBorrowAPY from "./Get/CalculateBorrowAPY";
import GetInterestRateParams from "./Get/GetInterestRateParams";
import GetReserveData from "./Get/GetReserveData";
import InitializeReserve from "./Set/InitializeReserve";
import GetInterestParams from "./Get/GetInterestParams";
import GetReserves from "./Get/GetReserves";
import SetContractAddress from "./Set/SetContractAddress";
import SetInterestParams from "./Set/SetInterestParams";
import UpdateInterestRate from "./Set/UpdateInterestRate";


import App from '../connect';
const InterestRate = () => {
  return (
    <div className="main-container">
    <App />
    <div className="grid-container">
      <div className="column1">
        <InitializeReserve />
        <SetContractAddress />
        <SetInterestParams />
        <UpdateInterestRate />
      </div>
      <div className="column2">
        <GetLendingPool />
        <GetAdmin />
        <GetBorrower />
        <CalculateBorrowAPR />
        <CalculateBorrowAPY />
        <GetInterestRateParams />
        <GetReserveData />
        <GetInterestParams />
        <GetReserves />
      </div>
    </div>
  </div>
  );
}

export default InterestRate;