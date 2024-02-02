import { MERGE_OPTS_KEY } from './constants';
import type { FieldSpan } from '../cellMerge/types';
import { isPlainObject } from 'lodash';

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
