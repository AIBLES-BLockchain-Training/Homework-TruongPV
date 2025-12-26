import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetIsCollateralLocked = () => {
    const [user, setUser] = useState<string>('');
    const [assetAddress, setAssetAddress] = useState<string>('');
    const [isLocked, setIsLocked] = useState<string | null>(null);
    const account = useAccount();

    const checkIsCollateralLocked = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'isCollateralLocked',
                args: [user, assetAddress],
            });
            setIsLocked(result ? 'True' : 'False');
        } catch (error) {
            console.error('Error checking isCollateralLocked:', error);
            setIsLocked('Error');
        }
    };

    return (
        <div className="form-container">
            <h2>Is Collateral Locked</h2>
            <input
                type="text"
                placeholder="User address"
                value={user}
                onChange={e => setUser(e.target.value)}
            />
            <input
                type="text"
                placeholder="Asset address"
                value={assetAddress}
                onChange={e => setAssetAddress(e.target.value)}
            />
            <button type='button' onClick={checkIsCollateralLocked}>Check</button>
            <div className="admin">
                <h6>Locked: {isLocked !== null ? isLocked : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetIsCollateralLocked;
