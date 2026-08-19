import Link from "next/link"
import { getHistoricoMensal } from "@/app/actions"
import { Card, CardContent } from "@/components/ui/card"
import { HistoricoCard } from "@/components/dashboard/historico-card"
import { HistoricoChart } from "@/components/dashboard/historico-chart"
import { ArrowLeft } from "lucide-react"

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
          <HistoricoCard key={h.id} item={h} />
        ))}
      </div>

      {historico && historico.length > 0 && <HistoricoChart historico={historico} />}
    </div>
  )
}