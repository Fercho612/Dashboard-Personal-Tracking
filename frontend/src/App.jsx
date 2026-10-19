import Sidebar from './components/Sidebar.jsx'
import HabitsPage from './features/habits/HabitsPage.jsx'
import './styles/global.css'

// Fecha larga en español, p. ej. "domingo, 19 de octubre".
const todayLabel = new Date().toLocaleDateString('es', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export default function App() {
  return (
    <div className="app">
      <Sidebar activeSection="habits" />
      <main className="app__main">
        <header className="app__header">
          <span className="capitalize">{todayLabel}</span>
        </header>
        <HabitsPage />
      </main>
    </div>
  )
}
