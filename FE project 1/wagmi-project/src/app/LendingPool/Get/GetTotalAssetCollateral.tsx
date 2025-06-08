import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetTotalAssetCollateral = () => {
    const [address, setAddress] = useState<string>('');
    const [collateral, setCollateral] = useState<string | null>(null);
    const account = useAccount();

    const getTotalAssetCollateral = async () => {
        if (!address) {
            alert('Please provide the address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'totalassetCollateral',
                args: [address],
            });
            setCollateral((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching totalassetCollateral:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Total Asset Collateral</h2>
            <label htmlFor='address'>Address</label>
            <input
                type='text'
                name='address'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <button type='button' onClick={getTotalAssetCollateral}>Get Collateral</button>
            <div className="admin">
                <h6>Collateral: {collateral ? collateral : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetTotalAssetCollateral;