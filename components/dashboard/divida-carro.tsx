"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Landmark, CheckCircle2, Clock } from "lucide-react";

// ATENÇÃO: Adicione a action 'createParcelaCarro' no seu arquivo de actions!
import { updateParcelaCarro, deleteParcelaCarro, deleteDivida, createDivida, createParcelaCarro } from "@/app/actions";

interface Parcela { id: string; divida_id: string; numero: number; valor: number; data_pagamento: string | null; status: "pendente" | "ok"; }
interface Divida { id: string; nome: string; parcelas_carro: Parcela[]; }

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

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

  // 3. NOVA FUNÇÃO: Excluir uma Parcela individual
  const handleDeleteParcela = (parcelaId: string, numeroParcela: number) => {
    if (window.confirm(`Excluir a parcela #${numeroParcela}?`)) {
      setDividas((prev: any) => prev.map((d: any) => d.id === divida.id ? {
        ...d,
        parcelas_carro: d.parcelas_carro.filter((p: any) => p.id !== parcelaId)
      } : d));

      startTransition(async () => { await deleteParcelaCarro(parcelaId); });
    }
  };

  // 4. NOVA FUNÇÃO: Adicionar uma nova Parcela à esta dívida
  const handleAddParcela = () => {
    const inputValor = window.prompt("Qual o VALOR desta nova parcela? (Exemplo: 350,90)");
    if (!inputValor || inputValor.trim() === "") return;

    // Converte a string digitada em número decimal (aceitando vírgula ou ponto)
    const valorNumerico = parseFloat(inputValor.replace(",", "."));
    
    if (isNaN(valorNumerico)) {
      alert("Valor inválido! Digite apenas números.");
      return;
    }

    // Calcula automaticamente o próximo número da sequência (1, 2, 3 -> vira 4)
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
      status: "pendente" // Nasce pendente por padrão
    };

    // Joga na tela instantaneamente
    setDividas((prev: any) => prev.map((d: any) => d.id === divida.id ? {
      ...d,
      parcelas_carro: [...d.parcelas_carro, novaParcelaObj]
    } : d));

    // Dispara pro banco de dados
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
    <Card className="overflow-hidden border-border/40 shadow-lg">
      <div className="p-5 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between mb-3 w-full">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Landmark className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {divida.nome} <span className="text-sm font-normal text-muted-foreground">({parcelasPagas}/{parcelas.length})</span>
              </h2>
              <p className="text-sm text-green-600 font-medium">Pago: {formatCurrency(totalPago)}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive z-10" onClick={handleDeleteDivida} title="Excluir Dívida Pai">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
          <div className="p-2 bg-secondary rounded-md">Total: {formatCurrency(totalDivida)}</div>
          <div className="p-2 bg-green-900/10 text-green-600 rounded-md">Pago: {formatCurrency(totalPago)}</div>
          <div className="p-2 bg-destructive/10 text-destructive rounded-md">Falta: {formatCurrency(faltaPagar)}</div>
        </div>
      </div>

      {isOpen && (
        <CardContent className="p-5 pt-0">
          <div className="rounded-xl border bg-secondary/20">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data Pagto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead> {/* Coluna da lixeira da parcela */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcelas.map((p: Parcela) => (
                  <TableRow key={p.id} className={p.status === "ok" ? "bg-green-900/10 text-green-600" : ""}>
                    <TableCell className="font-bold">{p.numero}</TableCell>
                    <TableCell>{formatCurrency(p.valor)}</TableCell>
                    <TableCell>
                      <Input type="date" className="w-36 h-8" value={p.data_pagamento || ""} onChange={(e) => handleUpdateParcela(p.id, "data_pagamento", e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Select value={p.status} onValueChange={(val) => handleUpdateParcela(p.id, "status", val)}>
                        <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente"><Clock className="w-4 h-4 mr-2 inline" /> Pendente</SelectItem>
                          <SelectItem value="ok"><CheckCircle2 className="w-4 h-4 mr-2 inline" /> Pago</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    {/* BOTÃO EXCLUIR PARCELA */}
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteParcela(p.id, p.numero)}
                        title="Excluir parcela"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* BOTÃO ADICIONAR PARCELA (RODAPÉ DA TABELA) */}
            <div className="p-2 border-t bg-secondary/10">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-dashed hover:border-solid flex items-center gap-2 text-muted-foreground hover:text-foreground"
                onClick={handleAddParcela}
              >
                <Plus className="w-4 h-4" /> Adicionar nova parcela
              </Button>
            </div>

          </div>
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
    <div className="space-y-5">
      {dividas.map((d) => <DividaCard key={d.id} divida={d} setDividas={setDividas} />)}
      <Button className="w-full" onClick={handleNovaDivida}><Plus className="mr-2 w-4 h-4"/> Nova Dívida</Button>
    </div>
  );
}