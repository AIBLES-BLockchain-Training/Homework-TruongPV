import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetReserves = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [reserve, setReserve] = useState<{
        liquidityIndex: string;
        variableBorrowIndex: string;
        currentLiquidityRate: string;
        currentVariableBorrowRate: string;
        lastUpdateTimestamp: string;
    } | null>(null);
    const account = useAccount();

    const getReserve = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'reserves',
                args: [tokenAddress],
            });
            setReserve({
                liquidityIndex: (result as any).liquidityIndex.toString(),
                variableBorrowIndex: (result as any).variableBorrowIndex.toString(),
                currentLiquidityRate: (result as any).currentLiquidityRate.toString(),
                currentVariableBorrowRate: (result as any).currentVariableBorrowRate.toString(),
                lastUpdateTimestamp: (result as any).lastUpdateTimestamp.toString(),
            });
        } catch (error) {
            console.error('Error fetching reserves:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Reserves</h2>
            <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter token address..."
            />
            <button type='button' onClick={getReserve} disabled={!tokenAddress}>
                Get Reserves
            </button>
            <div className="admin">
                {reserve ? (
                    <div>
                        <h6>Liquidity Index: {reserve.liquidityIndex}</h6>
                        <h6>Variable Borrow Index: {reserve.variableBorrowIndex}</h6>
                        <h6>Current Liquidity Rate: {reserve.currentLiquidityRate}</h6>
                        <h6>Current Variable Borrow Rate: {reserve.currentVariableBorrowRate}</h6>
                        <h6>Last Update Timestamp: {reserve.lastUpdateTimestamp}</h6>
                    </div>
                ) : (
                    <h6>Reserves: N/A</h6>
                )}
            </div>
        </div>
    );
};

export default GetReserves;