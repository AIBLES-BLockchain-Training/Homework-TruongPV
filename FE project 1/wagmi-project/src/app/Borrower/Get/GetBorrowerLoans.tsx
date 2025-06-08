import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetBorrowerLoans = () => {
    const [user, setUser] = useState<string>('');
    const [index, setIndex] = useState<string>('');
    const [loan, setLoan] = useState<string | null>(null);
    const account = useAccount();

    const getLoan = async () => {
        if (!user || !index) {
            alert('Please provide both user address and index.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'borrowerLoans',
                args: [user, BigInt(index)],
            });
            setLoan((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching borrowerLoans:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Borrower Loans</h2>
            <label htmlFor='user'>User Address</label>
            <input
                type='text'
                name='user'
                value={user}
                onChange={(e) => setUser(e.target.value)}
            />
            <label htmlFor='index'>Index</label>
            <input
                type='number'
                name='index'
                value={index}
                onChange={(e) => setIndex(e.target.value)}
            />
            <button type='button' onClick={getLoan}>Get Loan</button>
            <div className="admin">
                <h6>Loan: {loan ? loan : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetBorrowerLoans;