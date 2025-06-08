import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetFeeBalance = () => {
    const [feeBalance, setFeeBalance] = useState<string | null>(null);
    const account = useAccount();

    const getFeeBalance = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'setFeeBalance',
                args: [],
            });
            setFeeBalance((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching setFeeBalance:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Fee Balance</h2>
            <button type='button' onClick={getFeeBalance}>Get Fee Balance</button>
            <div className="admin">
                <h6>Fee Balance: {feeBalance ? feeBalance : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetFeeBalance;