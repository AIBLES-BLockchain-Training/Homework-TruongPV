import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetMockToken = () => {
    const [mockToken, setMockToken] = useState<string | null>(null);
    const account = useAccount();

    const getMockToken = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'mockToken',
                args: [],
            });
            setMockToken(result as string);
        } catch (error) {
            console.error('Error fetching mockToken:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Mock Token</h2>
            <button type='button' onClick={getMockToken}>Get Mock Token</button>
            <div className="admin">
                <h6>Mock Token: {mockToken ? mockToken : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetMockToken;