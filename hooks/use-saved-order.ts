"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

// Guarda a ordem escolhida (lista de ids) no navegador e aplica sobre os itens.
// Itens novos (sem posição salva) aparecem no final, na ordem original.
export function useSavedOrder<T extends { id: string }>(storageKey: string, items: T[]) {
  const [order, setOrder] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setOrder(parsed)
      }
    } catch {
      // sem acesso ao armazenamento: mantém a ordem original
    }
  }, [storageKey])

  const ordered = useMemo(() => {
    const pos = new Map(order.map((id, i) => [id, i]))
    return [...items].sort((a, b) => (pos.get(a.id) ?? 1e9) - (pos.get(b.id) ?? 1e9))
  }, [items, order])

  const saveOrder = useCallback(
    (ids: string[]) => {
      setOrder(ids)
      try {
        localStorage.setItem(storageKey, JSON.stringify(ids))
      } catch {
        // ignora erro de armazenamento
      }
    },
    [storageKey]
  )

  return { ordered, saveOrder }
}