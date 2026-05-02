"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export default function PrizePool() {
  return (
    <Card className="p-4 mb-6 bg-gradient-to-br from-primary/10 to-background border-2 border-primary/20 shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="text-yellow-500" size={24} />
        <h3 className="font-bold text-lg text-primary">Current Prize Pool</h3>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-bold">Total Jackpot</p>
          <p className="text-3xl font-black text-foreground">1,250 π</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Next Draw</p>
          <p className="text-sm font-bold text-primary">In 2 Days</p>
        </div>
      </div>
    </Card>
  )
}