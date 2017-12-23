/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { STRING_FILTER_FIELDS } from '../consts';
import { formatTitle } from '../utils/format';

export default class StringFiltersTable extends React.Component {
  render() {
    return (
      <div className="string-filters">
        {STRING_FILTER_FIELDS.map(f => (
          <input
            key={f}
            placeholder={`${formatTitle(f)} contains...`}
            value={this.props.filters[`${f}:contains`] || ''}
            onChange={(e) => {
              this.props.setFilterValue(`${f}:contains`, e.target.value);
            }}
          />
        ))}
      </div>
    );
  }
}
