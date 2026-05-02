"use client"

import React from "react"
import { X } from "lucide-react"

// 1. 설계도(Interface) 정의
interface SelectedNumbersProps {
  numbers: number[] // 숫자 배열을 받습니다.
  onRemove: (num: number) => void // 삭제 함수를 받습니다.
}

// 2. 부품 조립
export default function SelectedNumbers({ numbers, onRemove }: SelectedNumbersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] p-2 bg-muted/20 rounded-xl border border-dashed border-primary/20">
      {/* 번호가 하나도 없을 때 안내 문구 */}
      {numbers.length === 0 && (
        <p className="text-sm text-muted-foreground ml-2 leading-8">번호 10개를 골라주세요</p>
      )}

      {/* 선택된 번호들을 하나씩 나열 (반드시 numbers.map 사용) */}
      {numbers.map((num) => (
        <span
          key={num}
          className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-sm animate-in fade-in zoom-in duration-200"
        >
          {num}
          <button 
            type="button"
            onClick={() => onRemove(num)} 
            className="hover:bg-white/20 rounded-full p-0.5 transition-colors flex items-center justify-center"
            aria-label={`Remove number ${num}`}
          >
            <X size={14} />
          </button>
        </span>
      ))}
    </div>
  )
}