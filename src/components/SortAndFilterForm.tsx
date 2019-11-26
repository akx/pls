import React from 'react';
import NumericFiltersTable from './NumericFiltersTable';
import SortContainer, { SortContainerProps } from './SortContainer';
import StringFiltersTable from './StringFiltersTable';
import { FilterProps } from './types';

interface SortAndFilterFormProps extends FilterProps, SortContainerProps {}

const SortAndFilterForm: React.FC<SortAndFilterFormProps> = ({ filters, reverse, setFilterValue, setSort, sort }) => (
  <fieldset className="sort-and-filter">
    <legend>Sort & Filter</legend>
    <SortContainer sort={sort} setSort={setSort} reverse={reverse} />
    <div className="filters">
      <StringFiltersTable setFilterValue={setFilterValue} filters={filters} />
      <NumericFiltersTable setFilterValue={setFilterValue} filters={filters} />
    </div>
  </fieldset>
);
export default SortAndFilterForm;
