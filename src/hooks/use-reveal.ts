import { useEffect, useRef, useState } from "react"

function skipsAnimation(): boolean {
  if (typeof window === "undefined") {
    return true
  }

  return (
    typeof IntersectionObserver === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15,
) {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(skipsAnimation)

  useEffect(() => {
    const node = ref.current

    if (!node || shown) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [shown, threshold])

  return { ref, shown }
}
