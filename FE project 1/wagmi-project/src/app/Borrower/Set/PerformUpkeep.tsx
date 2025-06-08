import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address, hexToBytes } from 'viem';
import "../Function.css";

const PerformUpkeep = () => {
    const [performData, setPerformData] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!performData) {
            alert('Please provide performData (hex string).');
            return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'performUpkeep',
                args: [performData],
                account: account.address as Address,
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling performUpkeep:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Perform Upkeep</h2>
            <form onSubmit={submit}>
                <label htmlFor='performData'>Perform Data (hex string)</label>
                <input
                    type='text'
                    name='performData'
                    value={performData}
                    onChange={(e) => setPerformData(e.target.value)}
                    placeholder="0x..."
                />
                <button type='submit'>Perform Upkeep</button>
            </form>
        </div>
    );
};

export default PerformUpkeep;