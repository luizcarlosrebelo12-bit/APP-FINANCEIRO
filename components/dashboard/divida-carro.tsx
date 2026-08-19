"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Landmark, CheckCircle2, Clock } from "lucide-react";
import { Valor } from "@/components/ui/valor";

// ATENÇÃO: Adicione a action 'createParcelaCarro' no seu arquivo de actions!
import { updateParcelaCarro, deleteParcelaCarro, deleteDivida, createDivida, createParcelaCarro } from "@/app/actions";

interface Parcela { id: string; divida_id: string; numero: number; valor: number; data_pagamento: string | null; status: "pendente" | "ok"; }
interface Divida { id: string; nome: string; parcelas_carro: Parcela[]; }

function DividaCard({ divida, setDividas }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [, startTransition] = useTransition();

  const parcelas = [...(divida.parcelas_carro || [])].sort((a, b) => a.numero - b.numero);

  // Cálculos de Resumo
  const totalDivida = parcelas.reduce((acc, p) => acc + Number(p.valor || 0), 0);
  const totalPago = parcelas.filter((p) => p.status === "ok").reduce((acc, p) => acc + Number(p.valor || 0), 0);
  const faltaPagar = totalDivida - totalPago;
  const parcelasPagas = parcelas.filter(p => p.status === "ok").length;

  // 1. Atualizar parcela existente
  const handleUpdateParcela = (parcelaId: string, field: string, value: any) => {
    setDividas((prev: any) => prev.map((d: any) => d.id === divida.id ? {
      ...d,
      parcelas_carro: d.parcelas_carro.map((p: any) => p.id === parcelaId ? { ...p, [field]: value } : p)
    } : d));
    startTransition(async () => { await updateParcelaCarro(parcelaId, { [field]: value }); });
  };

  // 2. Excluir a dívida PAI inteira
  const handleDeleteDivida = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir a dívida "${divida.nome}" inteira?`)) {
      setDividas((prev: any) => prev.filter((d: any) => d.id !== divida.id));
      startTransition(async () => { await deleteDivida(divida.id); });
    }
  };

  // 3. Excluir uma Parcela individual
  const handleDeleteParcela = (parcelaId: string, numeroParcela: number) => {
    if (window.confirm(`Excluir a parcela #${numeroParcela}?`)) {
      setDividas((prev: any) => prev.map((d: any) => d.id === divida.id ? {
        ...d,
        parcelas_carro: d.parcelas_carro.filter((p: any) => p.id !== parcelaId)
      } : d));

      startTransition(async () => { await deleteParcelaCarro(parcelaId); });
    }
  };

  // 4. Adicionar uma nova Parcela à esta dívida
  const handleAddParcela = () => {
    const inputValor = window.prompt("Qual o VALOR desta nova parcela? (Exemplo: 350,90)");
    if (!inputValor || inputValor.trim() === "") return;

    const valorNumerico = parseFloat(inputValor.replace(",", "."));

    if (isNaN(valorNumerico)) {
      alert("Valor inválido! Digite apenas números.");
      return;
    }

    const proximoNumero = parcelas.length > 0
      ? Math.max(...parcelas.map(p => p.numero)) + 1
      : 1;

    const idProvisorio = crypto.randomUUID();

    const novaParcelaObj: Parcela = {
      id: idProvisorio,
      divida_id: divida.id,
      numero: proximoNumero,
      valor: valorNumerico,
      data_pagamento: null,
      status: "pendente"
    };

    setDividas((prev: any) => prev.map((d: any) => d.id === divida.id ? {
      ...d,
      parcelas_carro: [...d.parcelas_carro, novaParcelaObj]
    } : d));

    startTransition(async () => {
      await createParcelaCarro({
        divida_id: divida.id,
        numero: proximoNumero,
        valor: valorNumerico,
        status: "pendente"
      });
    });
  };

  return (
    <Card className="overflow-hidden border-border/40 shadow-lg shadow-black/5">
      <div className="p-4 sm:p-5 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between mb-3 w-full gap-2">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center">
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight truncate">
                {divida.nome} <span className="text-sm font-normal text-muted-foreground">({parcelasPagas}/{parcelas.length})</span>
              </h2>
              <p className="text-xs sm:text-sm text-success font-medium mt-0.5">Pago: <Valor amount={totalPago} /></p>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10 z-10" onClick={handleDeleteDivida} title="Excluir Dívida Pai">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
          <div className="p-2 bg-secondary/60 rounded-lg text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
            <Valor amount={totalDivida} className="font-mono font-medium" />
          </div>
          <div className="p-2 bg-success/10 text-success rounded-lg text-center">
            <p className="text-[10px] uppercase tracking-wide opacity-80">Pago</p>
            <Valor amount={totalPago} className="font-mono font-medium" />
          </div>
          <div className="p-2 bg-destructive/10 text-destructive rounded-lg text-center">
            <p className="text-[10px] uppercase tracking-wide opacity-80">Falta</p>
            <Valor amount={faltaPagar} className="font-mono font-medium" />
          </div>
        </div>
      </div>

      {isOpen && (
        <CardContent className="p-4 sm:p-5 pt-0 animate-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {parcelas.map((p: Parcela) => (
              <div
                key={p.id}
                className={`flex flex-col gap-2 rounded-2xl border border-border/50 bg-secondary/30 p-3 transition-all hover:border-border/80 ${p.status === "ok" ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                    {p.numero}
                  </span>
                  <Select value={p.status} onValueChange={(val) => handleUpdateParcela(p.id, "status", val)}>
                    <SelectTrigger
                      className={`h-7 w-auto gap-1 rounded-full border-0 px-2.5 text-[11px] font-medium ${
                        p.status === "ok" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">
                        <Clock className="w-3.5 h-3.5 mr-1.5 inline" /> Pendente
                      </SelectItem>
                      <SelectItem value="ok">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline" /> Pago
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Valor amount={p.valor} className="font-mono text-lg font-semibold" />

                <div className="flex items-center justify-between gap-1 border-t border-border/50 pt-2">
                  <Input
                    type="date"
                    value={p.data_pagamento || ""}
                    onChange={(e) => handleUpdateParcela(p.id, "data_pagamento", e.target.value)}
                    className="h-7 min-w-0 flex-1 border-0 bg-transparent px-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteParcela(p.id, p.numero)}
                    title="Excluir parcela"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full border-dashed border-2 h-11 text-muted-foreground hover:text-foreground hover:border-accent/50 hover:bg-accent/5"
            onClick={handleAddParcela}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar nova parcela
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export function DividaCarro({ initialData }: { initialData: Divida[] }) {
  const [dividas, setDividas] = useState<Divida[]>(initialData || []);
  const [, startTransition] = useTransition();

  const handleNovaDivida = () => {
    const nomeNovaDivida = window.prompt("Qual o nome da nova dívida?");
    if (!nomeNovaDivida || nomeNovaDivida.trim() === "") return;

    const tempId = crypto.randomUUID();
    const novaDividaObj: Divida = { id: tempId, nome: nomeNovaDivida, parcelas_carro: [] };

    setDividas(prev => [...prev, novaDividaObj]);

    startTransition(async () => {
      await createDivida({ nome: nomeNovaDivida });
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {dividas.map((d) => <DividaCard key={d.id} divida={d} setDividas={setDividas} />)}
      <Button className="w-full h-11" onClick={handleNovaDivida}><Plus className="mr-2 w-4 h-4"/> Nova Dívida</Button>
    </div>
  );
}