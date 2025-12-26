import React, { useState } from "react";
import { publicClient } from "../../../client";
import { contract } from "../InterestRateAbi";
import { useAccount } from "wagmi";
import { Address } from "viem";
import "../Function.css";

const GetInterestParams: React.FC = () => {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [params, setParams] = useState<{
    slope1: string;
    slope2: string;
    baseRate: string;
    utilizationOptimal: string;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const account = useAccount();

  const getParams = async () => {
    setError("");
    setParams(null);
    if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      setError("Vui lòng nhập địa chỉ token hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      const result = await publicClient.readContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "interestParams",
        args: [tokenAddress],
      });
      const arr = result as unknown as [bigint, bigint, bigint, bigint];
      setParams({
        slope1: arr[0].toString(),
        slope2: arr[1].toString(),
        baseRate: arr[2].toString(),
        utilizationOptimal: arr[3].toString(),
      });
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi truy vấn dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Get Interest Params</h2>
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
      <button type="button" onClick={getParams} disabled={loading}>
        {loading ? "Đang truy vấn..." : "Get Params"}
      </button>
      {error && <div className="error-message">{error}</div>}
      {params && (
        <div className="result-group">
          <div>slope1: {params.slope1}</div>
          <div>slope2: {params.slope2}</div>
          <div>baseRate: {params.baseRate}</div>
          <div>utilizationOptimal: {params.utilizationOptimal}</div>
        </div>
      )}
    </div>
  );
};

export default GetInterestParams;
