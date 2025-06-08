import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const RemoveCollateral = () => {
  const [assetAddress, setAssetAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!assetAddress || !amount) {
      alert('Please provide both asset address and amount.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'removeCollateral',
        args: [assetAddress, BigInt(amount)],
        account: account.address as Address,
        value: BigInt(amount), // gửi amount làm value (ETH) nếu cần
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Error calling removeCollateral:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Remove Collateral</h2>
      <form onSubmit={submit}>
        <label htmlFor='assetAddress'>Asset Address</label>
        <input
          type='text'
          name='assetAddress'
          value={assetAddress}
          onChange={(e) => setAssetAddress(e.target.value)}
        />
        <label htmlFor='amount'>Amount</label>
        <input
          type='number'
          name='amount'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type='submit'>Remove Collateral</button>
      </form>
    </div>
  );
};

export default RemoveCollateral;