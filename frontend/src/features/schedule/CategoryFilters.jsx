import { getCategoryColor } from './palette.js'

/**
 * Chips de filtro. `selectedIds` es un Set con las categorías visibles;
 * vacío significa "Todos". Se pueden activar varias a la vez.
 */
export default function CategoryFilters({ categories, blocks, selectedIds, onChange, onManage }) {
  const countByCategory = (id) => blocks.filter((block) => block.categoryId === id).length

  function toggle(id) {
    // Creamos un Set nuevo en vez de modificar el actual: React detecta el cambio por referencia.
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <div className="filters">
      <span className="filters__label">Filtros:</span>
      <button
        type="button"
        className={`chip ${selectedIds.size === 0 ? 'is-active' : ''}`}
        aria-pressed={selectedIds.size === 0}
        onClick={() => onChange(new Set())}
      >
        Todos <span className="chip__count">{blocks.length}</span>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`chip ${selectedIds.has(category.id) ? 'is-active' : ''}`}
          style={{ '--cat': getCategoryColor(category.color) }}
          aria-pressed={selectedIds.has(category.id)}
          onClick={() => toggle(category.id)}
        >
          <span className="category-dot" aria-hidden="true" />
          {category.name} <span className="chip__count">{countByCategory(category.id)}</span>
        </button>
      ))}
      <button type="button" className="btn btn--ghost btn--small filters__manage" onClick={onManage}>
        Gestionar categorías
      </button>
    </div>
  )
}
