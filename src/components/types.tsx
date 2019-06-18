export interface FilterProps {
  filters: { [key: string]: string };
  setFilterValue: (key: string, value: string) => void;
}
