import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Get initial mobile state synchronously to prevent hydration mismatch.
 * Returns true if window.innerWidth < MOBILE_BREAKPOINT, false if window doesn't exist.
 */
function getInitialMobileState(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth < MOBILE_BREAKPOINT
}

export function useIsMobile() {
  // Initialize with the actual current value to prevent hydration mismatch
  const [isMobile, setIsMobile] = React.useState<boolean>(getInitialMobileState())

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Ensure we have the correct value after hydration
    const currentValue = window.innerWidth < MOBILE_BREAKPOINT
    if (isMobile !== currentValue) {
      setIsMobile(currentValue)
    }
    
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [isMobile])

  return isMobile
}
