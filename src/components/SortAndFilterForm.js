/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { RESORT_FIELDS } from '../consts';
import { formatTitle } from '../utils/format';

export default class SortAndFilterForm extends React.Component {
  render() {
    const lteFields = [];
    const gteFields = [];
    RESORT_FIELDS.forEach((f) => {
      gteFields.push((
        <td key={f}>
          <input
            type="number"
            value={this.props.filters[`${f}:gte`] || ''}
            size={3}
            onChange={(e) => {
              this.props.setFilterValue(`${f}:gte`, e.target.value);
            }}
          />
        </td>
      ));
      lteFields.push((
        <td key={f}>
          <input
            type="number"
            value={this.props.filters[`${f}:lte`] || ''}
            size={3}
            onChange={(e) => {
              this.props.setFilterValue(`${f}:lte`, e.target.value);
            }}
          />
        </td>
      ));
    });
    return (
      <fieldset className="sort-and-filter">
        <legend>Sort & Filter</legend>
        <div className="sort">
          <label>
            <span>Sort</span>
            <select
              value={this.props.sort}
              onChange={(e) => {
                this.props.setValue('sort', e.target.value);
              }}
            >
              <option value="original">Original sort</option>
              {RESORT_FIELDS.map(f => <option key={f} value={f}>{formatTitle(f)}</option>)}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={this.props.reverse}
              onChange={(e) => {
                this.props.setValue('reverse', e.target.checked);
              }}
            />
            <span>Reverse</span>
          </label>
        </div>
        <div className="filters">
          <table>
            <thead>
              <tr>
                <th />
                {RESORT_FIELDS.map(f => <th key={f}>{formatTitle(f)}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>≥</td>
                {gteFields}
              </tr>
              <tr>
                <td>≤</td>
                {lteFields}
              </tr>
            </tbody>
          </table>

        </div>
      </fieldset>
    );
  }
}
