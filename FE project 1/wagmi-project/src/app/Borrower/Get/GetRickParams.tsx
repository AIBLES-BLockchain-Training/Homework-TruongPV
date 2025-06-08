import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetRickParams = () => {
    const [address, setAddress] = useState<string>('');
    const [rickParams, setRickParams] = useState<{
        liquidationThreshold: string;
        ltv: string;
    } | null>(null);
    const account = useAccount();

    const getParams = async () => {
        if (!address) {
            alert('Please provide the address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'rickParams',
                args: [address],
            });
            const [liquidationThreshold, ltv] = result as [bigint, bigint];
            setRickParams({
                liquidationThreshold: liquidationThreshold.toString(),
                ltv: ltv.toString(),
            });
        } catch (error) {
            console.error('Error fetching rickParams:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Rick Params</h2>
            <label htmlFor='address'>Asset Address</label>
            <input
                type='text'
                name='address'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <button type='button' onClick={getParams}>Get Rick Params</button>
            <div className="admin">
                {rickParams ? (
                    <div>
                        <h6>Liquidation Threshold: {rickParams.liquidationThreshold}</h6>
                        <h6>LTV: {rickParams.ltv}</h6>
                    </div>
                ) : (
                    <h6>Rick Params: N/A</h6>
                )}
            </div>
        </div>
    );
};

export default GetRickParams;