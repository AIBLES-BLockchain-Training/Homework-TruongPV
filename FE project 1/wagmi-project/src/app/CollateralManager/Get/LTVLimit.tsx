import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const GetLTVLimit = () => {
    const [ltvLimit, setLtvLimit] = useState<string | null>(null);
    const account = useAccount();

    const getLTVLimit = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'LTVLimit',
                args: [],
            });
            setLtvLimit((result as bigint).toString());
        } catch (error) {
            console.error('Error fetching LTVLimit:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get LTV Limit</h2>
            <button type='button' onClick={getLTVLimit}>Get LTV Limit</button>
            <div className="admin">
                <h6>LTV Limit: {ltvLimit ? ltvLimit : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetLTVLimit;