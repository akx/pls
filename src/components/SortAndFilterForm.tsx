import React from 'react';
import NumericFiltersTable from './NumericFiltersTable';
import SortContainer, { SortContainerProps } from './SortContainer';
import StringFiltersTable from './StringFiltersTable';
import { FilterProps } from './types';

interface SortAndFilterFormProps extends FilterProps, SortContainerProps {}

const SortAndFilterForm: React.FC<SortAndFilterFormProps> = (props) => (
  <fieldset className="sort-and-filter">
    <legend>Sort & Filter</legend>
    <SortContainer {...props} />
    <div className="filters">
      <StringFiltersTable {...props} />
      <NumericFiltersTable {...props} />
    </div>
  </fieldset>
);
export default SortAndFilterForm;
