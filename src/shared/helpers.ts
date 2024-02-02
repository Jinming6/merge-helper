import { MERGE_OPTS_KEY } from './constants';
import type {
  CellMergerOptions,
  DataSourceItem,
  FieldSpan,
} from '../cellMerge/types';
import { isPlainObject } from 'lodash';
import { CellMerger } from '../cellMerge';

/**
 * 获取字段合并配置
 */
export function getFieldSpan(
  row: Record<string, unknown>,
  field: string,
): FieldSpan {
  const mergeOpts = row[MERGE_OPTS_KEY];
  const defaultSpanValue: FieldSpan = {
    rowspan: 1,
    colspan: 1,
  };
  if (!isPlainObject(mergeOpts)) {
    return defaultSpanValue;
  }
  const fieldSpan = (mergeOpts as Record<string, FieldSpan>)[field];
  if (!isPlainObject(fieldSpan)) {
    return defaultSpanValue;
  }
  return fieldSpan;
}

/**
 * 获取合并后的数据
 */
export function getMergedData(options: CellMergerOptions): DataSourceItem[] {
  const instance = new CellMerger(options);
  return instance.getMergedData();
}
