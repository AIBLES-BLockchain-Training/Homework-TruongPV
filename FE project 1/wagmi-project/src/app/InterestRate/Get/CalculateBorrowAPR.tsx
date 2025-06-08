import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const CalculateBorrowAPR = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [apr, setApr] = useState<string | null>(null);
    const account = useAccount();

    const getAPR = async () => {
        try {
            const aprResult = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'calculateBorrowAPR',
                args: [tokenAddress],
            });
            setApr((aprResult as bigint).toString());
        } catch (error) {
            console.error('Error fetching APR:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Calculate Borrow APR</h2>
            <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter token address..."
            />
            <button type="button" onClick={getAPR} disabled={!tokenAddress}>
                Get APR
            </button>
            <div className="admin">
                <h6>Borrow APR: {apr ? apr : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default CalculateBorrowAPR;