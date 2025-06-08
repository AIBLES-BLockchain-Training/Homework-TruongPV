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

    const getAmount = async () => {
        if (!user || !assetAddress) {
            alert('Please provide both user and asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getCollateralAmount',
                args: [user, assetAddress],
            });
            setAmount((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching collateral amount:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Collateral Amount</h2>
            <label htmlFor='user'>User Address</label>
            <input
                type='text'
                name='user'
                value={user}
                onChange={(e) => setUser(e.target.value)}
            />
            <label htmlFor='assetAddress'>Asset Address</label>
            <input
                type='text'
                name='assetAddress'
                value={assetAddress}
                onChange={(e) => setAssetAddress(e.target.value)}
            />
            <button type='button' onClick={getAmount}>Get Amount</button>
            <div className="admin">
                <h6>Collateral Amount: {amount ? amount : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetCollateralAmount;