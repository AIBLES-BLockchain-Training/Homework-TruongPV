import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetIsApprovedCollateral = () => {
    const [token, setToken] = useState<string>('');
    const [isApproved, setIsApproved] = useState<string | null>(null);
    const account = useAccount();

    const checkIsApprovedCollateral = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'isApprovedCollateral',
                args: [token],
            });
            setIsApproved(result ? 'True' : 'False');
        } catch (error) {
            console.error('Error checking isApprovedCollateral:', error);
            setIsApproved('Error');
        }
    };

    return (
        <div className="form-container">
            <h2>Is Approved Collateral</h2>
            <input
                type="text"
                placeholder="Token address"
                value={token}
                onChange={e => setToken(e.target.value)}
            />
            <button type='button' onClick={checkIsApprovedCollateral}>Check</button>
            <div className="admin">
                <h6>Approved: {isApproved !== null ? isApproved : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetIsApprovedCollateral;
