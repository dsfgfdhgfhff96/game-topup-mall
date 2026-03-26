import { useState, useEffect } from 'react'

export function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const narrowScreen = window.innerWidth <= 768
    setIsMobile(mobileUA || narrowScreen)
  }, [])

  return { isMobile }
}
