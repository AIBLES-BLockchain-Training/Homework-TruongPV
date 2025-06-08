import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import "../Function.css";

const CreateLoan = () => {
    const [assetAddress, setAssetAddress] = useState<string>('');
    const [assetAmount, setAssetAmount] = useState<string>('');
    const [collateralAddresses, setCollateralAddresses] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!assetAddress || !assetAmount || !collateralAddresses) {
            alert('Please provide all fields.');
            return;
        }
        try {
            const addresses = collateralAddresses.split(',').map(addr => addr.trim());
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'createLoan',
                args: [assetAddress, BigInt(assetAmount), addresses],
                account: account.address as Address,
                value: BigInt(0), // Nếu cần gửi ETH, thay đổi giá trị này
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling createLoan:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Create Loan</h2>
            <form onSubmit={submit}>
                <label htmlFor='assetAddress'>Asset Address</label>
                <input
                    type='text'
                    name='assetAddress'
                    value={assetAddress}
                    onChange={(e) => setAssetAddress(e.target.value)}
                />
                <label htmlFor='assetAmount'>Asset Amount</label>
                <input
                    type='number'
                    name='assetAmount'
                    value={assetAmount}
                    onChange={(e) => setAssetAmount(e.target.value)}
                />
                <label htmlFor='collateralAddresses'>Collateral Addresses (comma separated)</label>
                <input
                    type='text'
                    name='collateralAddresses'
                    value={collateralAddresses}
                    onChange={(e) => setCollateralAddresses(e.target.value)}
                    placeholder="0x...,0x...,0x..."
                />
                <button type='submit'>Create Loan</button>
            </form>
        </div>
    );
};

export default CreateLoan;