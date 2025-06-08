import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../PriceOracleAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const SetPriceOracle = () => {
    const [assetAddress, setAssetAddress] = useState<string>('');
    const [oracleAddress, setOracleAddress] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!assetAddress || !oracleAddress) {
            alert('Please provide both asset address and price oracle address.');
            return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'setPriceOracle',
                args: [assetAddress, oracleAddress],
                account: account.address as Address,
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling setPriceOracle:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Set Price Oracle</h2>
            <form onSubmit={submit}>
                <label htmlFor='assetAddress'>Asset Address</label>
                <input
                    type='text'
                    name='assetAddress'
                    value={assetAddress}
                    onChange={(e) => setAssetAddress(e.target.value)}
                />
                <label htmlFor='oracleAddress'>Price Oracle Address</label>
                <input
                    type='text'
                    name='oracleAddress'
                    value={oracleAddress}
                    onChange={(e) => setOracleAddress(e.target.value)}
                />
                <button type='submit'>Set Price Oracle</button>
            </form>
        </div>
    );
};

export default SetPriceOracle;