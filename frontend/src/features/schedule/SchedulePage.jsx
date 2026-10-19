import { useSchedule } from './useSchedule.js'
import WeekGrid from './WeekGrid.jsx'
import './schedule.css'

export default function SchedulePage() {
  const { blocks, categories, settings } = useSchedule()

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
      </div>

      <section className="card schedule-card">
        <WeekGrid
          blocks={blocks}
          categories={categories}
          settings={settings}
          onBlockClick={() => {}}
          onSlotClick={() => {}}
        />
      </section>
    </div>
  )
}
