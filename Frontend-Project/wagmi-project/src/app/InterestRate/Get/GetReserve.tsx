import React, { useState } from "react";
import { publicClient } from "../../../client";
import { contract } from "../InterestRateAbi";
import { useAccount } from "wagmi";
import { Address } from "viem";
import "../Function.css";

const GetReserve: React.FC = () => {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [reserve, setReserve] = useState<{
    liquidityIndex: string;
    variableBorrowIndex: string;
    currentLiquidityRate: string;
    currentVariableBorrowRate: string;
    lastUpdateTimestamp: string;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const account = useAccount();

  const getReserve = async () => {
    setError("");
    setReserve(null);
    if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      setError("Vui lòng nhập địa chỉ token hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      const result = await publicClient.readContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "reserves",
        args: [tokenAddress],
      });
      const arr = result as unknown as [bigint, bigint, bigint, bigint, bigint];
      setReserve({
        liquidityIndex: arr[0].toString(),
        variableBorrowIndex: arr[1].toString(),
        currentLiquidityRate: arr[2].toString(),
        currentVariableBorrowRate: arr[3].toString(),
        lastUpdateTimestamp: arr[4].toString(),
      });
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi truy vấn dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Get Reserve</h2>
      <div className="input-group">
        <label htmlFor="tokenAddress">Token Address</label>
        <input
          type="text"
          name="tokenAddress"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="0x..."
        />
      </div>
      <button type="button" onClick={getReserve} disabled={loading}>
        {loading ? "Đang truy vấn..." : "Get Reserve"}
      </button>
      {error && <div className="error-message">{error}</div>}
      {reserve && (
        <div className="result-group">
          <div>liquidityIndex: {reserve.liquidityIndex}</div>
          <div>variableBorrowIndex: {reserve.variableBorrowIndex}</div>
          <div>currentLiquidityRate: {reserve.currentLiquidityRate}</div>
          <div>currentVariableBorrowRate: {reserve.currentVariableBorrowRate}</div>
          <div>lastUpdateTimestamp: {reserve.lastUpdateTimestamp}</div>
        </div>
      )}
    </div>
  );
};

export default GetReserve;
