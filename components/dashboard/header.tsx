"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import Image from "next/image"

interface HeaderProps {
  totalReceitas: number
  totalDespesas: number
}

export function Header({ totalReceitas, totalDespesas }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value)
  }

  const saldo = totalReceitas - totalDespesas

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          
          {/* LOGO COMPLETA - PREENCHENDO TODO O ESPAÇO */}
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl shadow-lg shadow-primary/25">
            <Image 
              src="/icon.png" 
              alt="Logo Finanças Pessoais" 
              fill
              sizes="44px"
              className="object-cover" 
              priority
            />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight">Financas Pessoais</h1>
            <p className="text-xs text-muted-foreground">Sincronizado na nuvem</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium">Receitas</p>
              <p className="font-mono font-bold text-success">{formatCurrency(totalReceitas)}</p>
            </div>
            <div className="h-10 w-px bg-border/50" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium">Despesas</p>
              <p className="font-mono font-bold text-destructive">{formatCurrency(totalDespesas)}</p>
            </div>
            <div className="h-10 w-px bg-border/50" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium">Saldo</p>
              <p className={`font-mono font-bold text-lg ${saldo >= 0 ? "text-primary" : "text-destructive"}`}>
                {formatCurrency(saldo)}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isPending}
            className="h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            <span className="sr-only">Atualizar dados</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-10 w-10"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>
        </div>
      </div>
    </header>
  )
}