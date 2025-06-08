import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import "../Function.css";

const SetFee = () => {
    const [fee, setFee] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!fee) {
            alert('Please provide the fee.');
            return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'setFee',
                args: [BigInt(fee)],
                account: account.address as Address,
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling setFee:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Set Fee</h2>
            <form onSubmit={submit}>
                <label htmlFor='fee'>Fee</label>
                <input
                    type='number'
                    name='fee'
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                />
                <button type='submit'>Set Fee</button>
            </form>
        </div>
    );
};

export default SetFee;