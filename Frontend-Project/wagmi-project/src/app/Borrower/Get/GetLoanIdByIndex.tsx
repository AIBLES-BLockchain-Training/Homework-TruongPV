import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi'; 
import { Address } from 'viem';
import '../Function.css'; 

const GetLoanIdByIndex = () => {
    const [index, setIndex] = useState('');
    const [loanId, setLoanId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const account = useAccount();

    const getLoanId = async () => {
        setErrorMsg(null);
        setLoanId(null);
        try {
            const parsedIndex = index ? parseInt(index, 10) : 0;
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'loanIds',
                args: [parsedIndex],
            });
            setLoanId(result?.toString() ?? '0');
        } catch (error: any) {
            setErrorMsg('Error fetching loanId');
            console.error('Error fetching loanId:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get LoanId by Index</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                    type="number"
                    placeholder="Index"
                    value={index}
                    onChange={e => setIndex(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button type="button" onClick={getLoanId} style={{ background: '#c7b6f7', color: '#222', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 'bold' }}>
                    Get LoanId
                </button>
            </div>
            <div className="admin" style={{ marginTop: '12px' }}>
                <h6>LoanId: {loanId !== null ? loanId : 'N/A'}</h6>
                {errorMsg && <h6 style={{ color: 'red' }}>{errorMsg}</h6>}
            </div>
        </div>
    );
};

export default GetLoanIdByIndex;
