import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi'; 
import { Address } from 'viem';
import '../Function.css';

const GetLoanHealthFactor = () => {
    const [loanId, setLoanId] = useState('');
    const [healthFactor, setHealthFactor] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const account = useAccount();

    const getHealthFactor = async () => {
        setErrorMsg(null);
        setHealthFactor(null);
        try {
            const parsedLoanId = loanId ? parseInt(loanId, 10) : 0;
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getLoanHealthFactor',
                args: [parsedLoanId],
            });
            setHealthFactor(result?.toString() ?? '0');
        } catch (error: any) {
            setErrorMsg('Error fetching health factor');
            console.error('Error fetching health factor:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Loan Health Factor</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                    type="number"
                    placeholder="Loan ID"
                    value={loanId}
                    onChange={e => setLoanId(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button type="button" onClick={getHealthFactor} style={{ background: '#c7b6f7', color: '#222', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 'bold' }}>
                    Get Health Factor
                </button>
            </div>
            <div className="admin" style={{ marginTop: '12px' }}>
                <h6>Health Factor: {healthFactor !== null ? healthFactor : 'N/A'}</h6>
                {errorMsg && <h6 style={{ color: 'red' }}>{errorMsg}</h6>}
            </div>
        </div>
    );
};

export default GetLoanHealthFactor;
