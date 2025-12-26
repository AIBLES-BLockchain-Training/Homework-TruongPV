import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetReserveData = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [reserveData, setReserveData] = useState<[string, string, string, string] | null>(null);
    const account = useAccount();

    const getData = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getReserveData',
                args: [tokenAddress],
            });
            // result is [liquidityIndex, variableBorrowIndex, currentLiquidityRate, currentVariableBorrowRate]
            setReserveData((result as bigint[]).map(x => x.toString()) as [string, string, string, string]);
        } catch (error) {
            console.error('Error fetching reserve data:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Reserve Data</h2>
            <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter token address..."
            />
            <button type="button" onClick={getData} disabled={!tokenAddress}>
                Get Reserve Data
            </button>
            <div className="admin">
                {reserveData ? (
                    <div>
                        <h6>Liquidity Index: {reserveData[0]}</h6>
                        <h6>Variable Borrow Index: {reserveData[1]}</h6>
                        <h6>Current Liquidity Rate: {reserveData[2]}</h6>
                        <h6>Current Variable Borrow Rate: {reserveData[3]}</h6>
                    </div>
                ) : (
                    <h6>Reserve Data: N/A</h6>
                )}
            </div>
        </div>
    );
};

export default GetReserveData;