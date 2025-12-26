import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi'; 
import { Address } from 'viem';
import '../Function.css'; 

const GetCurrentVariableBorrowRate = () => {
    const [assetAddress, setAssetAddress] = useState('');
    const [borrowRate, setBorrowRate] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const account = useAccount();

    const getBorrowRate = async () => {
        setErrorMsg(null);
        setBorrowRate(null);
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getCurrentVariableBorrowRate',
                args: [assetAddress],
            });
            setBorrowRate(result?.toString() ?? '0');
        } catch (error: any) {
            setErrorMsg('Error fetching borrow rate');
            console.error('Error fetching borrow rate:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Current Variable Borrow Rate</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                    type="text"
                    placeholder="Asset address (0x...)"
                    value={assetAddress}
                    onChange={e => setAssetAddress(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button type="button" onClick={getBorrowRate} style={{ background: '#c7b6f7', color: '#222', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 'bold' }}>
                    Get Borrow Rate
                </button>
            </div>
            <div className="admin" style={{ marginTop: '12px' }}>
                <h6>Borrow Rate: {borrowRate !== null ? borrowRate : 'N/A'}</h6>
                {errorMsg && <h6 style={{ color: 'red' }}>{errorMsg}</h6>}
            </div>
        </div>
    );
};

export default GetCurrentVariableBorrowRate;
