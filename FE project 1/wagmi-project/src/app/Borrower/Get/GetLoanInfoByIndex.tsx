import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetLoanInfoByIndex = () => {
    const [index, setIndex] = useState<string>('');
    const [loanInfo, setLoanInfo] = useState<{
        id: string;
        borrower: string;
        assetAdddress: string;
        assetAmount: string;
        variableBorrowIndex: string;
    } | null>(null);
    const account = useAccount();

    const getLoanInfo = async () => {
        if (!index) {
            alert('Please provide the index.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'loans',
                args: [BigInt(index)],
            });
            const [id, borrower, assetAdddress, assetAmount, variableBorrowIndex] = result as [bigint, string, string, bigint, bigint];
            setLoanInfo({
                id: id.toString(),
                borrower,
                assetAdddress,
                assetAmount: assetAmount.toString(),
                variableBorrowIndex: variableBorrowIndex.toString(),
            });
        } catch (error) {
            console.error('Error fetching loans:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Loan Info By Index</h2>
            <label htmlFor='index'>Index</label>
            <input
                type='number'
                name='index'
                value={index}
                onChange={(e) => setIndex(e.target.value)}
            />
            <button type='button' onClick={getLoanInfo}>Get Loan Info</button>
            <div className="admin">
                {loanInfo ? (
                    <div>
                        <h6>ID: {loanInfo.id}</h6>
                        <h6>Borrower: {loanInfo.borrower}</h6>
                        <h6>Asset Address: {loanInfo.assetAdddress}</h6>
                        <h6>Asset Amount: {loanInfo.assetAmount}</h6>
                        <h6>Variable Borrow Index: {loanInfo.variableBorrowIndex}</h6>
                    </div>
                ) : (
                    <h6>Loan Info: N/A</h6>
                )}
            </div>
        </div>
    );
};

export default GetLoanInfoByIndex;