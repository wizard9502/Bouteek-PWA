
import { useState, useRef, useEffect } from "react"

export function useComposition() {
    const [isComposing, setIsComposing] = useState(false)
    const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

    useEffect(() => {
        const handleCompositionStart = () => setIsComposing(true)
        const handleCompositionEnd = () => setIsComposing(false)

        const element = ref.current

        if (element) {
            element.addEventListener("compositionstart", handleCompositionStart)
            element.addEventListener("compositionend", handleCompositionEnd)
        }

        return () => {
            if (element) {
                element.removeEventListener("compositionstart", handleCompositionStart)
                element.removeEventListener("compositionend", handleCompositionEnd)
            }
        }
    }, [])

    return { ref, isComposing }
}
