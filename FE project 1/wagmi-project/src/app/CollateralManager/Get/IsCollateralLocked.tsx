import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const IsCollateralLocked = () => {
    const [user, setUser] = useState<string>('');
    const [assetAddress, setAssetAddress] = useState<string>('');
    const [isLocked, setIsLocked] = useState<boolean | null>(null);
    const account = useAccount();

    const checkLocked = async () => {
        if (!user || !assetAddress) {
            alert('Please provide both user and asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'isCollateralLocked',
                args: [user, assetAddress],
            });
            setIsLocked(result as boolean);
        } catch (error) {
            console.error('Error checking collateral locked:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Is Collateral Locked</h2>
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
            <button type='button' onClick={checkLocked}>Check</button>
            <div className="admin">
                <h6>
                    Is Locked: {isLocked === null ? 'N/A' : isLocked ? 'Yes' : 'No'}
                </h6>
            </div>
        </div>
    );
};

export default IsCollateralLocked;