"use client"
import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal as useSolanaWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from '../ui/button';
const Header = () => {
    const { wallet } = useWallet();

    const publicKey = wallet?.adapter.publicKey?.toBase58();

    const { setVisible: setSolanaModalVisible } = useSolanaWalletModal();
    return (
        <div className="flex h-20 absolute top-0 z-20 p-4 w-screen justify-between items-center">
            <h1 className="text-2xl font-bold">💤 DreamWalk</h1>
            {wallet?.adapter.connected ? <Button onClick={() => wallet?.adapter.disconnect()}>{publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}</Button> : <Button onClick={() => setSolanaModalVisible(true)}>Connect Wallet</Button>}
        </div>
    )
}

export default Header