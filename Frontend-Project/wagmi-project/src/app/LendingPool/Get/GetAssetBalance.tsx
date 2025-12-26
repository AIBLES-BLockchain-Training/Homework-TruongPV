import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../Function.css';

const GetAssetBalance = () => {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getAssetBalance = async () => {
        setError(null);
        setBalance(null);
        if (!address) {
            setError('Vui lòng nhập địa chỉ.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'assetBalance',
                args: [address],
            });
            setBalance(result?.toString() ?? '0');
        } catch (err: any) {
            setError('Lỗi truy vấn: ' + (err?.message || err));
        }
    };

    return (
        <div className="form-container">
            <h2>Get Asset Balance</h2>
            <div className="token-input">
                <label htmlFor="address">Address Asset</label>
                <input
                    type="text"
                    name="address"
                    placeholder="0x..."
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    autoComplete="off"
                />
            </div>
            <button type="button" onClick={getAssetBalance}>Get Asset Balance</button>
            <div className="admin">
                <h6>Balance: {balance !== null ? balance : 'N/A'}</h6>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default GetAssetBalance;
