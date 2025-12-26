import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../Function.css';


const GetFee = () => {
    const [fee, setFee] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getFee = async () => {
        setError(null);
        setFee(null);
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'fee',
                args: [],
            });
            setFee(result?.toString() ?? '0');
        } catch (err: any) {
            setError('Lỗi truy vấn: ' + (err?.message || err));
        }
    };

    return (
        <div className="form-container">
            <h2>Get Fee</h2>
            <button type='button' onClick={getFee}>Get Fee</button>
            <div className="admin">
                <h6>Fee: {fee !== null ? fee : 'N/A'}</h6>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default GetFee;
