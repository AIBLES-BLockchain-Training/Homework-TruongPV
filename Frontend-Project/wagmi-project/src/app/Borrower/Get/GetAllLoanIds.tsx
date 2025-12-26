import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi'; 
import { Address } from 'viem';
import '../Function.css'; 

const GetAllLoanIds = () => {
    const [loanIds, setLoanIds] = useState<string | null>(null); 
    const account = useAccount();

    const getAllLoanIds = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address, 
                functionName: 'getAllloanIds',
                args: [],
            });
            if (Array.isArray(result)) {
                setLoanIds(result.length > 0 ? result.join(', ') : 'No loan IDs');
            } else {
                setLoanIds('No loan IDs');
            }
        } catch (error) {
            console.error('Error fetching loan IDs:', error);
            setLoanIds('Error fetching loan IDs');
        }
    }

    return (
        <div className="form-container">
            <h2>Get All Loan IDs</h2>
            <button type='button' onClick={getAllLoanIds}>Get All Loan IDs</button>
            <div className="admin">
                <h6>Loan IDs: {loanIds !== null ? loanIds : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetAllLoanIds;
