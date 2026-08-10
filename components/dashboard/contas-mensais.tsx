"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Valor } from "@/components/ui/valor"
import { usePrivacy } from "@/lib/privacy-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Receipt,
  Loader2
} from "lucide-react"
import { 
  createContaMensal, 
  updateContaMensal, 
  deleteContaMensal,
  updateAllContasPago
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
    setContas(contas.map(c => c.id === id ? { ...c, [field]: value } : c))
    startTransition(async () => {
      await updateContaMensal(id, { [field]: value })
    })
  }

  const handleDeleteConta = (id: string) => {
    setContas(contas.filter(c => c.id !== id))
    startTransition(async () => {
      await deleteContaMensal(id)
    })
  }

  const allChecked = contas.length > 0 && contas.every(c => c.pago)

  const handleToggleAll = (checked: boolean) => {
    setContas(contas.map(c => ({ ...c, pago: checked })))
    startTransition(async () => {
      await updateAllContasPago(checked)
    })
  }

  const totalGeral = contas.reduce((acc, c) => acc + Number(c.valor), 0)
  const totalPago = contas.filter(c => c.pago).reduce((acc, c) => acc + Number(c.valor), 0)
  const totalFalta = totalGeral - totalPago

  return (
    <Card className="overflow-hidden border-border/40 shadow-lg shadow-black/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-5 hover:bg-secondary/30 transition-all duration-200 cursor-pointer select-none"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Receipt className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-semibold tracking-tight">Contas Mensais</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {contas.length} contas | Falta: <Valor amount={totalFalta} className="text-destructive font-medium" />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
        <CardContent className="p-5 pt-0 animate-in">
          <div className="overflow-x-auto rounded-xl border border-border/50 bg-secondary/20">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-14">
                    <Checkbox
                      checked={allChecked}
                      onCheckedChange={(checked) => handleToggleAll(checked as boolean)}
                      className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                      aria-label="Selecionar todas as contas"
                    />
                  </TableHead>
                  <TableHead>Nome da Conta</TableHead>
                  <TableHead className="w-36">Valor (R$)</TableHead>
                  <TableHead className="w-20 text-center">Dia</TableHead>
                  <TableHead>Chave PIX</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contas.map((conta) => (
                  <TableRow key={conta.id} className={`border-border/50 ${conta.pago ? "opacity-50 bg-success/5" : ""}`}>
                    <TableCell>
                      <Checkbox
                        checked={conta.pago}
                        onCheckedChange={(checked) => 
                          handleUpdateConta(conta.id, "pago", checked as boolean)
                        }
                        className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={conta.nome}
                        onChange={(e) => handleUpdateConta(conta.id, "nome", e.target.value)}
                        className={`bg-transparent border-0 px-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0 ${conta.pago ? "line-through text-muted-foreground" : ""}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={hideValues ? "••••••" : getValorDisplay(conta)}
                        onChange={(e) => !hideValues && handleValorChange(conta.id, e.target.value)}
                        onBlur={(e) => !hideValues && handleValorBlur(conta.id, e.target.value)}
                        placeholder="0,00"
                        readOnly={hideValues}
                        className="bg-transparent border-0 px-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono font-medium"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={conta.dia_pagamento}
                        onChange={(e) => handleUpdateConta(conta.id, "dia_pagamento", parseInt(e.target.value) || 1)}
                        className="bg-transparent border-0 px-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0 text-center w-14"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          value={conta.chave_pix}
                          onChange={(e) => handleUpdateConta(conta.id, "chave_pix", e.target.value)}
                          placeholder="Opcional"
                          className="bg-transparent border-0 px-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-mono"
                        />
                        {conta.chave_pix && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => handleCopyPix(conta.chave_pix, conta.id)}
                          >
                            {copiedId === conta.id ? (
                              <Check className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteConta(conta.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-5 rounded-2xl bg-secondary/50 border border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Total Geral</p>
              <Valor amount={totalGeral} className="block text-2xl font-bold font-mono mt-2" />
            </div>
            <div className="p-5 rounded-2xl bg-success/10 border border-success/20">
              <p className="text-xs text-success/80 uppercase tracking-widest font-medium">Ja Foi Pago</p>
              <Valor amount={totalPago} className="block text-2xl font-bold font-mono mt-2 text-success" />
            </div>
            <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive/80 uppercase tracking-widest font-medium">Falta Pagar</p>
              <Valor amount={totalFalta} className="block text-2xl font-bold font-mono mt-2 text-destructive" />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}