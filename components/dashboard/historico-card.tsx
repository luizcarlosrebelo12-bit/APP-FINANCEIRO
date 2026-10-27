"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Valor } from "@/components/ui/valor"
import { deleteHistoricoMensal, updateHistoricoMensal } from "@/app/actions"
import { CalendarDays, Trash2, Pencil, Check, X } from "lucide-react"

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

  const salario = Number(item.total_salarios) || 0
  const saldo = Number(item.saldo) || 0
  const taxa = salario > 0 ? (saldo / salario) * 100 : 0
  const positivo = saldo >= 0
  const larguraBarra = Math.max(0, Math.min(100, taxa))
  const taxaTexto = `${taxa.toFixed(1).replace(".", ",")}%`

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
    <Card className="overflow-hidden border-border/40 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        {/* Linha 1: mês, % poupado e ações */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>

            {editando ? (
              <div className="flex items-center gap-1.5">
                <span className="whitespace-nowrap text-sm font-semibold">
                  {NOMES_MES[item.mes - 1]} de
                </span>
                <input
                  type="number"
                  value={novoAno}
                  onChange={(e) => setNovoAno(Number(e.target.value))}
                  className="h-7 w-20 rounded-md border border-border/60 bg-secondary px-2 font-mono text-sm"
                  autoFocus
                />
              </div>
            ) : (
              <h2 className="truncate text-sm font-semibold tracking-tight sm:text-base">
                {NOMES_MES[item.mes - 1]} de {item.ano}
              </h2>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {!editando && (
              <span
                className={`mr-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${
                  positivo ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                }`}
                title="Taxa de poupança"
              >
                {taxaTexto}
              </span>
            )}

            {editando ? (
              <>
                <button
                  onClick={handleSalvarAno}
                  disabled={isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
                  title="Salvar"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelar}
                  disabled={isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
                  title="Cancelar"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditando(true)}
                  disabled={isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="Editar ano"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Excluir"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Linha 2: três valores lado a lado */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Salário</p>
            <Valor
              amount={item.total_salarios}
              className="block truncate font-mono text-xs font-medium text-success sm:text-sm"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Pago</p>
            <Valor
              amount={item.total_pago}
              className="block truncate font-mono text-xs font-medium text-destructive sm:text-sm"
            />
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Saldo Poupado</p>
            <Valor
              amount={item.saldo}
              className={`block truncate font-mono text-xs font-bold sm:text-sm ${
                positivo ? "text-primary" : "text-destructive"
              }`}
            />
          </div>
        </div>

        {/* Barra fina: quanto do salário foi poupado */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all ${positivo ? "bg-primary" : "bg-destructive"}`}
            style={{ width: `${larguraBarra}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}