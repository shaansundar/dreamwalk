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


  useEffect(() => {
    if (randomnessRange.to - randomnessRange.from < 10) {
      setFormState((prev) => ({ ...prev, isWarning: true, message: "Your funds are more prone to be traced if the range is too small" }));
    } else {
      setFormState((prev) => ({ ...prev, isWarning: false, message: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [randomnessRange.from, randomnessRange.to]);


  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const tableValues = [
    {
      title: "Amount",
      value: formState.amount,
    },
    {
      title: "Destination Address",
      value: formState.destinationAddress,
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
      value: "0.001 SOL",
    },
    {
      title: "Maximum Receivable Amount",
      value: "0.005 SOL",
    },
  ]


  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
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
                <Label>Amount</Label>
                <Input type="number" placeholder="0.00" name="amount" onChange={handleFormChange} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Destination Address</Label>
                <Input type="text" placeholder="J8SupDkrcr8z25XC4BZJcUdZ5h8Hyf9R9S6oAY3rXNN" name="destinationAddress" onChange={handleFormChange} />
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
            <Separator orientation="vertical" />
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
            <Button className="w-full" onClick={() => handleAccountDeposit(formState.amount, formState.destinationAddress, connection, window.solana)} disabled={formState.isError}>Mix</Button>
            {(formState.isWarning || formState.isError) ? <p className={cn("text-xs flex items-center justify-center text-center", formState.isWarning ? "text-yellow-500" : "text-red-500")}>
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
