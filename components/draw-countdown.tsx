"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

export function DrawCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 32,
    seconds: 45,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">Next Draw In</p>
        <div className="flex justify-center gap-4">
          <TimeUnit value={timeLeft.days} label="Days" />
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <TimeUnit value={timeLeft.minutes} label="Mins" />
          <TimeUnit value={timeLeft.seconds} label="Secs" />
        </div>
      </div>
    </Card>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-primary text-primary-foreground rounded-lg w-14 h-14 flex items-center justify-center text-2xl font-bold">
        {value.toString().padStart(2, "0")}
      </div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  )
}
export default DrawCountdown;