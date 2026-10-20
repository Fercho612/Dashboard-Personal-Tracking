import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import HabitsPage from './features/habits/HabitsPage.jsx'
import SchedulePage from './features/schedule/SchedulePage.jsx'

// Fecha larga en español, p. ej. "domingo, 19 de octubre".
const todayLabel = new Date().toLocaleDateString('es', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export default function App() {
  // Navegación simple entre secciones: con dos o tres páginas no hace falta un router.
  const [activeSection, setActiveSection] = useState('habits')

  return (
    <div className="app">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
      <main className="app__main">
        <header className="app__header">
          <span className="capitalize">{todayLabel}</span>
        </header>
        {activeSection === 'habits' && <HabitsPage />}
        {activeSection === 'calendar' && <SchedulePage />}
      </main>
    </div>
  )
}
