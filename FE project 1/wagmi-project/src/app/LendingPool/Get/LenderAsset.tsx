import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const LenderAssets = () => {
    const [address1, setAddress1] = useState<string>('');
    const [address2, setAddress2] = useState<string>('');
    const [result, setResult] = useState<{ amount: string; liquityIndex: string } | null>(null);
    const account = useAccount();

    const getLenderAssets = async () => {
        if (!address1 || !address2) {
            alert('Please provide both addresses.');
            return;
        }
        try {
            const res = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'lenderAssets',
                args: [address1, address2],
            });
            const [amount, liquityIndex] = res as [bigint, bigint];
            setResult({
                amount: amount.toString(),
                liquityIndex: liquityIndex.toString(),
            });
        } catch (error) {
            console.error('Error fetching lenderAssets:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Lender Assets</h2>
            <label htmlFor='address1'>Address 1</label>
            <input
                type='text'
                name='address1'
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
            />
            <label htmlFor='address2'>Address 2</label>
            <input
                type='text'
                name='address2'
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
            />
            <button type='button' onClick={getLenderAssets}>Get Lender Assets</button>
            <div className="admin">
                {result ? (
                    <div>
                        <h6>Amount: {result.amount}</h6>
                        <h6>Liquity Index: {result.liquityIndex}</h6>
                    </div>
                ) : (
                    <h6>Result: N/A</h6>
                )}
            </div>
        </div>
    );
};

export default LenderAssets;