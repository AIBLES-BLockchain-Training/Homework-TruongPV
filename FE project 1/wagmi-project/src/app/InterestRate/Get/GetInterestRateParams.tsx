import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetInterestRateParams = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [params, setParams] = useState<[string, string, string, string] | null>(null);
    const account = useAccount();

    const getParams = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getInterestRateParmas',
                args: [tokenAddress],
            });
            // result is [slope1, slope2, baseRate, utilizationOptimal]
            setParams((result as bigint[]).map(x => x.toString()) as [string, string, string, string]);
        } catch (error) {
            console.error('Error fetching interest rate params:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Interest Rate Params</h2>
            <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter token address..."
            />
            <button type="button" onClick={getParams} disabled={!tokenAddress}>
                Get Params
            </button>
            <div className="admin">
                {params ? (
                    <div>
                        <h6>Slope1: {params[0]}</h6>
                        <h6>Slope2: {params[1]}</h6>
                        <h6>Base Rate: {params[2]}</h6>
                        <h6>Utilization Optimal: {params[3]}</h6>
                    </div>
                ) : (
                    <h6>Params: N/A</h6>
                )}
            </div>
        </div>
    );
};

export default GetInterestRateParams;