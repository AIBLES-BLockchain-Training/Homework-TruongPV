import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../Function.css';

const GetCurrentUtilizationRate = () => {
    const [asset, setAsset] = useState('');
    const [rate, setRate] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getRate = async () => {
        setError(null);
        setRate(null);
        if (!asset) {
            setError('Vui lòng nhập địa chỉ asset.');
            return;
        }
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getCurrentUtilizationRate',
                args: [asset],
            });
            setRate(result?.toString() ?? '0');
        } catch (err: any) {
            setError('Lỗi truy vấn: ' + (err?.message || err));
        }
    };

    return (
        <div className="form-container">
            <h2>Get Current Utilization Rate</h2>
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
            <button type="button" onClick={getRate}>Get Utilization Rate</button>
            <div className="admin">
                <h6>Utilization Rate: {rate !== null ? rate : 'N/A'}</h6>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default GetCurrentUtilizationRate;
