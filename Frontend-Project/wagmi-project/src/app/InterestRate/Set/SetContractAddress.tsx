import React, { useState } from "react";
import { publicClient, walletClient } from "../../../client";
import { contract } from "../InterestRateAbi";
import { useAccount } from "wagmi";
import { Address } from "viem";
import "../Function.css";

const SetContractAddress: React.FC = () => {
  const [lendingPool, setLendingPool] = useState<string>("");
  const [borrower, setBorrower] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setTxHash("");
    if (!lendingPool || !/^0x[a-fA-F0-9]{40}$/.test(lendingPool)) {
      setError("Vui lòng nhập địa chỉ LendingPool hợp lệ.");
      return;
    }
    if (!borrower || !/^0x[a-fA-F0-9]{40}$/.test(borrower)) {
      setError("Vui lòng nhập địa chỉ Borrower hợp lệ.");
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
        functionName: "setContractAddress",
        args: [lendingPool, borrower],
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
      <h2>Set Contract Address</h2>
      <form onSubmit={submit}>
        <label htmlFor="lendingPool">LendingPool Address</label>
        <input
          type="text"
          name="lendingPool"
          value={lendingPool}
          onChange={(e) => setLendingPool(e.target.value)}
          placeholder="0x..."
        />
        <label htmlFor="borrower">Borrower Address</label>
        <input
          type="text"
          name="borrower"
          value={borrower}
          onChange={(e) => setBorrower(e.target.value)}
          placeholder="0x..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "Đang gửi..." : "Set Address"}
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

export default SetContractAddress;
