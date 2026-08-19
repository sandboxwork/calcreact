import { useEffect, useReducer } from 'react'

type Operator = '+' | '-' | '×' | '÷'

type State = {
  display: string
  accumulator: number | null
  operator: Operator | null
  waitingForOperand: boolean
  history: string
}

type Action =
  | { type: 'digit'; value: string }
  | { type: 'decimal' }
  | { type: 'operator'; value: Operator }
  | { type: 'equals' }
  | { type: 'clear' }
  | { type: 'sign' }
  | { type: 'percent' }
  | { type: 'backspace' }

const initialState: State = {
  display: '0',
  accumulator: null,
  operator: null,
  waitingForOperand: false,
  history: '',
}

const MAX_DISPLAY_LENGTH = 15

function calculate(left: number, right: number, operator: Operator) {
  switch (operator) {
    case '+':
      return left + right
    case '-':
      return left - right
    case '×':
      return left * right
    case '÷':
      return right === 0 ? Number.NaN : left / right
  }
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return 'Error'

  const rounded = Number.parseFloat(value.toPrecision(12))
  const text = String(rounded)

  if (text.length <= MAX_DISPLAY_LENGTH) return text
  return rounded.toExponential(8)
}

function reducer(state: State, action: Action): State {
  if (action.type === 'clear') return initialState

  if (state.display === 'Error') {
    if (action.type === 'digit') {
      return { ...initialState, display: action.value }
    }
    if (action.type === 'decimal') {
      return { ...initialState, display: '0.' }
    }
    return initialState
  }

  switch (action.type) {
    case 'digit': {
      if (state.waitingForOperand) {
        return { ...state, display: action.value, waitingForOperand: false }
      }

      if (state.display.replace('-', '').replace('.', '').length >= MAX_DISPLAY_LENGTH) {
        return state
      }

      return {
        ...state,
        display: state.display === '0' ? action.value : state.display + action.value,
      }
    }

    case 'decimal':
      if (state.waitingForOperand) {
        return { ...state, display: '0.', waitingForOperand: false }
      }
      if (state.display.includes('.')) return state
      return { ...state, display: `${state.display}.` }

    case 'operator': {
      const current = Number(state.display)

      if (state.operator && state.waitingForOperand) {
        return {
          ...state,
          operator: action.value,
          history: `${formatNumber(state.accumulator ?? current)} ${action.value}`,
        }
      }

      if (state.accumulator === null || state.operator === null) {
        return {
          ...state,
          accumulator: current,
          operator: action.value,
          waitingForOperand: true,
          history: `${formatNumber(current)} ${action.value}`,
        }
      }

      const result = calculate(state.accumulator, current, state.operator)
      const formatted = formatNumber(result)

      if (formatted === 'Error') {
        return { ...initialState, display: 'Error', waitingForOperand: true }
      }

      return {
        display: formatted,
        accumulator: result,
        operator: action.value,
        waitingForOperand: true,
        history: `${formatted} ${action.value}`,
      }
    }

    case 'equals': {
      if (state.accumulator === null || state.operator === null) return state

      const current = Number(state.display)
      const result = calculate(state.accumulator, current, state.operator)
      const formatted = formatNumber(result)

      if (formatted === 'Error') {
        return { ...initialState, display: 'Error', history: '0으로 나눌 수 없습니다.' }
      }

      return {
        display: formatted,
        accumulator: null,
        operator: null,
        waitingForOperand: true,
        history: `${formatNumber(state.accumulator)} ${state.operator} ${formatNumber(current)} =`,
      }
    }

    case 'sign':
      if (state.waitingForOperand || state.display === '0') return state
      return {
        ...state,
        display: state.display.startsWith('-') ? state.display.slice(1) : `-${state.display}`,
      }

    case 'percent':
      if (state.waitingForOperand) return state
      return { ...state, display: formatNumber(Number(state.display) / 100) }

    case 'backspace':
      if (state.waitingForOperand) return state
      if (state.display.length <= 1 || (state.display.startsWith('-') && state.display.length === 2)) {
        return { ...state, display: '0' }
      }
      return { ...state, display: state.display.slice(0, -1) }
  }
}

const buttons = [
  'AC', '+/-', '%', '÷',
  '7', '8', '9', '×',
  '4', '5', '6', '-',
  '1', '2', '3', '+',
  '0', '.', '=',
] as const

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const press = (label: (typeof buttons)[number]) => {
    if (/^\d$/.test(label)) dispatch({ type: 'digit', value: label })
    else if (label === '.') dispatch({ type: 'decimal' })
    else if (label === '=') dispatch({ type: 'equals' })
    else if (label === 'AC') dispatch({ type: 'clear' })
    else if (label === '+/-') dispatch({ type: 'sign' })
    else if (label === '%') dispatch({ type: 'percent' })
    else if (label === '+' || label === '-' || label === '×' || label === '÷') {
      dispatch({ type: 'operator', value: label })
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (/^\d$/.test(event.key)) dispatch({ type: 'digit', value: event.key })
      else if (event.key === '.') dispatch({ type: 'decimal' })
      else if (event.key === '+' || event.key === '-') {
        dispatch({ type: 'operator', value: event.key })
      } else if (event.key === '*') dispatch({ type: 'operator', value: '×' })
      else if (event.key === '/') dispatch({ type: 'operator', value: '÷' })
      else if (event.key === 'Enter' || event.key === '=') dispatch({ type: 'equals' })
      else if (event.key === 'Escape' || event.key === 'Delete') dispatch({ type: 'clear' })
      else if (event.key === 'Backspace') dispatch({ type: 'backspace' })
      else if (event.key === '%') dispatch({ type: 'percent' })
      else return

      event.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main className="app-shell">
      <section className="calculator" aria-label="계산기">
        <header className="calculator__header">
          <span>CalcReact</span>
          <span className="calculator__hint">Keyboard ready</span>
        </header>

        <div className="display" aria-live="polite">
          <div className="display__history">{state.history || '\u00A0'}</div>
          <div className="display__value">{state.display}</div>
        </div>

        <div className="keypad">
          {buttons.map((label) => {
            const isOperator = ['÷', '×', '-', '+', '='].includes(label)
            const isUtility = ['AC', '+/-', '%'].includes(label)
            const classNames = [
              'key',
              isOperator ? 'key--operator' : '',
              isUtility ? 'key--utility' : '',
              label === '0' ? 'key--zero' : '',
            ].filter(Boolean).join(' ')

            return (
              <button
                className={classNames}
                key={label}
                type="button"
                onClick={() => press(label)}
                aria-label={label === '÷' ? '나누기' : label === '×' ? '곱하기' : label}
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default App
