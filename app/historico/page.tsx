import Link from "next/link"
import { getHistoricoMensal } from "@/app/actions"
import { Card, CardContent } from "@/components/ui/card"
import { HistoricoCard } from "@/components/dashboard/historico-card"
import { HistoricoChart } from "@/components/dashboard/historico-chart"
import { ArrowLeft } from "lucide-react"

export default async function HistoricoPage() {
  const historico = await getHistoricoMensal()
  const temDados = !!historico && historico.length > 0

  return (
    <div className="container mx-auto px-4 py-5 max-w-3xl">
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold tracking-tight leading-tight">Histórico mensal</h1>
          <p className="text-xs text-muted-foreground">
            Meses fechados e arquivados{temDados ? ` · ${historico.length}` : ""}
          </p>
        </div>
      </div>

      {!temDados && (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            Nenhum mês fechado ainda. Use o botão &quot;Fechar mês&quot; no dashboard quando terminar de pagar tudo.
          </CardContent>
        </Card>
      )}

      {temDados && <HistoricoChart historico={historico} />}

      {/* Lista compacta: uma linha por mês, espaçamento curto */}
      <div className="mt-4 flex flex-col gap-2">
        {historico?.map((h: any) => (
          <HistoricoCard key={h.id} item={h} />
        ))}
      </div>
    </div>
  )
}