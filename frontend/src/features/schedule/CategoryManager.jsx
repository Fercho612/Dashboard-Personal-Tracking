import { useEffect, useRef, useState } from 'react'
import { PALETTE, PALETTE_KEYS, getCategoryColor } from './palette.js'
import { validateCategoryName } from './scheduleUtils.js'

const NAME_MAX = 30

/**
 * Diálogo para crear, renombrar, recolorear y borrar categorías.
 * Una categoría con bloques no se puede borrar: primero hay que reasignarlos o borrarlos.
 */
export default function CategoryManager({ categories, blocks, onAdd, onUpdate, onDelete, onClose }) {
  const dialogRef = useRef(null)
  // null = mostrando la lista · { id, name, color } = formulario (id null → nueva)
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
    return () => dialog.close()
  }, [])

  const countBlocks = (id) => blocks.filter((block) => block.categoryId === id).length

  function startCreate() {
    // Sugerimos el primer color que todavía no usa ninguna categoría.
    const usedColors = new Set(categories.map((category) => category.color))
    const color = PALETTE_KEYS.find((key) => !usedColors.has(key)) ?? PALETTE_KEYS[0]
    setForm({ id: null, name: '', color })
    setError('')
  }

  function startEdit(category) {
    setForm({ ...category })
    setError('')
    setConfirmingDeleteId(null)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateCategoryName(form.name, categories, form.id)
    if (validationError) {
      setError(validationError)
      return
    }
    const data = { name: form.name.trim(), color: form.color }
    if (form.id) onUpdate(form.id, data)
    else onAdd(data)
    setForm(null)
  }

  function requestDelete(category) {
    const count = countBlocks(category.id)
    if (count > 0) {
      setError(`No se puede borrar «${category.name}»: tiene ${count} ${count === 1 ? 'bloque' : 'bloques'}.`)
      return
    }
    setError('')
    setConfirmingDeleteId(category.id)
  }

  function confirmDelete(id) {
    onDelete(id)
    setConfirmingDeleteId(null)
  }

  function backToList() {
    setForm(null)
    setError('')
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="category-manager-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="modal__body">
        <h2 id="category-manager-title" className="card__title">
          {form ? (form.id ? 'Editar categoría' : 'Nueva categoría') : 'Gestionar categorías'}
        </h2>

        {form ? (
          <form className="category-form" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span className="field__label">Nombre</span>
              <input
                className="input"
                value={form.name}
                maxLength={NAME_MAX}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Ej. Estudio"
                autoFocus
              />
            </label>

            <fieldset className="field">
              <legend className="field__label">Color</legend>
              <div className="swatches">
                {PALETTE_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`swatch ${form.color === key ? 'is-selected' : ''}`}
                    style={{ '--cat': PALETTE[key].color }}
                    aria-pressed={form.color === key}
                    aria-label={PALETTE[key].label}
                    title={PALETTE[key].label}
                    onClick={() => setForm({ ...form, color: key })}
                  />
                ))}
              </div>
            </fieldset>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="modal__actions">
              <div className="modal__actions-main">
                <button type="button" className="btn btn--ghost" onClick={backToList}>
                  Volver
                </button>
                <button type="submit" className="btn btn--primary">
                  {form.id ? 'Guardar' : 'Crear categoría'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            {categories.length === 0 ? (
              <p className="field__hint">No hay categorías. Crea la primera para poder agregar bloques.</p>
            ) : (
              <ul className="category-list">
                {categories.map((category) => (
                  <li key={category.id} className="category-list__item" style={{ '--cat': getCategoryColor(category.color) }}>
                    <span className="category-dot" aria-hidden="true" />
                    <span className="category-list__name">{category.name}</span>
                    <span className="category-list__count">
                      {countBlocks(category.id)} {countBlocks(category.id) === 1 ? 'bloque' : 'bloques'}
                    </span>
                    {confirmingDeleteId === category.id ? (
                      <span className="category-list__actions">
                        <button type="button" className="btn btn--danger btn--small" onClick={() => confirmDelete(category.id)}>
                          Sí, borrar
                        </button>
                        <button type="button" className="btn btn--ghost btn--small" onClick={() => setConfirmingDeleteId(null)}>
                          No
                        </button>
                      </span>
                    ) : (
                      <span className="category-list__actions">
                        <button type="button" className="btn btn--ghost btn--small" onClick={() => startEdit(category)}>
                          Editar
                        </button>
                        <button type="button" className="btn btn--danger btn--small" onClick={() => requestDelete(category)}>
                          Borrar
                        </button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={startCreate}>
                + Nueva categoría
              </button>
              <div className="modal__actions-main">
                <button type="button" className="btn btn--primary" onClick={onClose}>
                  Listo
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}
