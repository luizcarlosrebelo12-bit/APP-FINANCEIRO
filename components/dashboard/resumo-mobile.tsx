"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { Valor } from "@/components/ui/valor"

interface ResumoMobileProps {
  totalReceitas: number
  totalDespesas: number
}

export function ResumoMobile({ totalReceitas, totalDespesas }: ResumoMobileProps) {
  const saldo = totalReceitas - totalDespesas

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 md:hidden">
      <Card className="border-success/30 bg-success/5 shadow-lg shadow-success/5 transition-colors hover:border-success/50">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-success/10 mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Receitas</p>
            <Valor amount={totalReceitas} className="text-sm font-mono font-bold text-success mt-1 block truncate w-full" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5 shadow-lg shadow-destructive/5 transition-colors hover:border-destructive/50">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-destructive/10 mb-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Despesas</p>
            <Valor amount={totalDespesas} className="text-sm font-mono font-bold text-destructive mt-1 block truncate w-full" />
          </div>
        </CardContent>
      </Card>

      <Card
        className={`shadow-lg transition-colors ${
          saldo >= 0
            ? "border-primary/30 bg-primary/5 shadow-primary/5 hover:border-primary/50"
            : "border-destructive/30 bg-destructive/5 shadow-destructive/5 hover:border-destructive/50"
        }`}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col items-center text-center">
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl mb-2 ${saldo >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
              <Wallet className={`h-5 w-5 ${saldo >= 0 ? "text-primary" : "text-destructive"}`} />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Saldo</p>
            <Valor
              amount={saldo}
              className={`text-sm font-mono font-bold mt-1 block truncate w-full ${saldo >= 0 ? "text-primary" : "text-destructive"}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}