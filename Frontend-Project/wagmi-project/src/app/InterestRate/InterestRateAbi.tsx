export const contract = {
  abi: [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "slope1",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "slope2",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "baseRate",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_utilizationOptimal",
          type: "uint256",
        },
      ],
      name: "InterestParamsSet",
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
          name: "_liquidityIndex",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_variableBorrowIndex",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_currentLiquidityRate",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_currentVariableBorrowRate",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_lastUpdateTimestamp",
          type: "uint256",
        },
      ],
      name: "ReserveDataUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "currentLiquidityRate",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "currentVariableBorrowRate",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "liquidityIndex",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "variableBorrowIndex",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "lastUpdateTimestamp",
          type: "uint256",
        },
      ],
      name: "ReserveInitialized",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "lendingPool",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "borrower",
          type: "address",
        },
      ],
      name: "SetContractAddress",
      type: "event",
    },
    {
      inputs: [],
      name: "LendingPool",
      outputs: [
        { internalType: "contract ILendingPool", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "admin",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "borrower",
      outputs: [
        { internalType: "contract IBorrower", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_tokenAddress", type: "address" },
      ],
      name: "calculateBorrowAPR",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_tokenAddress", type: "address" },
      ],
      name: "calculateBorrowAPY",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_tokenAddress", type: "address" },
      ],
      name: "getInterestRateParmas",
      outputs: [
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_tokenAddress", type: "address" },
      ],
      name: "getReserveData",
      outputs: [
        { internalType: "uint256", name: "liquidityIndex", type: "uint256" },
        {
          internalType: "uint256",
          name: "variableBorrowIndex",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "currentLiquidityRate",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "currentVariableBorrowRate",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_tokenAddress", type: "address" },
      ],
      name: "initializeReserve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "interestParams",
      outputs: [
        { internalType: "uint256", name: "slope1", type: "uint256" },
        { internalType: "uint256", name: "slope2", type: "uint256" },
        { internalType: "uint256", name: "baseRate", type: "uint256" },
        {
          internalType: "uint256",
          name: "utilizationOptimal",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "reserves",
      outputs: [
        { internalType: "uint256", name: "liquidityIndex", type: "uint256" },
        {
          internalType: "uint256",
          name: "variableBorrowIndex",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "currentLiquidityRate",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "currentVariableBorrowRate",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "lastUpdateTimestamp",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_lendingPool", type: "address" },
        { internalType: "address", name: "_borrower", type: "address" },
      ],
      name: "setContractAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_tokenAddress", type: "address" },
        { internalType: "uint256", name: "_slope1", type: "uint256" },
        { internalType: "uint256", name: "_slope2", type: "uint256" },
        { internalType: "uint256", name: "_baseRate", type: "uint256" },
        {
          internalType: "uint256",
          name: "_utilizationOptimal",
          type: "uint256",
        },
      ],
      name: "setInterestParams",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_tokenAddress", type: "address" },
      ],
      name: "updateInterestRate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  address: "0xb6FA5e41a9296176D3401F55232CDE3Ef6120c49",
};
