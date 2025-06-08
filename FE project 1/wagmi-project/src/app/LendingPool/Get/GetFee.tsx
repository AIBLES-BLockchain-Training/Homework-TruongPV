import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetFee = () => {
    const [fee, setFee] = useState<string | null>(null);
    const account = useAccount();

    const getFee = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'fee',
                args: [],
            });
            setFee((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching fee:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Fee</h2>
            <button type='button' onClick={getFee}>Get Fee</button>
            <div className="admin">
                <h6>Fee: {fee ? fee : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetFee;