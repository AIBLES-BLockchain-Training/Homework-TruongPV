import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetTotalCollateralValue = () => {
    const [user, setUser] = useState<string>('');
    const [assetAddresses, setAssetAddresses] = useState<string>('');
    const [value, setValue] = useState<string | null>(null);
    const account = useAccount();

    const getValue = async () => {
        if (!user || !assetAddresses) {
            alert('Please provide user and asset addresses.');
            return;
        }
        try {
            const addressesArray = assetAddresses.split(',').map(addr => addr.trim());
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getTotalCollateralValue',
                args: [user, addressesArray],
            });
            setValue((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching total collateral value:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Total Collateral Value</h2>
            <label htmlFor='user'>User Address</label>
            <input
                type='text'
                name='user'
                value={user}
                onChange={(e) => setUser(e.target.value)}
            />
            <label htmlFor='assetAddresses'>Asset Addresses (comma separated)</label>
            <input
                type='text'
                name='assetAddresses'
                value={assetAddresses}
                onChange={(e) => setAssetAddresses(e.target.value)}
            />
            <button type='button' onClick={getValue}>Get Value</button>
            <div className="admin">
                <h6>Total Collateral Value: {value ? value : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetTotalCollateralValue;