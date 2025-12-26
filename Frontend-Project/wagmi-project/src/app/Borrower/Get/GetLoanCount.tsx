import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi'; 
import { Address } from 'viem';
import '../Function.css'; 

const GetLoanCount = () => {
    const [loanCount, setLoanCount] = useState<string | null>(null); 
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const account = useAccount();

    const getLoanCount = async () => {
        setErrorMsg(null);
        setLoanCount(null);
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'loanCount',
                args: [],
            });
            setLoanCount(result?.toString() ?? '0');
        } catch (error: any) {
            setErrorMsg('Error fetching loan count');
            console.error('Error fetching loan count:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Loan Count</h2>
            <button type='button' onClick={getLoanCount}>Get Loan Count</button>
            <div className="admin" style={{ marginTop: '12px' }}>
                <h6>Loan Count: {loanCount !== null ? loanCount : 'N/A'}</h6>
                {errorMsg && <h6 style={{ color: 'red' }}>{errorMsg}</h6>}
            </div>
        </div>
    );
};

export default GetLoanCount;
