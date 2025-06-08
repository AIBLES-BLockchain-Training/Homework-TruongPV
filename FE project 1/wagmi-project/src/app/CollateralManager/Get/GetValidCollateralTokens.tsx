import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetValidCollateralTokens = () => {
    const [tokens, setTokens] = useState<string[] | null>(null);
    const account = useAccount();

    const getTokens = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getValidCollateralTokens',
                args: [],
            });
            setTokens(result as string[]);
        } catch (error) {
            console.error('Error fetching valid collateral tokens:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Valid Collateral Tokens</h2>
            <button type='button' onClick={getTokens}>Get Tokens</button>
            <div className="admin">
                <h6>
                    Tokens: {tokens ? tokens.join(', ') : 'N/A'}
                </h6>
            </div>
        </div>
    );
};

export default GetValidCollateralTokens;