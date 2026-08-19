"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { CalendarCheck, Loader2 } from "lucide-react"
import { fecharMesAtual } from "@/app/actions"
import { useRouter } from "next/navigation"

export function FecharMesButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleFechar = () => {
    const confirmado = window.confirm(
      "Isso vai arquivar o mês atual no histórico e desmarcar todas as contas mensais para o próximo mês. Confirmar?"
    )
    if (!confirmado) return

    startTransition(async () => {
      await fecharMesAtual()
      router.push("/historico")
    })
  }

  return (
    <Button onClick={handleFechar} disabled={isPending} variant="outline" className="w-full sm:w-auto h-11 gap-2">
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
      Fechar mês
    </Button>
  )
}