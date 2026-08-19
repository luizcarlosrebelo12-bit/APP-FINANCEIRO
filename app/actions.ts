"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ==================== CONTAS MENSAIS ====================

export async function getContasMensais() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("contas_mensais")
    .select("*")
    .order("dia_pagamento", { ascending: true })
  
  if (error) throw error
  return data
}

export async function createContaMensal() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("contas_mensais")
    .insert({ nome: "Nova Conta", valor: 0, dia_pagamento: 1, chave_pix: "", pago: false })
    .select()
    .single()
  
  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateContaMensal(id: string, updates: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("contas_mensais")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/")
}

export async function deleteContaMensal(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("contas_mensais")
    .delete()
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/")
}

export async function updateAllContasPago(pago: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("contas_mensais")
    .update({ pago, updated_at: new Date().toISOString() })
    .neq("id", "00000000-0000-0000-0000-000000000000")
  
  if (error) throw error
  revalidatePath("/")
}

// ==================== PESSOAS E SALÁRIOS ====================

export async function getPessoas() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pessoas")
    .select(`
      *,
      entradas_salario (*)
    `)
    .order("ordem", { ascending: true })
  
  if (error) throw error
  return data
}

export async function createPessoa() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pessoas")
    .insert({ nome: "Nova Pessoa", ordem: 99 })
    .select()
    .single()
  
  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updatePessoa(id: string, updates: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("pessoas")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/")
}

export async function deletePessoa(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("pessoas")
    .delete()
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/")
}

export async function createEntradaSalario(pessoaId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("entradas_salario")
    .insert({ pessoa_id: pessoaId, valor: 0, dia: 1 })
    .select()
    .single()
  
  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateEntradaSalario(id: string, updates: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("entradas_salario")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/")
}

export async function deleteEntradaSalario(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("entradas_salario")
    .delete()
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/")
}

// ==================== DÍVIDAS E PARCELAS ====================

export async function getDividas() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("dividas")
    .select(`
      *,
      parcelas_carro (*)
    `)
    .order("ordem", { ascending: true })
  
  if (error) throw error
  return data
}

export async function createDivida(payload?: { nome: string }) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("dividas")
    .insert({ 
      nome: payload?.nome || "Nova Dívida", 
      ordem: 99 
    })
    .select()
    .single()
  
  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateDivida(id: string, updates: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("dividas")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/")
}

export async function deleteDivida(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("dividas")
    .delete()
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/")
}

export async function createParcelaCarro(payload: { divida_id: string, numero?: number, valor?: number, status?: string }) {
  const supabase = await createClient()
  
  let nextNumero = payload.numero;
  if (!nextNumero) {
    const { data: existingParcelas } = await supabase
      .from("parcelas_carro")
      .select("numero")
      .eq("divida_id", payload.divida_id)
      .order("numero", { ascending: false })
      .limit(1)
    
    nextNumero = existingParcelas && existingParcelas.length > 0 
      ? existingParcelas[0].numero + 1 
      : 1
  }

  const { data, error } = await supabase
    .from("parcelas_carro")
    .insert({ 
      divida_id: payload.divida_id,
      numero: nextNumero, 
      data_pagamento: new Date().toISOString().split("T")[0],
      valor: payload.valor || 0, 
      status: payload.status || "pendente" 
    })
    .select()
    .single()
  
  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateParcelaCarro(id: string, updates: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("parcelas_carro")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/")
}

export async function deleteParcelaCarro(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("parcelas_carro")
    .delete()
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/")
}

// ==================== HISTÓRICO MENSAL ====================

export async function getHistoricoMensal() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("historico_mensal")
    .select("*")
    .order("ano", { ascending: false })
    .order("mes", { ascending: false })

  if (error) throw error
  return data
}

export async function fecharMesAtual() {
  const supabase = await createClient()

  const [{ data: contas, error: errContas }, { data: pessoas, error: errPessoas }, { data: dividas, error: errDividas }] =
    await Promise.all([
      supabase.from("contas_mensais").select("*"),
      supabase.from("pessoas").select("*, entradas_salario (*)"),
      supabase.from("dividas").select("*, parcelas_carro (*)"),
    ])

  if (errContas) throw errContas
  if (errPessoas) throw errPessoas
  if (errDividas) throw errDividas

  const hoje = new Date()
  const mes = hoje.getMonth() + 1
  const ano = hoje.getFullYear()

  const totalSalarios = (pessoas || []).reduce(
    (acc, p) => acc + (p.entradas_salario || []).reduce((a: number, e: any) => a + Number(e.valor), 0),
    0
  )

  const totalContasGeral = (contas || []).reduce((acc, c) => acc + Number(c.valor), 0)
  const totalContasPago = (contas || [])
    .filter((c) => c.pago)
    .reduce((acc, c) => acc + Number(c.valor), 0)

  // total_parcelas_pago continua sendo calculado e salvo, só para registro histórico
  // da dívida do carro — mas NÃO entra mais no saldo do mês.
  const todasParcelas = (dividas || []).flatMap((d) => d.parcelas_carro || [])
  const totalParcelasPago = todasParcelas
    .filter((p: any) => {
      if (p.status !== "ok" || !p.data_pagamento) return false
      const data = new Date(p.data_pagamento)
      return data.getMonth() + 1 === mes && data.getFullYear() === ano
    })
    .reduce((acc: number, p: any) => acc + Number(p.valor), 0)

  // Apenas as contas mensais entram no saldo do mês.
  // A dívida do carro é só controle à parte, não afeta o saldo.
  const totalPago = totalContasPago
  const saldo = totalSalarios - totalPago

  const { data, error } = await supabase
    .from("historico_mensal")
    .insert({
      mes,
      ano,
      total_salarios: totalSalarios,
      total_contas: totalContasGeral,
      total_contas_pago: totalContasPago,
      total_parcelas_pago: totalParcelasPago,
      total_pago: totalPago,
      saldo,
    })
    .select()
    .single()

  if (error) throw error

  await updateAllContasPago(false)

  revalidatePath("/")
  revalidatePath("/historico")
  return data
}
export async function deleteHistoricoMensal(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("historico_mensal")
    .delete()
    .eq("id", id)

  if (error) throw error
  revalidatePath("/historico")
}

export async function updateHistoricoMensal(id: string, updates: { mes?: number; ano?: number }) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("historico_mensal")
    .update(updates)
    .eq("id", id)

  if (error) throw error
  revalidatePath("/historico")
}