import React from 'react';
import { SORT_FIELDS } from '../consts';
import { formatTitle } from '../utils/format';

export interface SortContainerProps {
  sort: string;
  setSort: (key: string, reverse: boolean) => void;
  setShuffleSeed: (n: number) => void;
  reverse: boolean;
}

const SortContainer: React.FunctionComponent<SortContainerProps> = ({ sort, setSort, setShuffleSeed, reverse }) => (
  <div className="sort">
    <label>
      <span>Sort: &nbsp;</span>
      <select value={sort} onChange={(e) => setSort(e.target.value, reverse)}>
        <option value="original">Original sort</option>
        {SORT_FIELDS.map((f) => (
          <option key={f} value={f}>
            {formatTitle(f)}
          </option>
        ))}
      </select>
    </label>
    <label>
      <input type="checkbox" checked={reverse} onChange={(e) => setSort(sort, e.target.checked)} />
      <span>Reverse</span>
    </label>{' '}
    <button onClick={() => setShuffleSeed(Math.random() * 133713371337)}>Shuffle</button>
  </div>
);
export default SortContainer;
