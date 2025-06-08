import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetTotalAssetSupplied = () => {
    const [address, setAddress] = useState<string>('');
    const [supplied, setSupplied] = useState<string | null>(null);
    const account = useAccount();

    const getTotalAssetSupplied = async () => {
        if (!address) {
            alert('Please provide the address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'totalassetSupplied',
                args: [address],
            });
            setSupplied((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching totalassetSupplied:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Total Asset Supplied</h2>
            <label htmlFor='address'>Address</label>
            <input
                type='text'
                name='address'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <button type='button' onClick={getTotalAssetSupplied}>Get Supplied</button>
            <div className="admin">
                <h6>Supplied: {supplied ? supplied : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetTotalAssetSupplied;