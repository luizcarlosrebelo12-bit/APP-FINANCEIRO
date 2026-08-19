"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Valor } from "@/components/ui/valor"
import { usePrivacy } from "@/lib/privacy-context"
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Wallet,
  Loader2,
  UserCircle,
  CalendarDays,
} from "lucide-react"
import {
  createPessoa,
  updatePessoa,
  deletePessoa,
  createEntradaSalario,
  updateEntradaSalario,
  deleteEntradaSalario,
} from "@/app/actions"

interface EntradaSalario {
  id: string
  pessoa_id: string
  valor: number
  dia: number
}

interface Pessoa {
  id: string
  nome: string
  entradas_salario: EntradaSalario[]
}

interface SalariosProps {
  initialData: Pessoa[]
}

export function Salarios({ initialData }: SalariosProps) {
  const [pessoas, setPessoas] = useState<Pessoa[]>(initialData)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { hideValues } = usePrivacy()

  const [valorInputs, setValorInputs] = useState<Record<string, string>>({})

  const getValorDisplay = (entrada: EntradaSalario) => {
    if (valorInputs[entrada.id] !== undefined) return valorInputs[entrada.id]
    return Number(entrada.valor) ? String(entrada.valor).replace(".", ",") : ""
  }

  const handleValorChange = (id: string, raw: string) => {
    setValorInputs((prev) => ({ ...prev, [id]: raw }))
  }

  const handleValorBlur = (pessoaId: string, entradaId: string, raw: string) => {
    const numValue = parseFloat(raw.replace(",", ".")) || 0
    handleUpdateEntrada(pessoaId, entradaId, "valor", numValue)
    setValorInputs((prev) => {
      const updated = { ...prev }
      delete updated[entradaId]
      return updated
    })
  }

  const handleAddPessoa = () => {
    startTransition(async () => {
      const newPessoa = await createPessoa()
      setPessoas([...pessoas, { ...newPessoa, entradas_salario: [] }])
    })
  }

  const handleUpdatePessoa = (id: string, nome: string) => {
    setPessoas(pessoas.map((p) => (p.id === id ? { ...p, nome } : p)))
    startTransition(async () => {
      await updatePessoa(id, { nome })
    })
  }

  const handleDeletePessoa = (id: string) => {
    setPessoas(pessoas.filter((p) => p.id !== id))
    startTransition(async () => {
      await deletePessoa(id)
    })
  }

  const handleAddEntrada = (pessoaId: string) => {
    startTransition(async () => {
      const newEntrada = await createEntradaSalario(pessoaId)
      setPessoas(
        pessoas.map((p) =>
          p.id === pessoaId ? { ...p, entradas_salario: [...p.entradas_salario, newEntrada] } : p
        )
      )
    })
  }

  const handleUpdateEntrada = (pessoaId: string, entradaId: string, field: "valor" | "dia", value: number) => {
    setPessoas(
      pessoas.map((p) =>
        p.id === pessoaId
          ? {
              ...p,
              entradas_salario: p.entradas_salario.map((e) =>
                e.id === entradaId ? { ...e, [field]: value } : e
              ),
            }
          : p
      )
    )
    startTransition(async () => {
      await updateEntradaSalario(entradaId, { [field]: value })
    })
  }

  const handleDeleteEntrada = (pessoaId: string, entradaId: string) => {
    setPessoas(
      pessoas.map((p) =>
        p.id === pessoaId
          ? { ...p, entradas_salario: p.entradas_salario.filter((e) => e.id !== entradaId) }
          : p
      )
    )
    startTransition(async () => {
      await deleteEntradaSalario(entradaId)
    })
  }

  const calcularTotalPessoa = (entradas: EntradaSalario[]) => entradas.reduce((acc, e) => acc + Number(e.valor), 0)

  const totalMensal = pessoas.reduce((acc, p) => acc + calcularTotalPessoa(p.entradas_salario), 0)

  return (
    <Card className="overflow-hidden border-border/40 shadow-lg shadow-black/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 sm:p-5 hover:bg-secondary/30 transition-all duration-200 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
          </div>
          <div className="text-left min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Salarios</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
              Total: <Valor amount={totalMensal} className="text-success font-medium" />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isPending && <Loader2 className="w-5 h-5 animate-spin text-success" />}
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pessoas.map((pessoa) => (
              <div key={pessoa.id} className="p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-accent/10 border border-accent/20">
                    <UserCircle className="w-5 h-5 text-accent" />
                  </div>
                  <Input
                    value={pessoa.nome}
                    onChange={(e) => handleUpdatePessoa(pessoa.id, e.target.value)}
                    className="bg-transparent border-0 px-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-semibold flex-1 min-w-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeletePessoa(pessoa.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {pessoa.entradas_salario.map((entrada) => (
                    <div
                      key={entrada.id}
                      className="flex items-center gap-2 p-3 rounded-xl bg-background/60 border border-border/30"
                    >
                      <span className="text-xs text-muted-foreground font-medium shrink-0">R$</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={hideValues ? "••••••" : getValorDisplay(entrada)}
                        onChange={(e) => !hideValues && handleValorChange(entrada.id, e.target.value)}
                        onBlur={(e) => !hideValues && handleValorBlur(pessoa.id, entrada.id, e.target.value)}
                        placeholder="0,00"
                        readOnly={hideValues}
                        className="bg-transparent border-0 px-0 h-8 min-w-0 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono font-medium"
                      />
                      <div className="flex items-center gap-1 shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          value={entrada.dia}
                          onChange={(e) =>
                            handleUpdateEntrada(pessoa.id, entrada.id, "dia", parseInt(e.target.value) || 1)
                          }
                          className="bg-transparent border-0 px-0 h-4 focus-visible:ring-0 focus-visible:ring-offset-0 w-6 text-center text-[11px]"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteEntrada(pessoa.id, entrada.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => handleAddEntrada(pessoa.id)}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Adicionar Entrada
                </Button>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                    <Valor
                      amount={calcularTotalPessoa(pessoa.entradas_salario)}
                      className="text-xl font-bold font-mono text-success"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full border-dashed border-2 h-11 text-muted-foreground hover:text-foreground hover:border-success/50 hover:bg-success/5"
            onClick={handleAddPessoa}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Pessoa
          </Button>

          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-success/10 border border-success/20">
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-success/20">
                  <Wallet className="w-5 h-5 text-success" />
                </div>
                <span className="font-semibold">Total Mensal</span>
              </div>
              <Valor amount={totalMensal} className="text-2xl sm:text-3xl font-bold font-mono text-success shrink-0" />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}