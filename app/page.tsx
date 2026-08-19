import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { ResumoMobile } from "@/components/dashboard/resumo-mobile"
import { ContasMensais } from "@/components/dashboard/contas-mensais"
import { Salarios } from "@/components/dashboard/salarios"
import { DividaCarro } from "@/components/dashboard/divida-carro"
import { FecharMesButton } from "@/components/dashboard/fechar-mes-button"
import { History } from "lucide-react"

// Função para buscar dados do Supabase
async function getFinanceData() {
  const supabase = await createClient()
  
  const [contasResult, pessoasResult, dividasResult] = await Promise.all([
    supabase.from("contas_mensais").select("*").order("dia_pagamento", { ascending: true }),
    supabase.from("pessoas").select(`*, entradas_salario (*)`).order("ordem", { ascending: true }),
    supabase.from("dividas").select(`*, parcelas_carro (*)`).order("ordem", { ascending: true })
  ])

  return {
    contas: contasResult.data || [],
    pessoas: pessoasResult.data || [],
    dividas: dividasResult.data || []
  }
}

export default async function FinanceDashboard() {
  // Chamada dos dados e desestruturação correta
  const { contas, pessoas, dividas } = await getFinanceData()

  // Cálculos de resumo
  const totalReceitas = pessoas.reduce((acc, pessoa) => {
    const pessoaTotal = pessoa.entradas_salario?.reduce((sum: number, e: { valor: number }) => sum + Number(e.valor), 0) || 0
    return acc + pessoaTotal
  }, 0)

  const totalDespesas = contas.reduce((acc, c) => acc + Number(c.valor), 0)

  return (
    <div className="min-h-screen bg-background">
      <Header totalReceitas={totalReceitas} totalDespesas={totalDespesas} />
      
      <main className="container mx-auto px-4 py-6 space-y-5">
        <ResumoMobile totalReceitas={totalReceitas} totalDespesas={totalDespesas} />
        
        {/* Componentes de gestão */}
        <ContasMensais initialData={contas} />
        <Salarios initialData={pessoas} />
        
        {/* IMPORTANTE: 
            Passamos 'dividas' como initialData.
            O componente DividaCarro (que você já tem corrigido) 
            agora usará essa lista para mapear e permitir exclusão/adição.
        */}
        <DividaCarro initialData={dividas || []} />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
          <FecharMesButton />
          <Link
            href="/historico"
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-md border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
          >
            <History className="w-4 h-4" />
            Ver histórico
          </Link>
        </div>

        <footer className="text-center py-8">
          <p className="text-xs text-muted-foreground">
            Dados sincronizados na nuvem via Supabase
          </p>
        </footer>
      </main>
    </div>
  )
}