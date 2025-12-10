
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator as CalculatorIcon } from "lucide-react";
import { Slider } from '@/components/ui/slider';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
};

export default function LoanCalculatorPage() {
    const [loanAmount, setLoanAmount] = useState(2500000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);
    const [monthlyEmi, setMonthlyEmi] = useState<number | null>(null);

    useEffect(() => {
      calculateEmi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loanAmount, interestRate, loanTenure]);

    const calculateEmi = () => {
        if (!loanAmount || !interestRate || !loanTenure) return;

        const principal = loanAmount;
        const rate = interestRate / 100 / 12;
        const time = loanTenure * 12;

        if (principal <= 0 || rate <= 0 || time <= 0) {
            setMonthlyEmi(0);
            return;
        }

        const emi = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
        setMonthlyEmi(emi);
    };
    
    const totalPayable = (monthlyEmi || 0) * loanTenure * 12;
    const totalInterest = totalPayable > 0 ? totalPayable - loanAmount : 0;


    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2">
                        <CalculatorIcon className="text-primary" /> Home Loan EMI Calculator
                    </CardTitle>
                    <CardDescription>
                        Instantly estimate the monthly payments for your dream home.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="loan-amount">Loan Amount (₹)</Label>
                             <span className="font-bold text-lg text-primary">{formatCurrency(loanAmount)}</span>
                        </div>
                        <Slider
                            id="loan-amount"
                            min={100000}
                            max={20000000}
                            step={100000}
                            value={[loanAmount]}
                            onValueChange={(vals) => setLoanAmount(vals[0])}
                        />
                    </div>

                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                             <span className="font-bold text-lg text-primary">{interestRate.toFixed(2)} %</span>
                        </div>
                        <Slider
                            id="interest-rate"
                            min={5}
                            max={15}
                            step={0.05}
                            value={[interestRate]}
                            onValueChange={(vals) => setInterestRate(vals[0])}
                        />
                    </div>

                     <div className="space-y-4">
                         <div className="flex justify-between items-center">
                             <Label htmlFor="loan-tenure">Loan Tenure (Years)</Label>
                            <span className="font-bold text-lg text-primary">{loanTenure} Years</span>
                        </div>
                        <Slider
                            id="loan-tenure"
                            min={1}
                            max={30}
                            step={1}
                            value={[loanTenure]}
                            onValueChange={(vals) => setLoanTenure(vals[0])}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    {monthlyEmi !== null && (
                        <div className="w-full mt-6 p-6 bg-muted/50 rounded-lg text-center space-y-4">
                            <div>
                                <p className="text-muted-foreground">Your Monthly EMI</p>
                                <p className="text-3xl font-bold text-primary">{formatCurrency(monthlyEmi)}</p>
                            </div>
                            <div className="flex justify-around pt-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Total Interest</p>
                                    <p className="font-semibold">{formatCurrency(totalInterest)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Total Payable</p>
                                    <p className="font-semibold">{formatCurrency(totalPayable)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
