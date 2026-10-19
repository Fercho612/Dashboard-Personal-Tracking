import { useState } from 'react'
import { useSchedule } from './useSchedule.js'
import { MIN_DURATION, getResizeBounds } from './scheduleUtils.js'
import WeekGrid from './WeekGrid.jsx'
import BlockDrawer from './BlockDrawer.jsx'
import './schedule.css'

const DEFAULT_DURATION = 60

export default function SchedulePage() {
  const { blocks, categories, settings, addBlock, updateBlock, deleteBlock } = useSchedule()

  // null = cerrado · { block } = editar · { block: null, draft } = crear
  const [drawer, setDrawer] = useState(null)

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
        <button type="button" className="btn btn--primary" onClick={openCreateFromButton}>
          + Agregar bloque
        </button>
      </div>

      <section className="card schedule-card">
        <WeekGrid
          blocks={blocks}
          categories={categories}
          settings={settings}
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
    </div>
  )
}
