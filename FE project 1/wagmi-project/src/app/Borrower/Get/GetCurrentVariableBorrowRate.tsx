import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetCurrentVariableBorrowRate = () => {
    const [assetAddress, setAssetAddress] = useState<string>('');
    const [rate, setRate] = useState<string | null>(null);
    const account = useAccount();

    const getRate = async () => {
        if (!assetAddress) {
            alert('Please provide the asset address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getCurrentVariableBorrowRate',
                args: [assetAddress],
            });
            setRate((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching getCurrentVariableBorrowRate:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Current Variable Borrow Rate</h2>
            <label htmlFor='assetAddress'>Asset Address</label>
            <input
                type='text'
                name='assetAddress'
                value={assetAddress}
                onChange={(e) => setAssetAddress(e.target.value)}
            />
            <button type='button' onClick={getRate}>Get Rate</button>
            <div className="admin">
                <h6>Rate: {rate ? rate : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetCurrentVariableBorrowRate;