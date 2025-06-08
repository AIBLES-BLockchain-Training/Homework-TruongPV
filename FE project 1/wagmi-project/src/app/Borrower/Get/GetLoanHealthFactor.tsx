import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetLoanHealthFactor = () => {
    const [loanId, setLoanId] = useState<string>('');
    const [healthFactor, setHealthFactor] = useState<string | null>(null);
    const account = useAccount();

    const getHealthFactor = async () => {
        if (!loanId) {
            alert('Please provide the loan ID.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getLoanHealthFactor',
                args: [BigInt(loanId)],
            });
            setHealthFactor((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching getLoanHealthFactor:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Loan Health Factor</h2>
            <label htmlFor='loanId'>Loan ID</label>
            <input
                type='number'
                name='loanId'
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
            />
            <button type='button' onClick={getHealthFactor}>Get Health Factor</button>
            <div className="admin">
                <h6>Health Factor: {healthFactor ? healthFactor : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetLoanHealthFactor;