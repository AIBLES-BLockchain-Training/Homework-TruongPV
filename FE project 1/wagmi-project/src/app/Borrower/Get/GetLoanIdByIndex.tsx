import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetLoanIdByIndex = () => {
    const [index, setIndex] = useState<string>('');
    const [loanId, setLoanId] = useState<string | null>(null);
    const account = useAccount();

    const getLoanId = async () => {
        if (!index) {
            alert('Please provide the index.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'loanIds',
                args: [BigInt(index)],
            });
            setLoanId((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching loanIds:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Loan ID By Index</h2>
            <label htmlFor='index'>Index</label>
            <input
                type='number'
                name='index'
                value={index}
                onChange={(e) => setIndex(e.target.value)}
            />
            <button type='button' onClick={getLoanId}>Get Loan ID</button>
            <div className="admin">
                <h6>Loan ID: {loanId ? loanId : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetLoanIdByIndex;