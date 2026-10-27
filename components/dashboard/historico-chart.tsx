"use client"

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const NOMES_MES_ABREV = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

const NOME_SALARIO = "Salário"
const NOME_PAGO = "Total Pago"
const NOME_SALDO = "Saldo Poupado"
const NOME_TAXA = "Taxa de Poupança"

interface HistoricoItem {
  mes: number
  ano: number
  total_salarios: number
  total_pago: number
  saldo: number
}

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

const pct = (v: number) => `${v.toFixed(1).replace(".", ",")}%`

export function HistoricoChart({ historico }: { historico: HistoricoItem[] }) {
  const dadosOrdenados = [...historico]
    .sort((a, b) => a.ano - b.ano || a.mes - b.mes)
    .map((h) => {
      const salario = Number(h.total_salarios) || 0
      const saldo = Number(h.saldo) || 0
      return {
        label: `${NOMES_MES_ABREV[h.mes - 1]}/${String(h.ano).slice(2)}`,
        [NOME_SALARIO]: salario,
        [NOME_PAGO]: Number(h.total_pago) || 0,
        [NOME_SALDO]: saldo,
        // % do salário que foi guardado no mês
        [NOME_TAXA]: salario > 0 ? Math.round((saldo / salario) * 1000) / 10 : 0,
      }
    })

  if (dadosOrdenados.length === 0) return null

  const taxas = dadosOrdenados.map((d) => d[NOME_TAXA] as number)
  const taxaMedia = taxas.reduce((a, b) => a + b, 0) / taxas.length
  const taxaUltimo = taxas[taxas.length - 1]

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Evolução e Taxa de Poupança</CardTitle>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-secondary/50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Último mês</p>
            <p className="font-mono text-lg font-semibold text-primary">{pct(taxaUltimo)}</p>
          </div>
          <div className="rounded-xl bg-secondary/50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Média do período</p>
            <p className="font-mono text-lg font-semibold">{pct(taxaMedia)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dadosOrdenados}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis
                yAxisId="left"
                fontSize={12}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(v)
                }
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === NOME_TAXA ? pct(value) : brl(value)
                }
              />
              <Legend />
              <Bar yAxisId="left" dataKey={NOME_SALARIO} fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey={NOME_PAGO} fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey={NOME_SALDO} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={NOME_TAXA}
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}