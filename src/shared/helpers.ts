import type { CellMergerOptions } from '../cellMerge/types';
import { isArray, isPlainObject, isString } from 'lodash';
import { warn } from './warning';
import { Mode } from './enums';

/**
 * 获取第一个合并的列字段
 */
export function getFirstMergeField(
  mergeFields: CellMergerOptions['mergeFields'],
): string | null {
  if (!isArray(mergeFields)) {
    warn('mergeFields should be an array');
    return null;
  }
  if (mergeFields.length < 1) {
    warn('mergeFields should not be empty');
    return null;
  }
  const elem = mergeFields[0];
  if (isString(elem)) {
    return elem;
  } else if (isPlainObject(elem)) {
    return elem.field;
  }
  return null;
}

/**
 * 判断是否属于枚举值
 */
export function isValueInEnum<T>(
  value: T,
  enumObj: Record<string, T>,
): boolean {
  return Object.values(enumObj).includes(value);
}

/**
 * 校验列数据
 */
export function validateColumns(
  columns: CellMergerOptions['columns'],
): boolean {
  if (!isArray(columns)) {
    warn('columns should be an array');
    return false;
  }
  if (columns.length < 1) {
    warn('columns should not be empty');
    return false;
  }
  const flag = columns.every(
    (item) => isPlainObject(item) && isString(item.prop),
  );
  if (!flag) {
    warn('columns should be an array of plain objects with prop');
    return false;
  }
  return true;
}

/**
 * 校验列合并字段
 */
export function validateMergeFields(
  mergeFields: CellMergerOptions['mergeFields'],
  columns: CellMergerOptions['columns'],
  mode: CellMergerOptions['mode'],
): boolean {
  if (!isArray(mergeFields)) {
    warn('mergeFields should be an array');
    return false;
  }
  if ([Mode.Col, Mode.RowCol].includes(mode)) {
    const validCols = validateColumns(columns);
    if (!validCols) {
      return false;
    }
    if (mergeFields.length !== columns?.length ?? 0) {
      warn('mergeFields.length should be equal to columns.length');
      return false;
    }
  }
  return true;
}
