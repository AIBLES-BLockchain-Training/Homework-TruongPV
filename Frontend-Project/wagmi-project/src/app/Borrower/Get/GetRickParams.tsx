import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi'; 
import { Address } from 'viem';
import '../Function.css'; 

const GetRickParams = () => {
    const [assetAddress, setAssetAddress] = useState('');
    const [rickParams, setRickParams] = useState<{ liquidationThreshold: string, ltv: string } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const account = useAccount();

    const getParams = async () => {
        setErrorMsg(null);
        setRickParams(null);
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'rickParams',
                args: [assetAddress],
            });
            const arr = result as [bigint, bigint];
            setRickParams({
                liquidationThreshold: arr[0]?.toString() ?? '',
                ltv: arr[1]?.toString() ?? ''
            });
        } catch (error: any) {
            setErrorMsg('Error fetching rickParams');
            console.error('Error fetching rickParams:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Rick Params</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                    type="text"
                    placeholder="Asset address (0x...)"
                    value={assetAddress}
                    onChange={e => setAssetAddress(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button type="button" onClick={getParams}>
                    Get Rick Params
                </button>
            </div>
            <div className="admin" style={{ marginTop: '12px' }}>
                {rickParams ? (
                    <>
                        <h6>Liquidation Threshold: {rickParams.liquidationThreshold}</h6>
                        <h6>LTV: {rickParams.ltv}</h6>
                    </>
                ) : (
                    <h6>Rick Params: N/A</h6>
                )}
                {errorMsg && <h6 style={{ color: 'red' }}>{errorMsg}</h6>}
            </div>
        </div>
    );
};

export default GetRickParams;
