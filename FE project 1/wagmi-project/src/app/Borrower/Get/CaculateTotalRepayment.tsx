import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const CalculateTotalRepayment = () => {
    const [id, setId] = useState<string>('');
    const [repayment, setRepayment] = useState<{ total: string; interest: string } | null>(null);
    const account = useAccount();

    const getRepayment = async () => {
        if (!id) {
            alert('Please provide the loan id.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'calculateTotalRepayment',
                args: [BigInt(id)],
            });
            // result is [total, interest]
            setRepayment({
                total: (result as [bigint, bigint])[0].toString(),
                interest: (result as [bigint, bigint])[1].toString(),
            });
        } catch (error) {
            console.error('Error fetching calculateTotalRepayment:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Calculate Total Repayment</h2>
            <label htmlFor='id'>Loan ID</label>
            <input
                type='number'
                name='id'
                value={id}
                onChange={(e) => setId(e.target.value)}
            />
            <button type='button' onClick={getRepayment}>Calculate</button>
            <div className="admin">
                <h6>
                    {repayment
                        ? `Total: ${repayment.total} | Interest: ${repayment.interest}`
                        : 'N/A'}
                </h6>
            </div>
        </div>
    );
};

export default CalculateTotalRepayment;