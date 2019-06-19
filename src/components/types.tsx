export interface FilterProps {
  filters: { [key: string]: string };
  setFilterValue: (key: string, value: string) => void;
}

export interface NumberLimits {
  [key: string]: [number, number];
}
