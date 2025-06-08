import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetInterestRate = () => {
    const [interestRate, setInterestRate] = useState<string | null>(null);
    const account = useAccount();

    const getInterestRate = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'interestRate',
                args: [],
            });
            setInterestRate(result as string);
        } catch (error) {
            console.error('Error fetching interestRate:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Interest Rate</h2>
            <button type='button' onClick={getInterestRate}>Get Interest Rate</button>
            <div className="admin">
                <h6>Interest Rate: {interestRate ? interestRate : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetInterestRate;