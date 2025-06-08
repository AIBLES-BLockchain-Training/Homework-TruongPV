import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetInterestParams = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [params, setParams] = useState<{
        slope1: string;
        slope2: string;
        baseRate: string;
        utilizationOptimal: string;
    } | null>(null);
    const account = useAccount();

    const getParams = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'interestParams',
                args: [tokenAddress],
            });
            // result is an object with keys: slope1, slope2, baseRate, utilizationOptimal
            setParams({
                slope1: (result as any).slope1.toString(),
                slope2: (result as any).slope2.toString(),
                baseRate: (result as any).baseRate.toString(),
                utilizationOptimal: (result as any).utilizationOptimal.toString(),
            });
        } catch (error) {
            console.error('Error fetching interest params:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Interest Params</h2>
            <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter token address..."
            />
            <button type='button' onClick={getParams} disabled={!tokenAddress}>
                Get Params
            </button>
            <div className="admin">
                {params ? (
                    <div>
                        <h6>Slope1: {params.slope1}</h6>
                        <h6>Slope2: {params.slope2}</h6>
                        <h6>Base Rate: {params.baseRate}</h6>
                        <h6>Utilization Optimal: {params.utilizationOptimal}</h6>
                    </div>
                ) : (
                    <h6>Params: N/A</h6>
                )}
            </div>
        </div>
    );
};

export default GetInterestParams;