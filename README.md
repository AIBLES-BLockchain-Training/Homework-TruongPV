# LENDING AND BORROWING

## Introduction
Welcome to Lending and Borrowing, a decentralized finance (DeFi) application where users can participate as depositors or borrowers. Depositors provide liquidity to the market to earn passive income, while borrowers can borrow collateralized assets. The platform is designed to manage loans, collateral, and interest rates in a decentralized and transparent system.

👉 Visit the website at: [https://demo-vercel-y98z.vercel.app/](https://vercel-sigma-livid.vercel.app/)
## Key Features
- **Price Oracle:** Price feeds and automation through Chainlink ensure data accuracy and reliable execution of contract functions.
- **Collateral Management:** The platform supports dynamic collateral management with real-time monitoring and liquidation mechanisms.
- **Lending Pool:** Users can deposit digital assets into the lending pool and earn interest over time.
- **Borrowing:** Users can borrow assets by providing collateral. The loan amount depends on the value of the collateral and the health factor.
- **Automated Interest Calculation:** Interest rates are calculated based on supply and demand, with automatic updates for lenders and borrowers.
- **Secure Liquidation:** If a loan's health factor drops below a certain threshold, the system triggers liquidation to protect lenders.

## Technology Stack
- **Smart Contracts:** Built on the Ethereum blockchain using Solidity.
- **Hardhat:** Development environment for writing and testing smart contracts.
- **Chainlink Oracles:** For fetching off-chain data such as asset prices.
- **ChainLink Automation:** Automate important tasks such as Health Factor Monitoring and Automatic Liquidation.
- **React:** Frontend framework for user interface and interaction.
- **Next.js:** Framework for building server-side rendering and static web applications.
- **Wagmi:** React hooks library for Ethereum, used for blockchain interactions.

## Usage
### Lending
1. Navigate to the "Lending Pool" section of the platform.
2. Select the asset you want to lend (View the allowed assets in 'Get Allowed Tokens' section).
3. Approve and deposit the desired amount into the lending pool.
4. Include the exact service fee (View in 'Get Service Fee' section).
5. Earn interest based on the pool's utilization rate.

### Add Collaterals
1. Navigate to the "Collateral Manager" section of the platform.
2. Select the asset you want to use as collateral (View the allowed assets in 'Get Allowed Tokens' section).
3. Approve and deposit your desired amount.
4. Include the exact service fee (View in 'Get Service Fee' section).
5. View your provided collateral and manage it dynamically.
6. If the health factor falls below 1, the system will automatically trigger liquidation to protect the loan.

### Borrowing
1. Navigate to the 'Borrower' section of the platform.
2. Choose the asset you wish to borrow (Refer to the allowed assets in the 'Get Allowed Tokens' section).
3. Input the desired borrowing amount.
4. Select the collateral address for the asset you'll be using as collateral.
5. Include the exact service fee (View in 'Get Service Fee' section).
6. The system will automatically calculate the Health Factor of the loan.
7. Proceed to borrow the asset and manage repayments as per the loan terms.

## License
This project is licensed under the MIT License. See the LICENSE file for details. 
