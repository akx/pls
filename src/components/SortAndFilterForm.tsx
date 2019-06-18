/* eslint-disable react/prefer-stateless-function,react/no-multi-comp */
import React from 'react';
import NumericFiltersTable from './NumericFiltersTable';
import SortContainer from './SortContainer';
import StringFiltersTable from './StringFiltersTable';

export default class SortAndFilterForm extends React.Component {
  render() {
    return (
      <fieldset className="sort-and-filter">
        <legend>Sort & Filter</legend>
        <SortContainer sort={this.props.sort} setValue={this.props.setValue} reverse={this.props.reverse} />
        <div className="filters">
          <StringFiltersTable setFilterValue={this.props.setFilterValue} filters={this.props.filters} />
          <NumericFiltersTable setFilterValue={this.props.setFilterValue} filters={this.props.filters} />
        </div>
      </fieldset>
    );
  }
}
