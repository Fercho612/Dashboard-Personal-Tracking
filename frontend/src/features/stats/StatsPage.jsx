import { useMemo, useState } from 'react'
import { useStatsData } from './useStatsData.js'
import {
  getBars,
  getHabitRanking,
  getMatrixMonthLabels,
  getMatrixWeeks,
  getPerfectDays,
  getPeriodRange,
  getPreviousRange,
  getRangeStats,
} from './statsUtils.js'
import ComplianceCard from './ComplianceCard.jsx'
import ConsistencyCard from './ConsistencyCard.jsx'
import ConsistencyMatrix from './ConsistencyMatrix.jsx'
import PeriodBars from './PeriodBars.jsx'
import HabitRanking from './HabitRanking.jsx'
import './stats.css'

const PERIODS = [
  { id: 'week', label: 'Esta semana', previousLabel: 'la semana pasada' },
  { id: 'month', label: 'Este mes', previousLabel: 'el mes pasado' },
  { id: '90days', label: 'Últimos 90 días', previousLabel: 'los 90 días previos' },
]

export default function StatsPage({ onNavigate }) {
  const { habits, completions } = useStatsData()

  // "Hoy" se fija al abrir la sección; todas las cuentas parten de esta fecha.
  const [today] = useState(() => new Date())
  const [periodId, setPeriodId] = useState('week')
  const [habitFilter, setHabitFilter] = useState('all')

  // Si el hábito filtrado ya no existe, se vuelve a "Todos los hábitos".
  const activeFilter = habits.some((habit) => habit.id === habitFilter) ? habitFilter : 'all'
  const period = PERIODS.find((item) => item.id === periodId)

  // useMemo guarda el resultado y solo lo recalcula cuando cambia alguna de sus dependencias:
  // así cambiar de período o de filtro no repite cuentas que no dependen de ello.
  const stats = useMemo(() => {
    const scopedHabits = activeFilter === 'all' ? habits : habits.filter((habit) => habit.id === activeFilter)
    const range = getPeriodRange(periodId, today)
    const weeks = getMatrixWeeks(scopedHabits, completions, today)

    return {
      current: getRangeStats(scopedHabits, completions, range, today),
      previous: getRangeStats(scopedHabits, completions, getPreviousRange(periodId, today), today),
      perfect: getPerfectDays(scopedHabits, completions, range, today),
      bars: getBars(periodId, scopedHabits, completions, today),
      ranking: getHabitRanking(scopedHabits, completions, range, today),
      weeks,
      monthLabels: getMatrixMonthLabels(weeks),
    }
  }, [habits, completions, today, periodId, activeFilter])

  return (
    <div className="stats-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Métricas • {period.label}</p>
          <h1 className="page-heading__title">Estadísticas</h1>
          <p className="page-heading__subtitle">Mira cómo evoluciona tu constancia y qué hábitos te cuestan más.</p>
        </div>

        {habits.length > 0 && (
          <div className="stats-controls">
            <div className="segmented" role="radiogroup" aria-label="Período">
              {PERIODS.map((item) => (
                <label key={item.id} className={`segmented__option ${item.id === periodId ? 'is-active' : ''}`}>
                  <input
                    type="radio"
                    name="period"
                    value={item.id}
                    checked={item.id === periodId}
                    onChange={() => setPeriodId(item.id)}
                  />
                  {item.label}
                </label>
              ))}
            </div>

            <select
              className="input stats-controls__habit"
              aria-label="Hábito"
              value={activeFilter}
              onChange={(event) => setHabitFilter(event.target.value)}
            >
              <option value="all">Todos los hábitos</option>
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {habits.length === 0 ? (
        <section className="card empty-state">
          <h2 className="card__title">Todavía no hay datos para mostrar</h2>
          <p>Crea tus primeros hábitos y empieza a marcarlos para ver tus estadísticas.</p>
          <button type="button" className="btn btn--primary" onClick={() => onNavigate('habits')}>
            Ir a Hábitos
          </button>
        </section>
      ) : (
        <>
          <div className="stats-cards">
            <ComplianceCard current={stats.current} previous={stats.previous} previousLabel={period.previousLabel} />
            <ConsistencyCard perfect={stats.perfect} />
          </div>
          <ConsistencyMatrix weeks={stats.weeks} monthLabels={stats.monthLabels} />
          <div className="stats-bottom">
            <PeriodBars bars={stats.bars} byDay={periodId === 'week'} />
            <HabitRanking ranking={stats.ranking} />
          </div>
        </>
      )}
    </div>
  )
}
