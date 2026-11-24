import type { Recipe } from "./catalog.js";

/** Engine-independent inventory planning. token keeps custom item metadata intact. */
export interface Stack {
  typeId: string; amount: number; maxAmount: number; plain: boolean; token?: number;
}
export type Slots = (Stack | undefined)[];
export type Plan = { ok: true; slots: Slots } | { ok: false; reason: "missing" | "full" | "hand" };
export const cloneSlots = (slots: Slots): Slots => slots.map(s => s && { ...s });
export function count(slots: Slots, typeId: string): number {
  return slots.reduce((n, s) => n + (s?.typeId === typeId ? s.amount : 0), 0);
}
function remove(slots: Slots, typeId: string, amount: number): boolean {
  if (count(slots, typeId) < amount) return false;
  for (let i = 0; i < slots.length && amount > 0; i++) {
    const s = slots[i];
    if (s?.typeId !== typeId) continue;
    const take = Math.min(s.amount, amount);
    s.amount -= take; amount -= take;
    if (s.amount === 0) slots[i] = undefined;
  }
  return true;
}
function insert(slots: Slots, typeId: string, amount: number, maxAmount: number): boolean {
  for (const s of slots) {
    if (!s || s.typeId !== typeId || !s.plain) continue;
    const add = Math.min(amount, Math.max(0, maxAmount - s.amount));
    s.amount += add; amount -= add;
    if (amount === 0) return true;
  }
  for (let i = 0; i < slots.length && amount > 0; i++) {
    if (slots[i]) continue;
    const add = Math.min(amount, maxAmount);
    slots[i] = { typeId, amount: add, maxAmount, plain: true };
    amount -= add;
  }
  return amount === 0;
}
export function planInsert(source: Slots, typeId: string, amount: number, maxAmount: number): Plan {
  const slots = cloneSlots(source);
  return insert(slots, typeId, amount, maxAmount) ? { ok: true, slots } : { ok: false, reason: "full" };
}
export function planCraft(source: Slots, recipe: Recipe, maxAmount: (id: string) => number): Plan {
  const slots = cloneSlots(source);
  for (const input of recipe.inputs) {
    if (!remove(slots, input.item, input.count)) return { ok: false, reason: "missing" };
  }
  const output = `mcpe_food:${recipe.key}`;
  if (!insert(slots, output, recipe.output, maxAmount(output))) return { ok: false, reason: "full" };
  for (const input of recipe.inputs) {
    if (input.returns && !insert(slots, input.returns, input.count, maxAmount(input.returns))) {
      return { ok: false, reason: "full" };
    }
  }
  return { ok: true, slots };
}
export function planServe(source: Slots, selected: number, typeId: string): Plan {
  const slots = cloneSlots(source);
  const hand = slots[selected];
  if (!hand || hand.typeId !== typeId) return { ok: false, reason: "hand" };
  hand.amount--;
  if (hand.amount === 0) slots[selected] = undefined;
  return { ok: true, slots };
}
/** An async menu may confirm once only. No awaited work is allowed after claim. */
export class MenuSessions {
  private serial = 0;
  private active = new Map<string, number>();
  begin(player: string): number | undefined {
    if (this.active.has(player)) return undefined;
    const token = ++this.serial;
    this.active.set(player, token);
    return token;
  }
  claim(player: string, token: number): boolean {
    if (this.active.get(player) !== token) return false;
    this.active.delete(player);
    return true;
  }
  isActive(player: string, token: number): boolean {
    return this.active.get(player) === token;
  }
  finish(player: string, token?: number): void {
    if (token === undefined || this.active.get(player) === token) this.active.delete(player);
  }
}
