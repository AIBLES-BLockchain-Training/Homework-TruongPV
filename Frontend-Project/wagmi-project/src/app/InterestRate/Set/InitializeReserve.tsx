import React, { useState } from "react";
import { publicClient, walletClient } from "../../../client";
import { contract } from "../InterestRateAbi";
import { useAccount } from "wagmi";
import { Address } from "viem";
import "../Function.css";

const InitializeReserve: React.FC = () => {
  const [tokenAddress, setTokenAddress] = useState<string>("");
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
    if (!account.address) {
      setError("Vui lòng kết nối ví.");
      return;
    }
    setLoading(true);
    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "initializeReserve",
        args: [tokenAddress],
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
      <h2>Initialize Reserve</h2>
      <form onSubmit={submit}>
        <label htmlFor="tokenAddress">Token Address</label>
        <input
          type="text"
          name="tokenAddress"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="0x..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "Đang gửi..." : "Initialize"}
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

export default InitializeReserve;
