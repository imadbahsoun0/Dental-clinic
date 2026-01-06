export interface IdColorPair {
  fg: string;
  bg: string;
}

const DISTINCT_HUES: number[] = [
  0,
  30,
  60,
  90,
  120,
  150,
  180,
  210,
  240,
  270,
  300,
  330,
];

const hashStringToInt = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getColorPairFromId = (id?: string | null): IdColorPair => {
  if (!id) {
    return {
      fg: 'var(--primary)',
      bg: 'var(--bg-cream)',
    };
  }

  const hash = hashStringToInt(id);
  const hue = DISTINCT_HUES[hash % DISTINCT_HUES.length];

  return {
    fg: `hsl(${hue} 70% 35%)`,
    bg: `hsl(${hue} 80% 94%)`,
  };
};
