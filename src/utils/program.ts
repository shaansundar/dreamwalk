import { AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import { Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { Dreamwalk } from  '../idl/dreamwalk-idl-types';
import dreamwalk from '../idl/dreamwalk-idl.json' assert { type: 'json' };
import { program } from '@coral-xyz/anchor/dist/cjs/native/system';

export const PROGRAM_ID = new PublicKey('4ocyDMLyze1f5QkzpNcizycQPanFjR6by5pLxEbmepZE');

export const getProgram = (provider: AnchorProvider) => {    
  return new Program<Dreamwalk>(dreamwalk, provider);
};

export const getVaultPda = () => {
  const [vaultKey, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    PROGRAM_ID
  );
  return { vaultKey, bump };
};