// src/components/MainContainer.tsx
'use client';

import React from 'react';
import CustomPrice from "../PriceOracle/Get/CustomPrice"
import GetAdmin from "../PriceOracle/Get/GetAdmin";
import GetAssetPrice from "../PriceOracle/Get/GetAssetPrice";
import GetPriceOracle from "../PriceOracle/Get/GetPriceOracle";
import ResetAssetPrice from "../PriceOracle/Set/ResetAssetPrice";
import SetCustomPrice from "../PriceOracle/Set/SetCustomPrice";
import SetPriceOracle from "../PriceOracle/Set/SetPriceOracle";


import App from '../connect';

const PriceOracle = () => {
  return (
    <div className="main-container">
    <App />
    <div className="grid-container">
      <div className="column1">
        <ResetAssetPrice />
        <SetCustomPrice />
        <SetPriceOracle />
      </div>
      <div className="column2">
        <CustomPrice />
        <GetAdmin />
        <GetAssetPrice />
        <GetPriceOracle />
      </div>
    </div>
  </div>
  );
}

export default PriceOracle;