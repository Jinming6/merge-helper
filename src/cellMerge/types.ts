import { type Mode } from '../shared/enums';

export interface MergeFieldItem {
  field: string;
  callback: (curItem: DataSourceItem, nextItem: DataSourceItem) => boolean;
}

export type MergeFields = Array<string | MergeFieldItem>;

export interface CellMergerOptions {
  dataSource: DataSourceItem[];
  mergeFields: MergeFields;
  genSort?: boolean;
  rowKey?: string;
  columns?: ColumnItem[];
  mode: Mode;
}

export type DataSourceItem = Record<string, any>;

export interface ColumnItem {
  label: string;
  prop: string;
}

export type ColumnMergeCondition = (
  curItem: DataSourceItem,
  nextItem: DataSourceItem,
  curColumn: ColumnItem,
  nextColumn: ColumnItem,
) => boolean;

export interface FieldSpan {
  rowspan: number;
  colspan: number;
}
