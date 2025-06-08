import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const CheckUpkeep = () => {
    const [input, setInput] = useState<string>('');
    const [result, setResult] = useState<{ upkeepNeeded: boolean; performData: string } | null>(null);
    const account = useAccount();

    const checkUpkeep = async () => {
        if (!input) {
            alert('Please provide the bytes input.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'checkUpkeep',
                args: [input],
            });
            setResult({
                upkeepNeeded: (result as [boolean, string])[0],
                performData: (result as [boolean, string])[1],
            });
        } catch (error) {
            console.error('Error calling checkUpkeep:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Check Upkeep</h2>
            <label htmlFor='input'>Bytes Input</label>
            <input
                type='text'
                name='input'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="0x..."
            />
            <button type='button' onClick={checkUpkeep}>Check</button>
            <div className="admin">
                <h6>
                    {result
                        ? `Upkeep Needed: ${result.upkeepNeeded ? 'Yes' : 'No'} | Perform Data: ${result.performData}`
                        : 'N/A'}
                </h6>
            </div>
        </div>
    );
};

export default CheckUpkeep;