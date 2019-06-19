import React from 'react';
import NumericFiltersTable from './NumericFiltersTable';
import SortContainer, { SortContainerProps } from './SortContainer';
import StringFiltersTable from './StringFiltersTable';
import { FilterProps } from './types';

interface SortAndFilterFormProps extends FilterProps, SortContainerProps {}

export default class SortAndFilterForm extends React.Component<SortAndFilterFormProps> {
  render() {
    return (
      <fieldset className="sort-and-filter">
        <legend>Sort & Filter</legend>
        <SortContainer sort={this.props.sort} setSort={this.props.setSort} reverse={this.props.reverse} />
        <div className="filters">
          <StringFiltersTable setFilterValue={this.props.setFilterValue} filters={this.props.filters} />
          <NumericFiltersTable setFilterValue={this.props.setFilterValue} filters={this.props.filters} />
        </div>
      </fieldset>
    );
  }
}
