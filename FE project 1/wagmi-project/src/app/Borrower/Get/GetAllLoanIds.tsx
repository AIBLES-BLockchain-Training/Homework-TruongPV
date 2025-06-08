import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetAllLoanIds = () => {
    const [loanIds, setLoanIds] = useState<string[] | null>(null);
    const account = useAccount();

    const getLoanIds = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getAllloanIds',
                args: [],
            });
            setLoanIds((result as bigint[]).map(id => id.toString()));
        } catch (error) {
            console.error('Error fetching getAllloanIds:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get All Loan IDs</h2>
            <button type='button' onClick={getLoanIds}>Get Loan IDs</button>
            <div className="admin">
                <h6>
                    Loan IDs: {loanIds ? loanIds.join(', ') : 'N/A'}
                </h6>
            </div>
        </div>
    );
};

export default GetAllLoanIds;