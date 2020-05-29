import React from 'react';
import { STRING_FILTER_FIELDS } from '../consts';
import { formatTitle } from '../utils/format';
import { FilterProps } from './types';

const StringFiltersTable: React.FunctionComponent<FilterProps> = ({ filters, setFilterValue }) => (
  <div className="string-filters">
    {STRING_FILTER_FIELDS.map((f) => (
      <input
        key={f}
        placeholder={`${formatTitle(f)} contains...`}
        value={filters[`${f}:contains`] || ''}
        onChange={(e) => {
          setFilterValue(`${f}:contains`, e.target.value);
        }}
      />
    ))}
  </div>
);
export default StringFiltersTable;
