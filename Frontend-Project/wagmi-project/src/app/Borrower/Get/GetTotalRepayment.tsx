import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetTotalRepayment = () => {
    const [loanId, setLoanId] = useState<string>('');
    const [repayment, setRepayment] = useState<{ total: string, interest: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const account = useAccount();

    const getTotalRepayment = async () => {
        setError(null);
        setRepayment(null);
        if (!loanId || isNaN(Number(loanId))) {
            setError('Loan ID must be a valid number');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'calculateTotalRepayment',
                args: [BigInt(loanId)],
            });
            // result should be an array [total, interest]
            if (Array.isArray(result) && result.length >= 2) {
                setRepayment({
                    total: result[0]?.toString() ?? '',
                    interest: result[1]?.toString() ?? ''
                });
            } else {
                setError('Unexpected contract return value');
                console.log('Contract result:', result);
            }
        } catch (err: any) {
            setError(err?.message || 'Error fetching total repayment');
            console.error('Error fetching total repayment:', err);
        }
    }

    return (
        <div className="form-container">
            <h2>Calculate Total Repayment</h2>
            <div>
                <label>Loan ID</label>
                <input
                    type="text"
                    value={loanId}
                    onChange={e => setLoanId(e.target.value)}
                    placeholder="Enter loan id"
                />
            </div>
            <button type="button" onClick={getTotalRepayment}>Get Total Repayment</button>
            <div className="admin">
                {error && <h6 style={{ color: 'red' }}>{error}</h6>}
                <h6>
                    {repayment
                        ? <>Total: {repayment.total} <br />Interest: {repayment.interest}</>
                        : !error && 'N/A'}
                </h6>
            </div>
        </div>
    );
};

export default GetTotalRepayment;