import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi'; 
import { Address } from 'viem';
import '../Function.css'; 

const GetLoanInfoByIndex = () => {
    const [index, setIndex] = useState('');
    const [loanInfo, setLoanInfo] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const account = useAccount();

    const getLoanInfo = async () => {
        setErrorMsg(null);
        setLoanInfo(null);
        try {
            const parsedIndex = index ? parseInt(index, 10) : 0;
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'loans',
                args: [parsedIndex],
            });
            setLoanInfo(result);
        } catch (error: any) {
            setErrorMsg('Error fetching loan info');
            console.error('Error fetching loan info:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Loan Info by Index</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                    type="number"
                    placeholder="Index"
                    value={index}
                    onChange={e => setIndex(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button type="button" onClick={getLoanInfo} style={{ background: '#c7b6f7', color: '#222', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 'bold' }}>
                    Get Loan Info
                </button>
            </div>
            <div className="admin" style={{ marginTop: '12px' }}>
                {loanInfo ? (
                    <div>
                        <h6>ID: {loanInfo[0]?.toString?.() ?? ''}</h6>
                        <h6>Borrower: {loanInfo[1]}</h6>
                        <h6>Asset Address: {loanInfo[2]}</h6>
                        <h6>Asset Amount: {loanInfo[3]?.toString?.() ?? ''}</h6>
                        <h6>Variable Borrow Index: {loanInfo[4]?.toString?.() ?? ''}</h6>
                    </div>
                ) : (
                    <h6>Loan Info: N/A</h6>
                )}
                {errorMsg && <h6 style={{ color: 'red' }}>{errorMsg}</h6>}
            </div>
        </div>
    );
};

export default GetLoanInfoByIndex;
