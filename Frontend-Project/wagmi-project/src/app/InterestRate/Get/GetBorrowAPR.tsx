import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetBorrowAPR = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [apr, setApr] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const account = useAccount();

    const getAPR = async () => {
        setError(null);
        setApr(null);
        if (!tokenAddress || tokenAddress.length !== 42) {
            setError('Please enter a valid token address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'calculateBorrowAPR',
                args: [tokenAddress],
            });
            setApr(result?.toString() ?? null);
        } catch (error) {
            setError('Error fetching APR.');
            console.error('Error fetching APR:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Borrow APR</h2>
            <input
                type="text"
                placeholder="Token address"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
                className="input-field"
            />
            <button type='button' onClick={getAPR}>Get APR</button>
            {error && <div className="error">{error}</div>}
            <div className="admin">
                <h6>APR: {apr !== null ? apr : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetBorrowAPR;
