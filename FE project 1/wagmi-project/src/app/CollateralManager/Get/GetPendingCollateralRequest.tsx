import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetPendingCollateralRequest = () => {
    const [address, setAddress] = useState<string>('');
    const [pending, setPending] = useState<boolean | null>(null);
    const account = useAccount();

    const getPending = async () => {
        if (!address) {
            alert('Please provide the address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'pendingCollateralRequests',
                args: [address],
            });
            setPending(result as boolean);
        } catch (error) {
            console.error('Error fetching pendingCollateralRequests:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Pending Collateral Request</h2>
            <label htmlFor='address'>Address</label>
            <input
                type='text'
                name='address'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <button type='button' onClick={getPending}>Get Pending</button>
            <div className="admin">
                <h6>
                    Pending: {pending === null ? 'N/A' : pending ? 'Yes' : 'No'}
                </h6>
            </div>
        </div>
    );
};

export default GetPendingCollateralRequest;