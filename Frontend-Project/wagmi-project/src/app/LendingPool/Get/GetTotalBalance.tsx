import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../Function.css';

const GetTotalBalance = () => {
    const [asset, setAsset] = useState('');
    const [balances, setBalances] = useState<[string, string] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getBalances = async () => {
        setError(null);
        setBalances(null);
        if (!asset) {
            setError('Vui lòng nhập địa chỉ asset.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getTotalBalance',
                args: [asset],
            });
            if (Array.isArray(result) && result.length === 2) {
                setBalances([result[0].toString(), result[1].toString()]);
            } else {
                setBalances(['0', '0']);
            }
        } catch (err: any) {
            setError('Lỗi truy vấn: ' + (err?.message || err));
        }
    };

    return (
        <div className="form-container">
            <h2>Get Total Balance</h2>
            <div className="token-input">
                <label htmlFor="asset">Asset Address</label>
                <input
                    type="text"
                    name="asset"
                    placeholder="0x..."
                    value={asset}
                    onChange={e => setAsset(e.target.value)}
                    autoComplete="off"
                />
            </div>
            <button type="button" onClick={getBalances}>Get Total Balance</button>
            <div className="admin">
                <h6>Balance 1: {balances ? balances[0] : 'N/A'}</h6>
                <h6>Balance 2: {balances ? balances[1] : 'N/A'}</h6>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default GetTotalBalance;
