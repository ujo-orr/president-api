import type { President } from '../types/archive'

export function formatPresidentialNumbers(numbers: number[]) {
  const first = numbers[0]
  const last = numbers.at(-1)
  return first === last ? `제${first}대` : `제${first}–${last}대`
}

export function formatRepublics([start, end = start]: President['republics']) {
  return start === end ? `제${start}공화국` : `제${start}공화국 ~ 제${end}공화국`
}

export function formatTermMonth(date: string) {
  const [year, month] = date.split('-')
  return `${year}년 ${Number(month)}월`
}
