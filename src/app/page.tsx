"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { handleAccountDeposit } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
export default function Home() {

  const [formState, setFormState] = useState({
    amount: 0,
    destinationAddress: "",
    isError: false,
    isWarning: false,
    message: "",
  });

  const [randomnessRange, setRandomnessRange] = useState({
    from: 0,
    to: 100,
  });

  const { connection } = useConnection();
  const { wallet } = useWallet();

  const { data: balance } = useQuery({
    queryKey: ["balance", wallet?.adapter.publicKey],
    queryFn: async () => {
      if (!wallet?.adapter.publicKey) return null;
      const mpcEddsaPublicKey = new PublicKey(wallet?.adapter.publicKey || "");
      const lamports = await connection.getBalance(mpcEddsaPublicKey);
      return parseFloat(lamports.toString()) / LAMPORTS_PER_SOL;
    },
  });

  useEffect(() => {
    switch (true) {
      case formState.destinationAddress === "":
        setFormState((prev) => ({ ...prev, isError: true, isWarning: false, message: "Please enter a destination address" }));
        break;
      case !formState.amount:
        setFormState((prev) => ({ ...prev, isError: true, isWarning: false, message: "Please enter an amount" }));
        break;
      case balance && balance > 0 && formState.amount > balance:
        setFormState((prev) => ({ ...prev, isError: true, isWarning: false, message: "Insufficient balance" }));
        break;
      case randomnessRange.to - randomnessRange.from < 10:
        setFormState((prev) => ({ ...prev, isError: false, isWarning: true, message: "Your funds are more prone to be traced if the range is too small" }));
        break;
      default:
        setFormState((prev) => ({ ...prev, isError: false, isWarning: false, message: "" }));
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [randomnessRange.from, randomnessRange.to, formState.amount, formState.destinationAddress, balance]);


  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "amount") {
      const amount = parseFloat(e.target.value);
      if (isNaN(amount)) setFormState({ ...formState, [e.target.name]: 0 });
      else setFormState({ ...formState, [e.target.name]: amount });
    } else {
      setFormState({ ...formState, [e.target.name]: e.target.value });
    }
  };

  const tableValues = [
    {
      title: "Amount",
      value: formState.amount + " SOL",
    },
    {
      title: "Destination Address",
      value: formState.destinationAddress.slice(0, 6) + "..." + formState.destinationAddress.slice(-6) || "Not set",
    },
    {
      title: "Randomness Range",
      value: `${randomnessRange.from}% - ${randomnessRange.to}%`,
    },
    {
      title: "Mixing Fee",
      value: "0.01 SOL",
    },
    {
      title: "Minimum Receivable Amount",
      value: `${formState.amount * (randomnessRange.from / 100)} SOL`,
    },
    {
      title: "Maximum Receivable Amount",
      value: `${formState.amount * (randomnessRange.to / 100)} SOL`,
    },
  ]


  return (
    <div className="flex flex-col px-4 items-center justify-center w-full h-full">
      {/* <BackgroundGradient className="bg-zinc-900 rounded-lg"> */}
      <Card className="w-fit z-20 flex flex-col h-fit">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle>Mix Your Funds</CardTitle>
          <CardDescription className="text-xs">The mixer will mix your funds into a single pool and send a random amount of funds (within the mentioned range) to the specified destination address.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 h-full justify-between items-start">
          <div className="flex flex-col sm:flex-row gap-6 w-full h-fit">
            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Amount</Label>
                  <p className="text-xs">Balance: {balance?.toFixed(4)} SOL</p>
                </div>
                <Input type="number" placeholder="0.00" name="amount" onChange={handleFormChange} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Destination Address</Label>
                <Input type="text" placeholder="J8Su....rXNN" name="destinationAddress" onChange={handleFormChange} />
              </div>
              <div className="flex flex-col gap-4">
                <Label>Randomness Range</Label>
                <div className="flex gap-2">
                  <p className="w-10">{randomnessRange.from + "%"}</p>
                  <Slider className="flex-1" fromRange={randomnessRange.from} toRange={randomnessRange.to} onValueChange={(value) => setRandomnessRange({ from: value[0], to: value[1] })} />
                  <p className="w-10">{randomnessRange.to + "%"}</p>
                </div>
              </div>

            </div>
            <Separator className="h-full hidden sm:block" orientation="vertical" />
            <div className="flex flex-col gap-2 w-full h-full justify-evenly rounded-md border border-input bg-input p-2">
              {tableValues.map((value) => (
                <div key={value.title} className="flex justify-between">
                  <p className="text-xs">{value.title}</p>
                  <p className="text-xs">{value.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full h-fit">
            <Button disabled={formState.isError || !wallet?.adapter.connected} className="w-full" onClick={() => handleAccountDeposit(formState.amount, randomnessRange.from, randomnessRange.to, formState.destinationAddress, connection, window.solana)}>{!wallet?.adapter.connected ? "Connect Wallet" : formState.isError ? formState.message : "Mix"}</Button>
            {(formState.isWarning) ? <p className={cn("text-xs flex items-center justify-center text-center", formState.isWarning && "text-yellow-500")}>
              {formState.message}
            </p> : <p className="text-[10px] flex items-center justify-center text-center">
              Disclaimer: Please be aware that the funds you send to this mixer cannot be recovered. Please double check the destination address before sending funds.
            </p>}
          </div>
        </CardContent>
      </Card>
      {/* </BackgroundGradient> */}
    </div>
  );
}
