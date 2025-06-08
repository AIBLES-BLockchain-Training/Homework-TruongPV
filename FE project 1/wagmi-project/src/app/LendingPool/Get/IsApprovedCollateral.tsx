import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const IsApprovedCollateral = () => {
    const [token, setToken] = useState<string>('');
    const [isApproved, setIsApproved] = useState<boolean | null>(null);
    const account = useAccount();

    const checkIsApproved = async () => {
        if (!token) {
            alert('Please provide the token address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'isApprovedCollateral',
                args: [token],
            });
            setIsApproved(result as boolean);
        } catch (error) {
            console.error('Error fetching isApprovedCollateral:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Is Approved Collateral</h2>
            <label htmlFor='token'>Token Address</label>
            <input
                type='text'
                name='token'
                value={token}
                onChange={(e) => setToken(e.target.value)}
            />
            <button type='button' onClick={checkIsApproved}>Check</button>
            <div className="admin">
                <h6>Approved: {isApproved === null ? 'N/A' : isApproved ? 'Yes' : 'No'}</h6>
            </div>
        </div>
    );
};

export default IsApprovedCollateral;