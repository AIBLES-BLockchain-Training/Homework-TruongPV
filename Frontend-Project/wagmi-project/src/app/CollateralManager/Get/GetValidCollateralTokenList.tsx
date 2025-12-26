import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetValidCollateralTokenList = () => {
    const [index, setIndex] = useState<string>('');
    const [tokenAddress, setTokenAddress] = useState<string | null>(null);
    const account = useAccount();

    const fetchValidCollateralToken = async () => {
        try {
            const idx = index === '' ? 0 : Number(index);
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'validCollateralTokenList',
                args: [idx],
            });
            setTokenAddress(result as string);
        } catch (error) {
            console.error('Error fetching validCollateralTokenList:', error);
            setTokenAddress('Error');
        }
    };

    return (
        <div className="form-container">
            <h2>Valid Collateral Token List</h2>
            <input
                type="number"
                placeholder="Index (uint256)"
                value={index}
                onChange={e => setIndex(e.target.value)}
            />
            <button type='button' onClick={fetchValidCollateralToken}>Get Token Address</button>
            <div className="admin">
                <h6>Token Address: {tokenAddress !== null ? tokenAddress : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetValidCollateralTokenList;
