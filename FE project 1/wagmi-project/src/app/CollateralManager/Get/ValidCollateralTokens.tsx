import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const ValidCollateralTokens = () => {
    const [token, setToken] = useState<string>('');
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const account = useAccount();

    const checkValid = async () => {
        if (!token) {
            alert('Please provide the token address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'validCollateralTokens',
                args: [token],
            });
            setIsValid(result as boolean);
        } catch (error) {
            console.error('Error checking validCollateralTokens:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Valid Collateral Tokens</h2>
            <label htmlFor='token'>Token Address</label>
            <input
                type='text'
                name='token'
                value={token}
                onChange={(e) => setToken(e.target.value)}
            />
            <button type='button' onClick={checkValid}>Check</button>
            <div className="admin">
                <h6>
                    Is Valid: {isValid === null ? 'N/A' : isValid ? 'Yes' : 'No'}
                </h6>
            </div>
        </div>
    );
};

export default ValidCollateralTokens;