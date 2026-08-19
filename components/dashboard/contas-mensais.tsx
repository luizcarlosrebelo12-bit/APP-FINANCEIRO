"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Valor } from "@/components/ui/valor"
import { usePrivacy } from "@/lib/privacy-context"
import {
  Copy,
  Check,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Receipt,
  Loader2,
  CalendarDays,
} from "lucide-react"
import {
  createContaMensal,
  updateContaMensal,
  deleteContaMensal,
  updateAllContasPago,
} from "@/app/actions"

interface Conta {
  id: string
  nome: string
  valor: number
  dia_pagamento: number
  chave_pix: string
  pago: boolean
}

interface ContasMensaisProps {
  initialData: Conta[]
}

type StatusKey = "pago" | "atrasado" | "pendente"

const STATUS_CONFIG: Record<StatusKey, { label: string; className: string }> = {
  pago: { label: "Pago", className: "bg-success/15 text-success" },
  atrasado: { label: "Atrasado", className: "bg-destructive/15 text-destructive" },
  pendente: { label: "Pendente", className: "bg-warning/15 text-warning" },
}

export function ContasMensais({ initialData }: ContasMensaisProps) {
  const [contas, setContas] = useState<Conta[]>(initialData)
  const [isOpen, setIsOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { hideValues } = usePrivacy()

  const [valorInputs, setValorInputs] = useState<Record<string, string>>({})

  const getValorDisplay = (conta: Conta) => {
    if (valorInputs[conta.id] !== undefined) return valorInputs[conta.id]
    return Number(conta.valor) ? String(conta.valor).replace(".", ",") : ""
  }

  const handleValorChange = (id: string, raw: string) => {
    setValorInputs((prev) => ({ ...prev, [id]: raw }))
  }

  const handleValorBlur = (id: string, raw: string) => {
    const numValue = parseFloat(raw.replace(",", ".")) || 0
    handleUpdateConta(id, "valor", numValue)
    setValorInputs((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  const handleCopyPix = async (pix: string, id: string) => {
    await navigator.clipboard.writeText(pix)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAddConta = () => {
    startTransition(async () => {
      const newConta = await createContaMensal()
      setContas([...contas, newConta])
    })
  }

  const handleUpdateConta = (id: string, field: keyof Conta, value: string | number | boolean) => {
    setContas(contas.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
    startTransition(async () => {
      await updateContaMensal(id, { [field]: value })
    })
  }

  const handleDeleteConta = (id: string) => {
    setContas(contas.filter((c) => c.id !== id))
    startTransition(async () => {
      await deleteContaMensal(id)
    })
  }

  const allChecked = contas.length > 0 && contas.every((c) => c.pago)

  const handleToggleAll = (checked: boolean) => {
    setContas(contas.map((c) => ({ ...c, pago: checked })))
    startTransition(async () => {
      await updateAllContasPago(checked)
    })
  }

  const getStatus = (conta: Conta): StatusKey => {
    if (conta.pago) return "pago"
    const hoje = new Date().getDate()
    return conta.dia_pagamento < hoje ? "atrasado" : "pendente"
  }

  const totalGeral = contas.reduce((acc, c) => acc + Number(c.valor), 0)
  const totalPago = contas.filter((c) => c.pago).reduce((acc, c) => acc + Number(c.valor), 0)
  const totalFalta = totalGeral - totalPago

  return (
    <Card className="overflow-hidden border-border/40 shadow-lg shadow-black/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 sm:p-5 hover:bg-secondary/30 transition-all duration-200 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="text-left min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Contas Mensais</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
              {contas.length} contas | Falta: <Valor amount={totalFalta} className="text-destructive font-medium" />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isPending && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
            {isOpen ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isOpen && (
        <CardContent className="p-4 sm:p-5 pt-0 animate-in">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Checkbox
              checked={allChecked}
              onCheckedChange={(checked) => handleToggleAll(checked as boolean)}
              className="data-[state=checked]:bg-success data-[state=checked]:border-success"
              aria-label="Selecionar todas as contas"
            />
            <span className="text-xs text-muted-foreground">Marcar todas como pagas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {contas.map((conta) => {
              const status = getStatus(conta)
              const statusConfig = STATUS_CONFIG[status]

              return (
                <div
                  key={conta.id}
                  className={`group relative flex flex-col gap-3 rounded-2xl border border-border/50 bg-secondary/30 p-4 transition-all hover:border-border/80 ${
                    conta.pago ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Checkbox
                        checked={conta.pago}
                        onCheckedChange={(checked) => handleUpdateConta(conta.id, "pago", checked as boolean)}
                        className="shrink-0 data-[state=checked]:bg-success data-[state=checked]:border-success"
                      />
                      <Input
                        value={conta.nome}
                        onChange={(e) => handleUpdateConta(conta.id, "nome", e.target.value)}
                        className={`h-8 min-w-0 border-0 bg-transparent px-0 font-medium focus-visible:ring-0 focus-visible:ring-offset-0 ${
                          conta.pago ? "line-through text-muted-foreground" : ""
                        }`}
                      />
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <Input
                    type="text"
                    inputMode="decimal"
                    value={hideValues ? "••••••" : getValorDisplay(conta)}
                    onChange={(e) => !hideValues && handleValorChange(conta.id, e.target.value)}
                    onBlur={(e) => !hideValues && handleValorBlur(conta.id, e.target.value)}
                    placeholder="0,00"
                    readOnly={hideValues}
                    className="h-9 border-0 bg-transparent px-0 font-mono text-xl font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
                  />

                  <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>Dia</span>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={conta.dia_pagamento}
                        onChange={(e) =>
                          handleUpdateConta(conta.id, "dia_pagamento", parseInt(e.target.value) || 1)
                        }
                        className="h-7 w-10 border-0 bg-transparent px-0 text-center text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>

                    <div className="flex items-center gap-1 min-w-0 flex-1 justify-end">
                      <Input
                        value={conta.chave_pix}
                        onChange={(e) => handleUpdateConta(conta.id, "chave_pix", e.target.value)}
                        placeholder="PIX"
                        className="h-7 min-w-0 border-0 bg-transparent px-0 text-right text-xs font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      {conta.chave_pix && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => handleCopyPix(conta.chave_pix, conta.id)}
                        >
                          {copiedId === conta.id ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteConta(conta.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full border-dashed border-2 h-11 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5"
            onClick={handleAddConta}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Conta
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-secondary/50 border border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Total Geral</p>
              <Valor amount={totalGeral} className="block text-xl sm:text-2xl font-bold font-mono mt-2" />
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-success/10 border border-success/20">
              <p className="text-xs text-success/80 uppercase tracking-widest font-medium">Ja Foi Pago</p>
              <Valor amount={totalPago} className="block text-xl sm:text-2xl font-bold font-mono mt-2 text-success" />
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive/80 uppercase tracking-widest font-medium">Falta Pagar</p>
              <Valor
                amount={totalFalta}
                className="block text-xl sm:text-2xl font-bold font-mono mt-2 text-destructive"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}