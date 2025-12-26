import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../Function.css';

const IsApprovedCollateral = () => {
    const [token, setToken] = useState('');
    const [isApproved, setIsApproved] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkApproved = async () => {
        setError(null);
        setIsApproved(null);
        if (!token) {
            setError('Vui lòng nhập địa chỉ token.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'isApprovedCollateral',
                args: [token],
            });
            setIsApproved(Boolean(result));
        } catch (err: any) {
            setError('Lỗi truy vấn: ' + (err?.message || err));
        }
    };

    return (
        <div className="form-container">
            <h2>Is Approved Collateral</h2>
            <div className="token-input">
                <label htmlFor="token">Token Address</label>
                <input
                    type="text"
                    name="token"
                    placeholder="0x..."
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    autoComplete="off"
                />
            </div>
            <button type="button" onClick={checkApproved}>Check Approved</button>
            <div className="admin">
                <h6>Approved: {isApproved === null ? 'N/A' : isApproved ? 'Yes' : 'No'}</h6>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default IsApprovedCollateral;
