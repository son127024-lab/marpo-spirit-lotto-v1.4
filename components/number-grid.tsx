"use client"

import React from "react"

// 부품이 받아야 할 정확한 데이터 규격입니다.
interface NumberGridProps {
  selectedNumbers: number[]
  onNumberToggle: (num: number) => void
}

export default function NumberGrid({ selectedNumbers, onNumberToggle }: NumberGridProps) {
  // 1부터 45까지 번호 생성
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-7 gap-2 p-2 bg-muted/10 rounded-xl border border-border">
      {numbers.map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onNumberToggle(num)}
          className={`h-10 w-10 rounded-full border text-sm font-bold transition-all duration-200 ${
            selectedNumbers.includes(num)
              ? "bg-primary text-primary-foreground scale-110 shadow-md border-primary"
              : "bg-background hover:bg-muted border-border text-foreground"
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  )
}