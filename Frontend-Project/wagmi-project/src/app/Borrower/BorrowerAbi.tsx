export const contract = {
  abi: [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "_id",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_borrower",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_assetAdddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_assetAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address[]",
          name: "_collateralAddresses",
          type: "address[]",
        },
      ],
      name: "LoanCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "loanId",
          type: "uint256",
        },
      ],
      name: "LoanIdRemovedFromBorrower",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "loanId",
          type: "uint256",
        },
      ],
      name: "LoanIdRemovedFromGlobalList",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "_id",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_borrower",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_assetAmount",
          type: "uint256",
        },
      ],
      name: "LoanLiquidated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "_id",
          type: "uint256",
        },
      ],
      name: "LoanRemoveId",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "_id",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_borrower",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_assetAmount",
          type: "uint256",
        },
      ],
      name: "LoanRepayed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "_assetaddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_liquidationThreshold",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_ltv",
          type: "uint256",
        },
      ],
      name: "RickParamsSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "_lendingPool",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_interestRate",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_priceOracle",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "_collateralManager",
          type: "address",
        },
      ],
      name: "SetContractAddress",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "_setFee",
          type: "uint256",
        },
      ],
      name: "setFeeEvent",
      type: "event",
    },
    {
      inputs: [],
      name: "admin",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "", type: "address" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      name: "borrowerLoans",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
      name: "calculateTotalRepayment",
      outputs: [
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      name: "checkUpkeep",
      outputs: [
        { internalType: "bool", name: "upkeepNeeded", type: "bool" },
        { internalType: "bytes", name: "performData", type: "bytes" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "collateralManager",
      outputs: [
        {
          internalType: "contract ICollateralManager",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_assetAdddress", type: "address" },
        { internalType: "uint256", name: "_assetAmount", type: "uint256" },
        {
          internalType: "address[]",
          name: "_collateralAddresses",
          type: "address[]",
        },
      ],
      name: "createLoan",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "fee",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllloanIds",
      outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_assetaddress", type: "address" },
      ],
      name: "getCurrentVariableBorrowRate",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_loanId", type: "uint256" }],
      name: "getLoanHealthFactor",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "interestRate",
      outputs: [
        { internalType: "contract IInterestRate", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "lendingPool",
      outputs: [
        { internalType: "contract ILendingPool", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "loanCount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "loanIds",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "loans",
      outputs: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "address", name: "borrower", type: "address" },
        { internalType: "address", name: "assetAdddress", type: "address" },
        { internalType: "uint256", name: "assetAmount", type: "uint256" },
        {
          internalType: "uint256",
          name: "variableBorrowIndex",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes", name: "performData", type: "bytes" }],
      name: "performUpkeep",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "priceOracle",
      outputs: [
        { internalType: "contract IPriceOracle", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "_id", type: "uint256" },
        { internalType: "uint256", name: "_amount", type: "uint256" },
      ],
      name: "repayLoan",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "rickParams",
      outputs: [
        {
          internalType: "uint256",
          name: "liquidationThreshold",
          type: "uint256",
        },
        { internalType: "uint256", name: "ltv", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_lendingPool", type: "address" },
        { internalType: "address", name: "_interestRate", type: "address" },
        { internalType: "address", name: "_priceOracle", type: "address" },
        {
          internalType: "address",
          name: "_collateralManager",
          type: "address",
        },
      ],
      name: "setContractAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_fee", type: "uint256" }],
      name: "setFee",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_assetaddress", type: "address" },
        {
          internalType: "uint256",
          name: "_liquidationThreshold",
          type: "uint256",
        },
        { internalType: "uint256", name: "_ltv", type: "uint256" },
      ],
      name: "setRickParams",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  address: "0x14E3066ad94Eacb96A77f3E062926d2a0d4Ba576",
};
