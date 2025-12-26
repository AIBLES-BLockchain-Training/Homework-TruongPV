import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../Function.css';

const GetPriceOracle = () => {
    const [priceOracle, setPriceOracle] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getPriceOracle = async () => {
        setError(null);
        setPriceOracle(null);
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'priceOracle',
                args: [],
            });
            setPriceOracle(result as string);
        } catch (err: any) {
            setError('Lỗi truy vấn: ' + (err?.message || err));
        }
    };

    return (
        <div className="form-container">
            <h2>Get Price Oracle</h2>
            <button type='button' onClick={getPriceOracle}>Get Price Oracle</button>
            <div className="admin">
                <h6>Price Oracle: {priceOracle !== null ? priceOracle : 'N/A'}</h6>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default GetPriceOracle;
