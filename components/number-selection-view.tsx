"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import NumberGrid from "./number-grid"
import SelectedNumbers from "./selected-numbers"

interface Props {
  onBack: () => void
}

export default function NumberSelectionView({ onBack }: Props) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])

  const handleNumberToggle = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num))
    } else if (selectedNumbers.length < 10) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b))
    }
  }

  const handleQuickPick = () => {
    const randomNumbers: number[] = []
    while (randomNumbers.length < 10) {
      const r = Math.floor(Math.random() * 45) + 1
      if (!randomNumbers.includes(r)) randomNumbers.push(r)
    }
    setSelectedNumbers(randomNumbers.sort((a, b) => a - b))
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold italic">LUCKY 10 SELECTION</h1>
      </div>

      <main className="container mx-auto px-4 max-w-2xl">
        <Card className="p-6 mb-6 shadow-2xl border-2 border-primary/10 rounded-[2rem] bg-black/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase tracking-tighter text-muted-foreground">Select 10 Numbers</h2>
            <span className="text-3xl font-black text-primary">{selectedNumbers.length}/10</span>
          </div>

          <SelectedNumbers numbers={selectedNumbers} onRemove={handleNumberToggle} />
          <NumberGrid selectedNumbers={selectedNumbers} onNumberToggle={handleNumberToggle} />

          <div className="flex gap-4 mt-8">
            <Button variant="outline" className="flex-1 h-14 font-bold rounded-2xl border-primary/30" onClick={handleQuickPick}>
              Quick Pick
            </Button>
            <Button variant="ghost" className="flex-1 h-14 font-bold rounded-2xl" onClick={() => setSelectedNumbers([])}>
              Clear
            </Button>
          </div>
        </Card>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-md border-t z-50">
        <Button 
          disabled={selectedNumbers.length !== 10}
          className="w-full h-16 text-2xl font-black rounded-2xl shadow-xl bg-primary text-black"
        >
          {selectedNumbers.length === 10 ? "CONFIRM & PLAY" : "SELECT 10 NUMBERS"}
        </Button>
      </div>
    </div>
  )
}