import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetTotalCollateralValue = () => {
    const [user, setUser] = useState<string>('');
    const [assetAddresses, setAssetAddresses] = useState<string>('');
    const [totalValue, setTotalValue] = useState<string | null>(null);
    const account = useAccount();

    const getTotalCollateralValue = async () => {
        if (!user || !assetAddresses) {
            alert('Please enter user address and asset addresses.');
            return;
        }
        try {
            // assetAddresses: comma separated string to array
            const assetsArray = assetAddresses.split(',').map(addr => addr.trim());
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getTotalCollateralValue',
                args: [user, assetsArray],
            });
            setTotalValue(result?.toString() ?? null);
        } catch (error) {
            console.error('Error fetching total collateral value:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get Total Collateral Value</h2>
            <input
                type="text"
                placeholder="User Address"
                value={user}
                onChange={(e) => setUser(e.target.value)}
            />
            <input
                type="text"
                placeholder="Asset Addresses (comma separated)"
                value={assetAddresses}
                onChange={(e) => setAssetAddresses(e.target.value)}
            />
            <button type='button' onClick={getTotalCollateralValue}>Get Total Value</button>
            <div className="total-collateral-value">
                <h6>Total Value: {totalValue ? totalValue : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetTotalCollateralValue;