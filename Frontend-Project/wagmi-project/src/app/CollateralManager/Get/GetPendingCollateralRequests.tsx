import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetPendingCollateralRequests = () => {
    const [address, setAddress] = useState<string>('');
    const [pending, setPending] = useState<string | null>(null);
    const account = useAccount();

    const checkPendingCollateralRequests = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'pendingCollateralRequests',
                args: [address],
            });
            setPending(result ? 'True' : 'False');
        } catch (error) {
            console.error('Error checking pendingCollateralRequests:', error);
            setPending('Error');
        }
    };

    return (
        <div className="form-container">
            <h2>Pending Collateral Requests</h2>
            <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={e => setAddress(e.target.value)}
            />
            <button type='button' onClick={checkPendingCollateralRequests}>Check</button>
            <div className="admin">
                <h6>Pending: {pending !== null ? pending : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetPendingCollateralRequests;
