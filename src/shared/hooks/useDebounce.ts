import { useEffect, useState } from "react"

export const useDebounce = <T,>(value: T, delay = 500) => {
    const [debounceValue, setDebounceValue] = useState(value)

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebounceValue(value)
        }, delay)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [value,delay])

    return debounceValue
}