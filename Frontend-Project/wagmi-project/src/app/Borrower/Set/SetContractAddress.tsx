import React, { useState } from "react";
import { publicClient, walletClient } from "../../../client";
import { contract } from "../BorrowerAbi";
import { useAccount } from "wagmi";
import { Address } from "viem";
import "../Function.css";

const SetContractAddress = () => {
  const [lendingPool, setLendingPool] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [priceOracle, setPriceOracle] = useState("");
  const [collateralManager, setCollateralManager] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTxHash(null);
    setErrorMsg(null);

    if (!lendingPool || !interestRate || !priceOracle || !collateralManager) {
      alert("Please provide all contract addresses.");
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "setContractAddress",
        args: [lendingPool, interestRate, priceOracle, collateralManager],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      setTxHash(hash as string);
    } catch (error: any) {
      setErrorMsg("Error calling setContractAddress");
      console.error("Error calling setContractAddress:", error);
    }
  };

  return (
    <div className="form-container">
      <h2>Set Contract Address</h2>
      <form
        onSubmit={submit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="lendingPool" style={{ fontWeight: "bold" }}>
            Lending Pool Address
          </label>
          <input
            type="text"
            name="lendingPool"
            value={lendingPool}
            onChange={(e) => setLendingPool(e.target.value)}
            placeholder="0x..."
            style={{
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="interestRate" style={{ fontWeight: "bold" }}>
            Interest Rate Address
          </label>
          <input
            type="text"
            name="interestRate"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="0x..."
            style={{
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="priceOracle" style={{ fontWeight: "bold" }}>
            Price Oracle Address
          </label>
          <input
            type="text"
            name="priceOracle"
            value={priceOracle}
            onChange={(e) => setPriceOracle(e.target.value)}
            placeholder="0x..."
            style={{
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="collateralManager" style={{ fontWeight: "bold" }}>
            Collateral Manager Address
          </label>
          <input
            type="text"
            name="collateralManager"
            value={collateralManager}
            onChange={(e) => setCollateralManager(e.target.value)}
            placeholder="0x..."
            style={{
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            marginTop: "10px",
            background: "#c7b6f7",
            color: "#222",
            borderRadius: "6px",
            padding: "8px 16px",
            border: "none",
            fontWeight: "bold",
          }}
        >
          Set Contract Address
        </button>
      </form>
      {txHash && (
        <div className="result" style={{ marginTop: "12px" }}>
          <h6>Transaction Hash: {txHash}</h6>
        </div>
      )}
      {errorMsg && (
        <div className="error" style={{ marginTop: "12px" }}>
          <h6 style={{ color: "red" }}>{errorMsg}</h6>
        </div>
      )}
    </div>
  );
};

export default SetContractAddress;
