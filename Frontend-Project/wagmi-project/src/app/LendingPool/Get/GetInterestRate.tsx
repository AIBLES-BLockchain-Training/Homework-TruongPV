import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../Function.css';

const GetInterestRate = () => {
    const [interestRate, setInterestRate] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getInterestRate = async () => {
        setError(null);
        setInterestRate(null);
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'interestRate',
                args: [],
            });
            setInterestRate(result as string);
        } catch (err: any) {
            setError('Lỗi truy vấn: ' + (err?.message || err));
        }
    };

    return (
        <div className="form-container">
            <h2>Get Interest Rate</h2>
            <button type='button' onClick={getInterestRate}>Get Interest Rate</button>
            <div className="admin">
                <h6>Interest Rate: {interestRate !== null ? interestRate : 'N/A'}</h6>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default GetInterestRate;
