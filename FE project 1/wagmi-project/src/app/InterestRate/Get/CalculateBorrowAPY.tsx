import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const CalculateBorrowAPY = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [apy, setApy] = useState<string | null>(null);
    const account = useAccount();

    const getAPY = async () => {
        try {
            const apyResult = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'calculateBorrowAPY',
                args: [tokenAddress],
            });
            setApy((apyResult as bigint).toString());
        } catch (error) {
            console.error('Error fetching APY:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Calculate Borrow APY</h2>
            <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter token address..."
            />
            <button type="button" onClick={getAPY} disabled={!tokenAddress}>
                Get APY
            </button>
            <div className="admin">
                <h6>Borrow APY: {apy ? apy : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default CalculateBorrowAPY;