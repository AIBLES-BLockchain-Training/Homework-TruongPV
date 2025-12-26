import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../Function.css';

const GetAllValidCollateralTokens = () => {
    const [tokens, setTokens] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getTokens = async () => {
        setError(null);
        setTokens(null);
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getAllValidCollateralTokens',
                args: [],
            });
            setTokens(result as string[]);
        } catch (err: any) {
            setError('Lỗi truy vấn: ' + (err?.message || err));
        }
    };

    return (
        <div className="form-container">
            <h2>Get All Valid Collateral Tokens</h2>
            <button type='button' onClick={getTokens}>Get Tokens</button>
            <div className="admin">
                <h6>Tokens:</h6>
                {tokens && tokens.length > 0 ? (
                    <ul style={{fontSize: '13px', margin: 0, paddingLeft: 16}}>
                        {tokens.map((token, idx) => (
                            <li key={idx}>{token}</li>
                        ))}
                    </ul>
                ) : (
                    <span>{tokens ? 'Không có token hợp lệ.' : 'N/A'}</span>
                )}
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default GetAllValidCollateralTokens;
