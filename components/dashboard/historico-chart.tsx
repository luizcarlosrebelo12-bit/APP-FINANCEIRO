"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const NOMES_MES_ABREV = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

interface HistoricoItem {
  mes: number
  ano: number
  total_salarios: number
  total_pago: number
  saldo: number
}

export function HistoricoChart({ historico }: { historico: HistoricoItem[] }) {
  const dadosOrdenados = [...historico]
    .sort((a, b) => a.ano - b.ano || a.mes - b.mes)
    .map((h) => ({
      label: `${NOMES_MES_ABREV[h.mes - 1]}/${String(h.ano).slice(2)}`,
      Salário: h.total_salarios,
      Pago: h.total_pago,
      Sobrou: h.saldo,
    }))

  if (dadosOrdenados.length === 0) return null

  return (
    <Card className="mt-6 border-border/40">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Evolução no ano</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosOrdenados}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis
                fontSize={12}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(v)
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
                }
              />
              <Legend />
              <Bar dataKey="Salário" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pago" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sobrou" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}