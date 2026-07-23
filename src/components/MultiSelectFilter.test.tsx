import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {MultiSelectFilter} from './MultiSelectFilter';

describe('MultiSelectFilter', () => {
  it('shows checkbox options and adds a selected value', () => {
    const onChange = vi.fn();
    render(<MultiSelectFilter label="Localities" allLabel="All localities" options={[
      {value: 'stockholm', label: 'Stockholm'},
      {value: 'uppsala', label: 'Uppsala'},
    ]} values={[]} onChange={onChange}/>);

    fireEvent.click(screen.getByRole('button', {name: /localities/i}));
    fireEvent.click(screen.getByRole('checkbox', {name: 'Stockholm'}));
    expect(onChange).toHaveBeenCalledWith(['stockholm']);
  });
});
