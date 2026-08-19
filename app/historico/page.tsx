import Link from "next/link"
import { getHistoricoMensal } from "@/app/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Valor } from "@/components/ui/valor"
import { ArrowLeft, CalendarDays, TrendingUp, TrendingDown, Wallet } from "lucide-react"

const NOMES_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export default async function HistoricoPage() {
  const historico = await getHistoricoMensal()

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Histórico mensal</h1>
          <p className="text-sm text-muted-foreground">Meses fechados e arquivados</p>
        </div>
      </div>

      {(!historico || historico.length === 0) && (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            Nenhum mês fechado ainda. Use o botão &quot;Fechar mês&quot; no dashboard quando terminar de pagar tudo.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {historico?.map((h: any) => (
          <Card key={h.id} className="overflow-hidden border-border/40 shadow-lg shadow-black/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                  <CalendarDays className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {NOMES_MES[h.mes - 1]} de {h.ano}
                </h2>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="w-3.5 h-3.5" /> Salário
                  </span>
                  <Valor amount={h.total_salarios} className="font-mono font-medium text-success" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingDown className="w-3.5 h-3.5" /> Pago
                  </span>
                  <Valor amount={h.total_pago} className="font-mono font-medium text-destructive" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <Wallet className="w-4 h-4" /> Sobrou
                </span>
                <Valor
                  amount={h.saldo}
                  className={`text-xl font-bold font-mono ${h.saldo >= 0 ? "text-primary" : "text-destructive"}`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}