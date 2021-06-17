import React, { useState } from 'react'

import { useAppSelector, useAppDispatch } from '../../app/hooks'
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  incrementIfOdd,
  selectCount,
} from './counterSlice'
import styles from './Counter.module.css'

// tslint:disable: jsx-no-lambda
export function Counter() {
  const count = useAppSelector(selectCount)
  const dispatch = useAppDispatch()
  const [incrementAmount, setIncrementAmount] = useState('2')

  const incrementValue = Number(incrementAmount) || 0

  const dispatchDecrement = () => dispatch(decrement())
  const dispatchIncrement = () => dispatch(increment())
  const setIncrementAmountFunc = (e) => setIncrementAmount(e.target.value)

  return (
    <div>
      <div className={styles.row}>
        <button className={styles.button} aria-label="Decrement value" onClick={dispatchDecrement}>
          -
        </button>
        <span className={styles.value}>{count}</span>
        <button className={styles.button} aria-label="Increment value" onClick={dispatchIncrement}>
          +
        </button>
      </div>
      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={setIncrementAmountFunc}
        />
        <button
          className={styles.button}
          onClick={() => dispatch(incrementByAmount(incrementValue))}
        >
          Add Amount
        </button>
        <button
          className={styles.asyncButton}
          onClick={() => dispatch(incrementAsync(incrementValue))}
        >
          Add Async
        </button>
        <button className={styles.button} onClick={() => dispatch(incrementIfOdd(incrementValue))}>
          Add If Odd
        </button>
      </div>
    </div>
  )
}
