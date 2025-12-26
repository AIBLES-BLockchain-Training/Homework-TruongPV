import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetCollateralAmount = () => {
    const [user, setUser] = useState<string>('');
    const [assetAddress, setAssetAddress] = useState<string>('');
    const [amount, setAmount] = useState<string | null>(null);
    const account = useAccount();

    const getCollateralAmount = async () => {
        if (!user || !assetAddress) {
            alert('Please enter both user and asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getCollateralAmount',
                args: [user, assetAddress],
            });
            setAmount(result?.toString() ?? null);
        } catch (error) {
            console.error('Error fetching collateral amount:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get Collateral Amount</h2>
            <input
                type="text"
                placeholder="User Address"
                value={user}
                onChange={(e) => setUser(e.target.value)}
            />
            <input
                type="text"
                placeholder="Asset Address"
                value={assetAddress}
                onChange={(e) => setAssetAddress(e.target.value)}
            />
            <button type='button' onClick={getCollateralAmount}>Get Collateral Amount</button>
            <div className="collateral-amount">
                <h6>Amount: {amount ? amount : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetCollateralAmount;