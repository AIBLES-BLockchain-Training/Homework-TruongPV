import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetInterestRateParams = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [params, setParams] = useState<Array<string> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const account = useAccount();

    const getParams = async () => {
        setError(null);
        setParams(null);
        if (!tokenAddress || tokenAddress.length !== 42) {
            setError('Please enter a valid token address.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getInterestRateParmas',
                args: [tokenAddress],
            });
            if (Array.isArray(result)) {
                setParams(result.map(x => x.toString()));
            } else {
                setParams(null);
            }
        } catch (error) {
            setError('Error fetching interest rate params.');
            console.error('Error fetching interest rate params:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Interest Rate Params</h2>
            <input
                type="text"
                placeholder="Token address"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
                className="input-field"
            />
            <button type='button' onClick={getParams}>Get Params</button>
            {error && <div className="error">{error}</div>}
            <div className="admin">
                {params ? (
                    <>
                        <h6>Slope1: {params[0]}</h6>
                        <h6>Slope2: {params[1]}</h6>
                        <h6>Base Rate: {params[2]}</h6>
                        <h6>Utilization Optimal: {params[3]}</h6>
                    </>
                ) : (
                    <h6>Params: N/A</h6>
                )}
            </div>
        </div>
    );
};

export default GetInterestRateParams;
