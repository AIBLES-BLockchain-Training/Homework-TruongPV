import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address, hexToBytes } from 'viem';
import '../Function.css';

const GetCheckUpkeep = () => {
    const [inputBytes, setInputBytes] = useState<string>('');
    const [result, setResult] = useState<{ upkeepNeeded: string, performData: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const account = useAccount();

    const getCheckUpkeep = async () => {
        setError(null);
        setResult(null);
        try {
            // Ensure input is a valid hex string (0x...)
            let bytesArg: `0x${string}` = inputBytes as `0x${string}`;
            if (!bytesArg.startsWith('0x')) {
                setError('Input must be a hex string starting with 0x');
                return;
            }
            const res = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'checkUpkeep',
                args: [bytesArg],
            });
            // res is [bool, bytes]
            if (Array.isArray(res) && res.length === 2) {
                setResult({
                    upkeepNeeded: res[0] ? 'true' : 'false',
                    performData: res[1]?.toString() ?? ''
                });
            } else {
                setError('Unexpected contract return value');
            }
        } catch (err: any) {
            setError(err?.message || 'Error fetching checkUpkeep');
            console.error('Error fetching checkUpkeep:', err);
        }
    }

    return (
        <div className="form-container">
            <h2>Check Upkeep</h2>
            <div>
                <label>Input Bytes (hex)</label>
                <input
                    type="text"
                    value={inputBytes}
                    onChange={e => setInputBytes(e.target.value)}
                    placeholder="e.g. 0x"
                />
            </div>
            <button type="button" onClick={getCheckUpkeep}>Check Upkeep</button>
            <div className="admin">
                {error && <h6 style={{ color: 'red' }}>{error}</h6>}
                <h6>
                    {result
                        ? <>Upkeep Needed: {result.upkeepNeeded} <br />Perform Data: {result.performData}</>
                        : !error && 'N/A'}
                </h6>
            </div>
        </div>
    );
};

export default GetCheckUpkeep;