// Pede DUAS confirmações antes de excluir. Retorna true só se confirmar nas duas.
export function confirmDelete(mensagem: string): boolean {
  if (!window.confirm(mensagem)) return false
  return window.confirm("⚠️ ÚLTIMA CONFIRMAÇÃO\n\nTem certeza mesmo? Essa ação não pode ser desfeita.")
}