"use client";

import React from "react";
import GetAdmin from "./Get/GetAdmin";
import SetCustomPrice from "./Set/SetCustomPrice";
import GetCustomPrice from "./Get/GetCustomPriceOracle";
import GetAssetPrice from "./Get/GetAssetPrice";
import SetPriceOracle from "./Set/SetPriceOracle";
import ResetAssetPrice from "./Set/ResetAssetPrice";
import GetAddressPriceOracle from "./Get/GetAddressPriceOracle";

import App from "../connect";

const PriceOracle = () => {
  return (
    <div className="main-container">
      {/* Page Header */}
      <div className="page-header fade-in">
        <h1 className="page-title">📊 Price Oracle</h1>
        <p className="page-description">
          Monitor real-time asset prices powered by Chainlink oracles. 
          Set custom prices for testing and manage price feed configurations.
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
              Price Management
            </h3>
          </div>
          <SetCustomPrice />
          <SetPriceOracle />
          <ResetAssetPrice />
        </div>

        {/* Column 2 - Read Functions */}
        <div className="column2">
          <div className="section-header">
            <h3>
              <span className="section-badge">Read</span>
              Price Data
            </h3>
          </div>
          <GetAdmin />
          <GetCustomPrice />
          <GetAssetPrice />
          <GetAddressPriceOracle />
        </div>
      </div>
    </div>
  );
};

export default PriceOracle;
