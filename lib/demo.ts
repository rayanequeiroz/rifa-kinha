import { calculateTotal, campaign } from './campaign.ts';

export type NumberStatus = 'available' | 'reserved' | 'sold';
export type DemoOrder = {
  id: string;
  name: string;
  numbers: number[];
  total: number;
  expiresAt: number;
  confirmed: boolean;
};

export const numberList = Array.from({ length: campaign.totalNumbers }, (_, index) => index + 1);
export const demoPixCode = 'RIFA-KINHA-DEMONSTRACAO-SEM-VALOR';
const initialSold = [3, 7, 12, 19, 23, 28, 34, 45, 68, 71, 85, 102, 113, 139, 152, 187, 212, 230, 255, 273, 286, 298];
const initialReserved = [5, 16, 31, 42, 49, 54, 77, 97, 141, 172, 195, 233, 275];

export function orderStatus(order: DemoOrder, now: number) {
  if (order.confirmed) return 'confirmed';
  return now >= order.expiresAt ? 'expired' : 'pending';
}

export function availability(orders: DemoOrder[], now: number) {
  const states = new Map<number, NumberStatus>();
  initialReserved.forEach((number) => states.set(number, 'reserved'));
  initialSold.forEach((number) => states.set(number, 'sold'));

  for (const order of orders) {
    const status = orderStatus(order, now);
    if (status === 'expired') continue;
    for (const number of order.numbers) {
      states.set(number, status === 'confirmed' ? 'sold' : 'reserved');
    }
  }
  return states;
}

export function toggleNumber(selected: number[], number: number, states: ReadonlyMap<number, NumberStatus>) {
  if (selected.includes(number)) return selected.filter((item) => item !== number);
  if (!numberList.includes(number) || states.has(number)) return selected;
  return [...selected, number].sort((a, b) => a - b);
}

export function pickRandomNumber(selected: number[], states: ReadonlyMap<number, NumberStatus>, random = Math.random) {
  const candidates = numberList.filter((number) => !states.has(number) && !selected.includes(number));
  return candidates.length ? candidates[Math.floor(random() * candidates.length)] : undefined;
}

export function validParticipant(name: string, phone: string) {
  const digits = phone.replace(/[\s()+-]/g, '');
  return name.trim().split(/\s+/).length >= 2 && /^[1-9]{2}\d{8,9}$/.test(digits);
}

export function createDemoOrder(orders: DemoOrder[], numbers: number[], name: string, id: string, now: number) {
  const states = availability(orders, now);
  if (!numbers.length || new Set(numbers).size !== numbers.length ||
      numbers.some((number) => !numberList.includes(number) || states.has(number))) {
    return null;
  }

  return {
    id,
    name: name.trim(),
    numbers: [...numbers].sort((a, b) => a - b),
    total: calculateTotal(numbers.length),
    expiresAt: now + campaign.reservationMinutes * 60_000,
    confirmed: false,
  };
}

export function confirmDemoOrder(orders: DemoOrder[], id: string, now: number) {
  return orders.map((order) =>
    order.id === id && orderStatus(order, now) === 'pending'
      ? { ...order, confirmed: true }
      : order,
  );
}
