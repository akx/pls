import React from 'react';
import { SORT_FIELDS } from '../consts';
import { formatTitle } from '../utils/format';

export default function SortContainer({ sort, setValue, reverse }) {
  return (
    <div className="sort">
      <label>
        <span>Sort: &nbsp;</span>
        <select
          value={sort}
          onChange={(e) => {
            setValue('sort', e.target.value);
          }}
        >
          <option value="original">Original sort</option>
          {SORT_FIELDS.map(f => <option key={f} value={f}>{formatTitle(f)}</option>)}
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={reverse}
          onChange={(e) => {
            setValue('reverse', e.target.checked);
          }}
        />
        <span>Reverse</span>
      </label>
    </div>
  );
}
