import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetBorrower = () => {
    const [borrower, setBorrower] = useState<string | null>(null);
    const account = useAccount();

    const getBorrower = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'borrower',
                args: [],
            });
            setBorrower(result as string);
        } catch (error) {
            console.error('Error fetching borrower:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get Borrower</h2>
            <button type='button' onClick={getBorrower}>Get Borrower</button>
            <div className="borrower">
                <h6>Borrower: {borrower ? borrower : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetBorrower;