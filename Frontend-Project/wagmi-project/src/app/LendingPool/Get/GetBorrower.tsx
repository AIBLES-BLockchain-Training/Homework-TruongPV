import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../Function.css';

const GetBorrower = () => {
    const [borrower, setBorrower] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getBorrower = async () => {
        setError(null);
        setBorrower(null);
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'borrower',
                args: [],
            });
            setBorrower(result as string);
        } catch (err: any) {
            setError('Lỗi truy vấn: ' + (err?.message || err));
        }
    };

    return (
        <div className="form-container">
            <h2>Get Borrower</h2>
            <button type="button" onClick={getBorrower}>Get Borrower</button>
            <div className="admin">
                <h6>Borrower: {borrower !== null ? borrower : 'N/A'}</h6>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default GetBorrower;
