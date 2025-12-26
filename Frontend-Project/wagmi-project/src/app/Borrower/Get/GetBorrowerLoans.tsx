import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from './../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetBorrowerLoans = () => {
    const [userAddress, setUserAddress] = useState<string>('');
    const [loanIndex, setLoanIndex] = useState<string>('');
    const [loanId, setLoanId] = useState<string | null>(null);
    const account = useAccount();

    const getBorrowerLoan = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'borrowerLoans',
                args: [userAddress as Address, BigInt(loanIndex)],
            });
            setLoanId(result?.toString() ?? null);
        } catch (error) {
            console.error('Error fetching borrowerLoans:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get Borrower Loan</h2>
            <div>
                <label>User Address</label>
                <input
                    type="text"
                    value={userAddress}
                    onChange={e => setUserAddress(e.target.value)}
                    placeholder="Enter user address"
                />
            </div>
            <div>
                <label>Loan Index</label>
                <input
                    type="text"
                    value={loanIndex}
                    onChange={e => setLoanIndex(e.target.value)}
                    placeholder="Enter loan index"
                />
            </div>
            <button type="button" onClick={getBorrowerLoan}>Get Borrower Loan</button>
            <div className="admin">
                <h6>Loan ID: {loanId !== null ? loanId : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetBorrowerLoans;