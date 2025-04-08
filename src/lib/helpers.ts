import { AnchorProvider, BN } from '@coral-xyz/anchor';
import { getProgram, getVaultPda } from '../utils/program';
import { LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';

// API Constants
const DREAMWALK_API_BASE_URL = 'https://dreamwalk-be-production.up.railway.app';
const DREAMWALK_API_ENDPOINTS = {
    SEND_FUNDS_ENTRY: '/sendFundsEntry'
} as const;
const FUNDS_ENTRY_DEFAULTS = {
    MIN_AMOUNT: 10,
    MAX_AMOUNT: 100
} as const;

// Add type declaration for window.solana
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    solana?: any;
  }
}

export async function handleAccountDeposit(
  amount: number,
  minPercentage: number,
  maxPercentage: number,
  destinationAddress: string,
  connection: Connection,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: any
) {
    try {
        const depositAmount = new BN(amount * LAMPORTS_PER_SOL);
        
        if (!wallet) {
            throw new Error('Wallet not connected');
        }
        console.log("🚀 ~ handleAccountDeposit ~ wallet:", wallet);
        const provider = new AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed'
        });
        
        const program = getProgram(provider);
        const { vaultKey, bump } = getVaultPda();
        
        console.log("🚀 ~ handleAccountDeposit ~ vaultKey:", vaultKey);
        console.log("🚀 ~ handleAccountDeposit ~ bump:", bump);
        console.log("🚀 ~ handleAccountDeposit ~ provider:", provider.wallet);
        console.log("🚀 ~ handleAccountDeposit ~ program:", program);
        const tx = await program.methods
            .deposit(depositAmount)
            .accounts({
                vault: vaultKey,
                user: provider.wallet.publicKey,
                // systemProgram: web3.SystemProgram.programId
            })
            .rpc();
        console.log("🚀 ~ handleAccountDeposit ~ tx:", tx);

        // Call Dreamwalk backend API
        const minAmount = (minPercentage / 100) * amount;
        const maxAmount = (maxPercentage / 100) * amount;
        
        const response = await fetch(`${DREAMWALK_API_BASE_URL}${DREAMWALK_API_ENDPOINTS.SEND_FUNDS_ENTRY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                minAmount: minAmount,
                maxAmount: maxAmount,
                receiverAddress: destinationAddress
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send funds entry to Dreamwalk backend');
        }

        const apiResponse = await response.json();
        console.log("🚀 ~ handleAccountDeposit ~ apiResponse:", apiResponse);

        return { tx, apiResponse };
        
    } catch (error) {
        console.error('Error in handleAccountDeposit:', error);
        throw error;
    }
}