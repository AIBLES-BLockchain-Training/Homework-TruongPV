import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../PriceOracleAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import "../Function.css";

const ResetAssetPrice = () => {
    const [assetAddress, setAssetAddress] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!assetAddress) {
            alert('Please provide an asset address.');
            return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'resetAssetPrice',
                args: [assetAddress],
                account: account.address as Address,
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling resetAssetPrice:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Reset Asset Price</h2>
            <form onSubmit={submit}>
                <label htmlFor='assetAddress'>Asset Address</label>
                <input
                    type='text'
                    name='assetAddress'
                    value={assetAddress}
                    onChange={(e) => setAssetAddress(e.target.value)}
                />
                <button type='submit'>Reset Price</button>
            </form>
        </div>
    );
};

export default ResetAssetPrice;