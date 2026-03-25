'use client'

import { useEffect, useRef, useState } from 'react'
import { readClientValue, writeClientValue } from '@/lib/client-db'

export function usePersistedState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)
  const initialisedRef = useRef(false)

  useEffect(() => {
    let active = true

    readClientValue<T>(key)
      .then((storedValue) => {
        if (!active) return
        if (storedValue !== undefined) {
          setValue(storedValue)
        }
        setIsHydrated(true)
        initialisedRef.current = true
      })
      .catch(() => {
        if (!active) return
        setIsHydrated(true)
        initialisedRef.current = true
      })

    return () => {
      active = false
    }
  }, [key])

  useEffect(() => {
    if (!initialisedRef.current) return
    void writeClientValue(key, value)
  }, [key, value])

  return { value, setValue, isHydrated }
}
