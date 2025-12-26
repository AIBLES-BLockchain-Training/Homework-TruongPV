import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi'; 
import { Address } from 'viem';
import '../Function.css'; 

const GetLendingPoolAddress = () => {
    const [lendingPool, setLendingPool] = useState<string | null>(null); 
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const account = useAccount();

    const getLendingPool = async () => {
        setErrorMsg(null);
        setLendingPool(null);
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'lendingPool',
                args: [],
            });
            setLendingPool(result as string);
        } catch (error: any) {
            setErrorMsg('Error fetching lending pool address');
            console.error('Error fetching lending pool address:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Lending Pool Address</h2>
            <button type='button' onClick={getLendingPool}>Get Lending Pool</button>
            <div className="admin" style={{ marginTop: '12px' }}>
                <h6>Lending Pool Address: {lendingPool !== null ? lendingPool : 'N/A'}</h6>
                {errorMsg && <h6 style={{ color: 'red' }}>{errorMsg}</h6>}
            </div>
        </div>
    );
};

export default GetLendingPoolAddress;
