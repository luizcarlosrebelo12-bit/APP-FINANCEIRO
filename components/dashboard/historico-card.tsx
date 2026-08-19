"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Valor } from "@/components/ui/valor"
import { Button } from "@/components/ui/button"
import { deleteHistoricoMensal, updateHistoricoMensal } from "@/app/actions"
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Wallet,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react"

const NOMES_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

interface HistoricoCardProps {
  item: {
    id: string
    mes: number
    ano: number
    total_salarios: number
    total_pago: number
    saldo: number
  }
}

export function HistoricoCard({ item }: HistoricoCardProps) {
  const [isPending, startTransition] = useTransition()
  const [editando, setEditando] = useState(false)
  const [novoAno, setNovoAno] = useState(item.ano)

  const handleDelete = () => {
    const confirmado = window.confirm(
      `Excluir o registro de ${NOMES_MES[item.mes - 1]} de ${item.ano}? Essa ação não pode ser desfeita.`
    )
    if (!confirmado) return

    startTransition(async () => {
      await deleteHistoricoMensal(item.id)
    })
  }

  const handleSalvarAno = () => {
    startTransition(async () => {
      await updateHistoricoMensal(item.id, { ano: novoAno })
      setEditando(false)
    })
  }

  const handleCancelar = () => {
    setNovoAno(item.ano)
    setEditando(false)
  }

  return (
    <Card className="overflow-hidden border-border/40 shadow-lg shadow-black/5">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>

            {editando ? (
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-semibold tracking-tight whitespace-nowrap">
                  {NOMES_MES[item.mes - 1]} de
                </span>
                <input
                  type="number"
                  value={novoAno}
                  onChange={(e) => setNovoAno(Number(e.target.value))}
                  className="w-20 h-8 px-2 rounded-md bg-secondary border border-border/60 text-sm font-mono"
                  autoFocus
                />
              </div>
            ) : (
              <h2 className="text-lg font-semibold tracking-tight truncate">
                {NOMES_MES[item.mes - 1]} de {item.ano}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {editando ? (
              <>
                <button
                  onClick={handleSalvarAno}
                  disabled={isPending}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-primary hover:bg-primary/10 transition-colors"
                  title="Salvar"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelar}
                  disabled={isPending}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:bg-secondary transition-colors"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditando(true)}
                  disabled={isPending}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  title="Editar ano"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" /> Salário
            </span>
            <Valor amount={item.total_salarios} className="font-mono font-medium text-success" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingDown className="w-3.5 h-3.5" /> Pago
            </span>
            <Valor amount={item.total_pago} className="font-mono font-medium text-destructive" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Wallet className="w-4 h-4" /> Sobrou
          </span>
          <Valor
            amount={item.saldo}
            className={`text-xl font-bold font-mono ${item.saldo >= 0 ? "text-primary" : "text-destructive"}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}