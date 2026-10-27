"use client"

import type { ReactNode } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

interface SortableListProps {
  ids: string[]
  onReorder: (newIds: string[]) => void
  /** "grid" para cards em grade, "list" para lista vertical */
  strategy?: "grid" | "list"
  children: ReactNode
}

// Não cria nenhum elemento HTML: só envolve os itens com a lógica de arrastar.
export function SortableList({ ids, onReorder, strategy = "grid", children }: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    onReorder(arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={ids}
        strategy={strategy === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  )
}

interface SortableItemProps {
  id: string
  className?: string
  /** Recebe o "puxador" (ícone de arrastar) para você colocar onde quiser no card */
  children: (handle: ReactNode) => ReactNode
}

export function SortableItem({ id, className, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  }

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}
      className="flex h-6 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-secondary hover:text-foreground active:cursor-grabbing"
      title="Segure e arraste para reordenar"
      aria-label="Arrastar para reordenar"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  )

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children(handle)}
    </div>
  )
}