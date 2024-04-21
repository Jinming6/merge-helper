import type { CellMergerOptions } from '../cellMerge/types';
import { isArray, isPlainObject, isString } from 'lodash-es';
import { warn } from './warning';
import { Mode } from './enums';

/**
 * 获取第一个合并的列字段
 */
export function getFirstMergeField(
  mergeFields: CellMergerOptions['mergeFields'],
): string | null {
  if (!isArray(mergeFields)) {
    warn('mergeFields必须是一个数组');
    return null;
  }
  if (mergeFields.length < 1) {
    warn('mergeFields不能为空');
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
    warn('columns必须是一个数组');
    return false;
  }
  if (columns.length < 1) {
    warn('columns不能为空');
    return false;
  }
  const flag = columns.every(
    (item) => isPlainObject(item) && isString(item.prop),
  );
  if (!flag) {
    warn('columns必须是一个数组对象，且对象中必须包含prop属性');
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
    warn('mergeFields必须是一个数组');
    return false;
  }
  if ([Mode.Col, Mode.RowCol].includes(mode)) {
    const validCols = validateColumns(columns);
    if (!validCols) {
      return false;
    }
    if (mergeFields.length !== columns?.length ?? 0) {
      warn('mergeFields与columns的数组长度不一致');
      return false;
    }
  }
  return true;
}
