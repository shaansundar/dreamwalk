import { AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import { getProgram, getVaultPda } from '../utils/program';
import { LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';

// Add type declaration for window.solana
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    solana?: any;
  }
}

export async function handleAccountDeposit(
  amount: number,
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
                systemProgram: web3.SystemProgram.programId
            })
            .rpc();
        console.log("🚀 ~ handleAccountDeposit ~ tx:", tx);
        return tx;
    } catch (error) {
        console.error('Error in handleAccountDeposit:', error);
        throw error;
    }
}