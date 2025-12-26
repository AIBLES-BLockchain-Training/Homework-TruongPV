import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../Function.css';

const GetLenderAssets = () => {
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [result, setResult] = useState<{ amount: string; liquityIndex: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getLenderAssets = async () => {
        setError(null);
        setResult(null);
        if (!address1 || !address2) {
            setError('Vui lòng nhập đủ hai địa chỉ.');
            return;
        }
        try {
            const res = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'lenderAssets',
                args: [address1, address2],
            });
            if (Array.isArray(res) && res.length === 2) {
                setResult({ amount: res[0].toString(), liquityIndex: res[1].toString() });
            } else {
                setResult({ amount: '0', liquityIndex: '0' });
            }
        } catch (err: any) {
            setError('Lỗi truy vấn: ' + (err?.message || err));
        }
    };

    return (
        <div className="form-container">
            <h2>Get Lender Assets</h2>
            <div className="token-input">
                <label htmlFor="address1">Address 1</label>
                <input
                    type="text"
                    name="address1"
                    placeholder="0x..."
                    value={address1}
                    onChange={e => setAddress1(e.target.value)}
                    autoComplete="off"
                />
            </div>
            <div className="token-input">
                <label htmlFor="address2">Address 2</label>
                <input
                    type="text"
                    name="address2"
                    placeholder="0x..."
                    value={address2}
                    onChange={e => setAddress2(e.target.value)}
                    autoComplete="off"
                />
            </div>
            <button type="button" onClick={getLenderAssets}>Get Lender Assets</button>
            <div className="admin">
                <h6>Amount: {result ? result.amount : 'N/A'}</h6>
                <h6>Liquity Index: {result ? result.liquityIndex : 'N/A'}</h6>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default GetLenderAssets;
