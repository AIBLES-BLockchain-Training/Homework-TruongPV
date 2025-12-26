import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css';

const CreateLoan = () => {
  const [assetAddress, setAssetAddress] = useState<string>('');
  const [assetAmount, setAssetAmount] = useState<string>('');
  const [collateralAddresses, setCollateralAddresses] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTxHash(null);
    setErrorMsg(null);
    setIsLoading(true);

    // Validation
    if (!assetAddress || !assetAmount || !collateralAddresses) {
      setErrorMsg('Please provide all required fields.');
      setIsLoading(false);
      return;
    }

    if (!account.address) {
      setErrorMsg('Please connect your wallet first.');
      setIsLoading(false);
      return;
    }

    try {
      const addressesArray = collateralAddresses
        .split(',')
        .map(addr => addr.trim())
        .filter(addr => addr);

      if (addressesArray.length === 0) {
        setErrorMsg('Please provide at least one collateral address.');
        setIsLoading(false);
        return;
      }

      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'createLoan',
        args: [assetAddress as Address, BigInt(assetAmount), addressesArray],
        account: account.address as Address,
        value: BigInt(assetAmount),
      });

      const hash = await walletClient.writeContract(request);
      setTxHash(hash as string);
      
      // Reset form on success
      setAssetAddress('');
      setAssetAmount('');
      setCollateralAddresses('');
    } catch (error: any) {
      setErrorMsg(error?.shortMessage || error?.message || 'Error calling createLoan');
      console.error('Error calling createLoan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format transaction hash for display
  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <div className="form-container fade-in">
      <h2>Create Loan</h2>
      
      <form onSubmit={submit}>
        {/* Asset Address */}
        <div className="form-group">
          <label htmlFor='assetAddress' className="form-label-required">
            Asset Address
          </label>
          <input
            type='text'
            id='assetAddress'
            name='assetAddress'
            value={assetAddress}
            onChange={(e) => setAssetAddress(e.target.value)}
            placeholder='0x...'
            disabled={isLoading}
            required
          />
          <span className="helper-text">
            Contract address of the asset you want to borrow
          </span>
        </div>

        {/* Asset Amount */}
        <div className="form-group">
          <label htmlFor='assetAmount' className="form-label-required">
            Asset Amount (wei)
          </label>
          <input
            type='text'
            id='assetAmount'
            name='assetAmount'
            value={assetAmount}
            onChange={(e) => setAssetAmount(e.target.value)}
            placeholder='1000000000000000000'
            disabled={isLoading}
            required
          />
          <span className="helper-text">
            Amount in wei (1 ETH = 10¹⁸ wei)
          </span>
        </div>

        {/* Collateral Addresses */}
        <div className="form-group">
          <label htmlFor='collateralAddresses' className="form-label-required">
            Collateral Addresses
          </label>
          <textarea
            id='collateralAddresses'
            name='collateralAddresses'
            value={collateralAddresses}
            onChange={(e) => setCollateralAddresses(e.target.value)}
            placeholder='0x..., 0x..., 0x...'
            rows={3}
            disabled={isLoading}
            required
          />
          <span className="helper-text">
            Comma-separated list of collateral token addresses
          </span>
        </div>

        {/* Submit Button */}
        <button 
          type='submit' 
          disabled={isLoading || !account.address}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            <>
              Create Loan
              <span>→</span>
            </>
          )}
        </button>
      </form>

      {/* Wallet Not Connected Warning */}
      {!account.address && (
        <div className="warning">
          <h6>⚠️ Wallet not connected. Please connect your wallet to create a loan.</h6>
        </div>
      )}

      {/* Success Result */}
      {txHash && (
        <div className="result">
          <h6>
            <strong>✅ Transaction Successful!</strong>
          </h6>
          <h6>
            Transaction Hash: <code>{formatTxHash(txHash)}</code>
          </h6>
          <a 
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--primary-600)',
              textDecoration: 'underline',
              fontSize: '0.8125rem',
              marginTop: 'var(--space-2)',
              display: 'inline-block'
            }}
          >
            View on Etherscan →
          </a>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="error">
          <h6>
            <strong>❌ Error</strong>
          </h6>
          <h6>{errorMsg}</h6>
        </div>
      )}
    </div>
  );
};

export default CreateLoan;
