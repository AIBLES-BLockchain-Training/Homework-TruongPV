import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import "../Function.css";

const SetContractAddress = () => {
    const [lendingPool, setLendingPool] = useState<string>('');
    const [interestRate, setInterestRate] = useState<string>('');
    const [priceOracle, setPriceOracle] = useState<string>('');
    const [collateralManager, setCollateralManager] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!lendingPool || !interestRate || !priceOracle || !collateralManager) {
            alert('Please provide all fields.');
            return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'setContractAddress',
                args: [lendingPool, interestRate, priceOracle, collateralManager],
                account: account.address as Address,
            });
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling setContractAddress:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Set Contract Address</h2>
            <form onSubmit={submit}>
                <label htmlFor='lendingPool'>Lending Pool Address</label>
                <input
                    type='text'
                    name='lendingPool'
                    value={lendingPool}
                    onChange={(e) => setLendingPool(e.target.value)}
                />
                <label htmlFor='interestRate'>Interest Rate Address</label>
                <input
                    type='text'
                    name='interestRate'
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                />
                <label htmlFor='priceOracle'>Price Oracle Address</label>
                <input
                    type='text'
                    name='priceOracle'
                    value={priceOracle}
                    onChange={(e) => setPriceOracle(e.target.value)}
                />
                <label htmlFor='collateralManager'>Collateral Manager Address</label>
                <input
                    type='text'
                    name='collateralManager'
                    value={collateralManager}
                    onChange={(e) => setCollateralManager(e.target.value)}
                />
                <button type='submit'>Set Contract Address</button>
            </form>
        </div>
    );
};

export default SetContractAddress;