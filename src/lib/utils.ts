export function moveItem<T>(arr: T[], index: number, dir: "up" | "down"): T[] {
  if (dir === "up" && index === 0) return arr;
  if (dir === "down" && index === arr.length - 1) return arr;
  const next = [...arr];
  const swap = dir === "up" ? index - 1 : index + 1;
  [next[index], next[swap]] = [next[swap], next[index]];
  return next;
}
