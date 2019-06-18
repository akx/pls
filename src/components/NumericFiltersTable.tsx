import React from 'react';
import { NUMERIC_FILTER_FIELDS } from '../consts';
import { formatTitle } from '../utils/format';
import { FilterProps } from './types';

export default class NumericFiltersTable extends React.Component<FilterProps> {
  public render() {
    const lteFields: React.ReactChild[] = [];
    const gteFields: React.ReactChild[] = [];
    NUMERIC_FILTER_FIELDS.forEach(f => {
      gteFields.push(
        <td key={f}>
          <input
            type="number"
            value={this.props.filters[`${f}:gte`] || ''}
            size={3}
            onChange={e => {
              this.props.setFilterValue(`${f}:gte`, e.target.value);
            }}
          />
        </td>,
      );
      lteFields.push(
        <td key={f}>
          <input
            type="number"
            value={this.props.filters[`${f}:lte`] || ''}
            size={3}
            onChange={e => {
              this.props.setFilterValue(`${f}:lte`, e.target.value);
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
            {NUMERIC_FILTER_FIELDS.map(f => (
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
  }
}
