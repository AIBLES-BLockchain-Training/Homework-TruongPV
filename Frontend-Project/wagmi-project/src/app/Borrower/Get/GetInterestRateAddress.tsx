import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi'; 
import { Address } from 'viem';
import '../Function.css'; 

const GetInterestRateAddress = () => {
    const [interestRate, setInterestRate] = useState<string | null>(null); 
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const account = useAccount();

    const getInterestRate = async () => {
        setErrorMsg(null);
        setInterestRate(null);
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'interestRate',
                args: [],
            });
            setInterestRate(result as string);
        } catch (error: any) {
            setErrorMsg('Error fetching interest rate address');
            console.error('Error fetching interest rate address:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Get Interest Rate Address</h2>
            <button type='button' onClick={getInterestRate}>Get Interest Rate</button>
            <div className="admin" style={{ marginTop: '12px' }}>
                <h6>Interest Rate Address: {interestRate !== null ? interestRate : 'N/A'}</h6>
                {errorMsg && <h6 style={{ color: 'red' }}>{errorMsg}</h6>}
            </div>
        </div>
    );
};

export default GetInterestRateAddress;
