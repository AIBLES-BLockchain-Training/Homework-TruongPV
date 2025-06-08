import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import "../Function.css";

const SetRickParams = () => {
    const [assetAddress, setAssetAddress] = useState<string>('');
    const [liquidationThreshold, setLiquidationThreshold] = useState<string>('');
    const [ltv, setLtv] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!assetAddress || !liquidationThreshold || !ltv) {
            alert('Please provide all fields.');
            return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'setRickParams',
                args: [assetAddress, BigInt(liquidationThreshold), BigInt(ltv)],
                account: account.address as Address,
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling setRickParams:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Set Rick Params</h2>
            <form onSubmit={submit}>
                <label htmlFor='assetAddress'>Asset Address</label>
                <input
                    type='text'
                    name='assetAddress'
                    value={assetAddress}
                    onChange={(e) => setAssetAddress(e.target.value)}
                />
                <label htmlFor='liquidationThreshold'>Liquidation Threshold</label>
                <input
                    type='number'
                    name='liquidationThreshold'
                    value={liquidationThreshold}
                    onChange={(e) => setLiquidationThreshold(e.target.value)}
                />
                <label htmlFor='ltv'>LTV</label>
                <input
                    type='number'
                    name='ltv'
                    value={ltv}
                    onChange={(e) => setLtv(e.target.value)}
                />
                <button type='submit'>Set Rick Params</button>
            </form>
        </div>
    );
};

export default SetRickParams;