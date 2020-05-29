import React from 'react';
import { NUMERIC_FILTER_FIELDS } from '../consts';
import { formatTitle } from '../utils/format';
import { FilterProps } from './types';

const NumericFiltersTable: React.FC<FilterProps> = ({ filters, setFilterValue }) => {
  const lteFields: React.ReactChild[] = [];
  const gteFields: React.ReactChild[] = [];
  NUMERIC_FILTER_FIELDS.forEach((f) => {
    gteFields.push(
      <td key={f}>
        <input
          type="number"
          value={filters[`${f}:gte`] || ''}
          size={3}
          onChange={(e) => {
            setFilterValue(`${f}:gte`, e.target.value);
          }}
        />
      </td>,
    );
    lteFields.push(
      <td key={f}>
        <input
          type="number"
          value={filters[`${f}:lte`] || ''}
          size={3}
          onChange={(e) => {
            setFilterValue(`${f}:lte`, e.target.value);
          }}
        />
      </td>,
    );
  });
  return (
    <table className="numeric-filters">
      <thead>
        <tr>
          <th />
          {NUMERIC_FILTER_FIELDS.map((f) => (
            <th key={f}>{formatTitle(f)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>≥</th>
          {gteFields}
        </tr>
        <tr>
          <th>≤</th>
          {lteFields}
        </tr>
      </tbody>
    </table>
  );
};
export default NumericFiltersTable;
