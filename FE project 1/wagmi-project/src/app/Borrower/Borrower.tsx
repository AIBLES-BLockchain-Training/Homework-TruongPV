// src/components/MainContainer.tsx
'use client';

import React from 'react';
import GetAdmin from "./Get/GetAdmin"; 
import GetBorrower from "./Get/GetBorrowerLoans";
import CaculateTotalRepayment from "./Get/CaculateTotalRepayment";
import CheckUpkeep from './Get/CheckUpkeep';
import GetCollateralManager from './Get/GetCollateralManager';
import CreateLoan from './Set/CreateLoan';
import GetFee from './Get/GetFee';
import GetAllLoanIds from './Get/GetAllLoanIds';
import GetCurrentVariables from './Get/GetCurrentVariableBorrowRate';
import GetLoanHealthFactor from './Get/GetLoanHealthFactor';
import GetInterestRate from './Get/GetInterestRate';
import GetLendingPool from './Get/GetLendingPool';
import GetLoanCount from './Get/GetLoanCount';
import GetLoanIdByIndex from './Get/GetLoanIdByIndex';
import GetLoanInfoByIndex from './Get/GetLoanInfoByIndex';
import PerformUpkeep from './Set/PerformUpkeep';
import GetPriceOracle from './Get/GetPriceOracle';
import Repay from './Set/RepayLoan';
import GetRickParams from './Get/GetRickParams';
import SetContractAddress from './Set/SetContractAddress';
import SetRickParams from './Set/SetRickParams';
import SetFee from './Set/SetFee';
import App from '../connect';
const Borrower = () => {
  return (
    <div className="main-container">
    <App />
    <div className="grid-container">
      <div className="column1">
       <CreateLoan />
         <PerformUpkeep />
         <Repay />
        <SetContractAddress />
        <SetRickParams />
        <SetFee />
      </div>
      <div className="column2">
        <GetAdmin />
        <GetBorrower />
        <CaculateTotalRepayment />
        <CheckUpkeep />
        <GetCollateralManager />
        <GetFee />
        <GetAllLoanIds />
        <GetCurrentVariables />
        <GetLoanHealthFactor />
        <GetInterestRate />
        <GetLendingPool />
        <GetLoanCount />
        <GetLoanIdByIndex />
        <GetLoanInfoByIndex />
        <GetPriceOracle />
        <GetRickParams />
      </div>
    </div>
  </div>
  );
}

export default Borrower;