"use client"

import { usePrivacy } from "@/lib/privacy-context"

interface ValorProps {
  amount: number
  className?: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function Valor({ amount, className }: ValorProps) {
  const { hideValues } = usePrivacy()

  return (
    <span className={className}>
      {hideValues ? "R$ ••••••" : formatCurrency(amount)}
    </span>
  )
}