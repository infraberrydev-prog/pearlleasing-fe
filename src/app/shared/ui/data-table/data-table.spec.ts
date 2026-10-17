import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CellDef, DataTable, TableColumn } from './data-table';

interface Row {
  id: string;
  name: string;
  revenue: string;
}

@Component({
  imports: [DataTable, CellDef],
  template: `
    <app-data-table [columns]="columns" [rows]="rows" selectable [(selected)]="selected">
      <ng-template appCell="id" [appCellRows]="rows" let-row><a class="id">{{ row.id }}</a></ng-template>
    </app-data-table>
  `,
})
class Host {
  columns: TableColumn[] = [
    { key: 'id', header: 'Report ID' },
    { key: 'name', header: 'Report Name' },
    { key: 'revenue', header: 'Expected Revenue', align: 'end' },
  ];
  rows: Row[] = [
    { id: 'RP1', name: 'January', revenue: '₱ 100.00' },
    { id: 'RP2', name: 'February', revenue: '₱ 200.00' },
  ];
  selected = signal<readonly unknown[]>([]);
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const checkboxes = () => Array.from(el.querySelectorAll<HTMLInputElement>('input[type=checkbox]'));
  return { fixture, el, checkboxes };
}

describe('DataTable', () => {
  it('renders headers, plain cells and custom cell templates', () => {
    const { el } = setup();
    const headers = Array.from(el.querySelectorAll('th')).map((th) => th.textContent?.trim());
    expect(headers).toEqual(['', 'Report ID', 'Report Name', 'Expected Revenue']);
    expect(el.querySelectorAll('a.id')[1].textContent).toBe('RP2');
    const firstRow = el.querySelectorAll('tbody tr')[0].querySelectorAll('td');
    expect(firstRow[2].textContent?.trim()).toBe('January');
    expect(firstRow[3].classList).toContain('align-end');
  });

  it('selects single rows and reflects partial selection in the header', () => {
    const { fixture, checkboxes } = setup();
    checkboxes()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toEqual(['RP1']);
    expect(checkboxes()[0].indeterminate).toBe(true);
  });

  it('selects and clears every row from the header', () => {
    const { fixture, checkboxes } = setup();
    checkboxes()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toEqual(['RP1', 'RP2']);

    checkboxes()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toEqual([]);
  });
});
