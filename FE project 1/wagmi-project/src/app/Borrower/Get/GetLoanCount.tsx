import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetLoanCount = () => {
    const [loanCount, setLoanCount] = useState<string | null>(null);
    const account = useAccount();

    const getLoanCount = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'loanCount',
                args: [],
            });
            setLoanCount((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching loanCount:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Loan Count</h2>
            <button type='button' onClick={getLoanCount}>Get Loan Count</button>
            <div className="admin">
                <h6>Loan Count: {loanCount ? loanCount : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetLoanCount;