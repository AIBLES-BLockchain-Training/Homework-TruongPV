import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetBorrowAPY = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [apy, setApy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const account = useAccount();

    const getAPY = async () => {
        setError(null);
        setApy(null);
        if (!tokenAddress || tokenAddress.length !== 42) {
            setError('Please enter a valid token address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'calculateBorrowAPY',
                args: [tokenAddress],
            });
            setApy(result?.toString() ?? null);
        } catch (error) {
            setError('Error fetching APY.');
            console.error('Error fetching APY:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Borrow APY</h2>
            <input
                type="text"
                placeholder="Token address"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
                className="input-field"
            />
            <button type='button' onClick={getAPY}>Get APY</button>
            {error && <div className="error">{error}</div>}
            <div className="admin">
                <h6>APY: {apy !== null ? apy : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetBorrowAPY;
