import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const ValidCollateralTokenList = () => {
    const [index, setIndex] = useState<string>('');
    const [tokenAddress, setTokenAddress] = useState<string | null>(null);
    const account = useAccount();

    const getTokenAddress = async () => {
        if (!index) {
            alert('Please provide the index.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'validCollateralTokenList',
                args: [BigInt(index)],
            });
            setTokenAddress(result as string);
        } catch (error) {
            console.error('Error fetching validCollateralTokenList:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Valid Collateral Token List</h2>
            <label htmlFor='index'>Index</label>
            <input
                type='number'
                name='index'
                value={index}
                onChange={(e) => setIndex(e.target.value)}
            />
            <button type='button' onClick={getTokenAddress}>Get Token Address</button>
            <div className="admin">
                <h6>
                    Token Address: {tokenAddress ? tokenAddress : 'N/A'}
                </h6>
            </div>
        </div>
    );
};

export default ValidCollateralTokenList;