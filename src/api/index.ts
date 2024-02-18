import { cloneDeep, isArray, isPlainObject, isString } from 'lodash';
import { CellMerger } from '../cellMerge';
import {
  type FieldSpan,
  type CellMergerOptions,
  type DataSourceItem,
} from '../cellMerge/types';
import { type SplitIntoFragmentsOpts } from '../shared/types';
import { getFirstMergeField } from '../shared/helpers';
import { MERGE_OPTS_KEY, SORT_NO_KEY } from '../shared/constants';

/**
 * 获取合并后的数据
 */
export function getMergedData(options: CellMergerOptions): DataSourceItem[] {
  const instance = new CellMerger(options);
  return instance.getMergedData();
}

/**
 * 将数据拆分为片段
 */
export function splitIntoFragments(
  options: SplitIntoFragmentsOpts,
): DataSourceItem[][] {
  const { dataSource, pageSize, mergeFields, mode, genSort, sortBy, columns } =
    options;
  const copyData = cloneDeep(dataSource);

  // 按照pageSize拆分数据
  const len = Math.ceil(copyData.length / pageSize);
  let arr: DataSourceItem[][] = [];
  for (let i = 0; i < len; i++) {
    const startIdx = i * pageSize;
    const endIdx = (i + 1) * pageSize;
    const fragment = copyData.slice(startIdx, endIdx);
    arr.push(fragment);
  }

  // 合并数据
  let isMerged = false;
  if (isArray(mergeFields) && mergeFields.length > 0) {
    arr = arr.map((item) => {
      const options = {
        mode,
        dataSource: item,
        mergeFields,
        columns,
      };
      const cellMerge = new CellMerger(options);
      return cellMerge.getMergedData();
    });
    isMerged = true;
  }

  // 生成排序号
  if (genSort === true) {
    const sortKey = isString(sortBy) ? sortBy : getFirstMergeField(mergeFields);
    if (!isString(sortKey)) {
      return arr;
    }
    let startIndex = 1;
    arr.forEach((childArr) => {
      childArr.forEach((item) => {
        if (isMerged) {
          if (getFieldSpan(item, sortKey).rowspan > 0) {
            item[SORT_NO_KEY] = startIndex;
            ++startIndex;
          }
        } else {
          item[SORT_NO_KEY] = startIndex;
          startIndex++;
        }
      });
    });
  }
  return arr;
}

/**
 * 获取排序号
 */
export function getSortNo(row: Record<string, unknown>): number {
  return row[SORT_NO_KEY] as number;
}

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
