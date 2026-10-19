import { useState } from 'react'
import { useSchedule } from './useSchedule.js'
import { MIN_DURATION, getResizeBounds, toTimeLabel } from './scheduleUtils.js'
import WeekGrid from './WeekGrid.jsx'
import BlockDrawer from './BlockDrawer.jsx'
import CategoryFilters from './CategoryFilters.jsx'
import CategoryManager from './CategoryManager.jsx'
import RangeSettings from './RangeSettings.jsx'
import HoursSummary from './HoursSummary.jsx'
import './schedule.css'

const DEFAULT_DURATION = 60

export default function SchedulePage() {
  const {
    blocks,
    categories,
    settings,
    addBlock,
    updateBlock,
    deleteBlock,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
  } = useSchedule()

  // null = cerrado · { block } = editar · { block: null, draft } = crear
  const [drawer, setDrawer] = useState(null)
  const [isManagingCategories, setIsManagingCategories] = useState(false)
  const [isEditingRange, setIsEditingRange] = useState(false)
  // Categorías visibles en la grilla (Set vacío = todas). Es estado de la vista, no se guarda.
  const [visibleCategoryIds, setVisibleCategoryIds] = useState(() => new Set())

  // Borrador para un bloque nuevo en `day` a partir de `start`: dura 1 h, pero se acorta
  // si choca con el bloque siguiente o con el cierre de la franja.
  function openCreate(day, start) {
    const probe = { id: null, day, start, end: start + MIN_DURATION }
    const { max } = getResizeBounds(probe, 'end', blocks, settings)
    setDrawer({ block: null, draft: { day, start, end: Math.min(start + DEFAULT_DURATION, max) } })
  }

  // Botón "Agregar bloque": hoy a las 09:00 (o lo más cerca posible dentro de la franja).
  function openCreateFromButton() {
    const start = Math.min(Math.max(9 * 60, settings.dayStart), settings.dayEnd - DEFAULT_DURATION)
    setDrawer({ block: null, draft: { day: new Date().getDay(), start, end: start + DEFAULT_DURATION } })
  }

  function handleSave(data) {
    if (drawer.block) {
      updateBlock(drawer.block.id, data)
    } else {
      addBlock(data)
    }
    setDrawer(null)
  }

  function handleDelete(id) {
    deleteBlock(id)
    setDrawer(null)
  }

  function handleDeleteCategory(id) {
    deleteCategory(id)
    // Si estaba en el filtro, la sacamos: si no, el filtro quedaría apuntando a algo que no existe.
    setVisibleCategoryIds((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }

  return (
    <div className="schedule-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Time-blocking • Semana tipo</p>
          <h1 className="page-heading__title">Calendario semanal</h1>
          <p className="page-heading__subtitle">
            Planifica tu semana ideal en bloques de tiempo. Se repite todas las semanas.
          </p>
        </div>
        <div className="page-heading__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setIsEditingRange(true)}
            title="Cambiar la franja horaria visible"
          >
            ⚙ {toTimeLabel(settings.dayStart)}–{toTimeLabel(settings.dayEnd)}
          </button>
          <button type="button" className="btn btn--primary" onClick={openCreateFromButton}>
            + Agregar bloque
          </button>
        </div>
      </div>

      <HoursSummary blocks={blocks} categories={categories} />

      <section className="card schedule-card">
        <CategoryFilters
          categories={categories}
          blocks={blocks}
          selectedIds={visibleCategoryIds}
          onChange={setVisibleCategoryIds}
          onManage={() => setIsManagingCategories(true)}
        />
        <WeekGrid
          blocks={blocks}
          categories={categories}
          settings={settings}
          visibleCategoryIds={visibleCategoryIds}
          onBlockClick={(block) => setDrawer({ block })}
          onSlotClick={openCreate}
          onBlockResize={(block, { start, end }) => updateBlock(block.id, { start, end })}
        />
      </section>

      {drawer && (
        <BlockDrawer
          block={drawer.block}
          draft={drawer.draft}
          blocks={blocks}
          categories={categories}
          settings={settings}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setDrawer(null)}
        />
      )}

      {isManagingCategories && (
        <CategoryManager
          categories={categories}
          blocks={blocks}
          onAdd={addCategory}
          onUpdate={updateCategory}
          onDelete={handleDeleteCategory}
          onClose={() => setIsManagingCategories(false)}
        />
      )}

      {isEditingRange && (
        <RangeSettings
          settings={settings}
          blocks={blocks}
          onSave={(range) => {
            updateSettings(range)
            setIsEditingRange(false)
          }}
          onClose={() => setIsEditingRange(false)}
        />
      )}
    </div>
  )
}
