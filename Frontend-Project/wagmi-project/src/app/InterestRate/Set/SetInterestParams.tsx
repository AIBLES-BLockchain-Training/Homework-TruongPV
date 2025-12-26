import React, { useState } from "react";
import { publicClient, walletClient } from "../../../client";
import { contract } from "../InterestRateAbi";
import { useAccount } from "wagmi";
import { Address } from "viem";
import "../Function.css";

const SetInterestParams: React.FC = () => {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [slope1, setSlope1] = useState<string>("");
  const [slope2, setSlope2] = useState<string>("");
  const [baseRate, setBaseRate] = useState<string>("");
  const [utilizationOptimal, setUtilizationOptimal] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setTxHash("");
    if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      setError("Vui lòng nhập địa chỉ token hợp lệ.");
      return;
    }
    if (!slope1 || !slope2 || !baseRate || !utilizationOptimal) {
      setError("Vui lòng nhập đầy đủ các tham số.");
      return;
    }
    if (!account.address) {
      setError("Vui lòng kết nối ví.");
      return;
    }
    setLoading(true);
    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "setInterestParams",
        args: [
          tokenAddress,
          BigInt(slope1),
          BigInt(slope2),
          BigInt(baseRate),
          BigInt(utilizationOptimal),
        ],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      setTxHash(hash as string);
    } catch (err: any) {
      setError(err?.message || "Giao dịch thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Set Interest Params</h2>
      <form onSubmit={submit}>
        <label htmlFor="tokenAddress">Token Address</label>
        <input
          type="text"
          name="tokenAddress"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="0x..."
        />
        <label htmlFor="slope1">Slope 1</label>
        <input
          type="number"
          name="slope1"
          value={slope1}
          onChange={(e) => setSlope1(e.target.value)}
          placeholder="Slope 1"
        />
        <label htmlFor="slope2">Slope 2</label>
        <input
          type="number"
          name="slope2"
          value={slope2}
          onChange={(e) => setSlope2(e.target.value)}
          placeholder="Slope 2"
        />
        <label htmlFor="baseRate">Base Rate</label>
        <input
          type="number"
          name="baseRate"
          value={baseRate}
          onChange={(e) => setBaseRate(e.target.value)}
          placeholder="Base Rate"
        />
        <label htmlFor="utilizationOptimal">Utilization Optimal</label>
        <input
          type="number"
          name="utilizationOptimal"
          value={utilizationOptimal}
          onChange={(e) => setUtilizationOptimal(e.target.value)}
          placeholder="Utilization Optimal"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Đang gửi..." : "Set Params"}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {txHash && (
        <div className="result-group">
          <span>Tx Hash: {txHash}</span>
        </div>
      )}
    </div>
  );
};

export default SetInterestParams;
