import {
  cloneDeep,
  isString,
  isPlainObject,
  isFunction,
  isBoolean,
  isArray,
} from 'lodash';
import type {
  CellMergerOptions,
  ColumnItem,
  DataSourceItem,
  MergeFieldItem,
  MergeFields,
} from './types';
import {
  FIRST_ID,
  MERGE_OPTS_KEY,
  ROW_KEY,
  SORT_NO_KEY,
} from '../shared/constants';
import { Mode } from '../shared/enums';
import {
  getFirstMergeField,
  isValueInEnum,
  validateColumns,
  validateMergeFields,
} from '../shared/helpers';
import { warn } from '../shared/warning';

export class CellMerger {
  // 数据源
  dataSource: CellMergerOptions['dataSource'];
  // 需要合并的字段
  mergeFields: CellMergerOptions['mergeFields'];
  // 是否生成序号
  genSort: CellMergerOptions['genSort'];
  // 按照指定字段的维度进行排序
  sortBy: CellMergerOptions['sortBy'];
  // 唯一key
  rowKey: CellMergerOptions['rowKey'];
  // 表格列
  columns: CellMergerOptions['columns'];
  // 模式
  mode: CellMergerOptions['mode'];

  constructor(options: CellMergerOptions) {
    const {
      dataSource,
      mergeFields,
      genSort,
      rowKey = ROW_KEY,
      columns = [],
      mode,
      sortBy,
    } = options;
    this.mode = isValueInEnum(mode, Mode) ? mode : Mode.Row;
    this.dataSource = cloneDeep(dataSource);
    this.mergeFields = cloneDeep(mergeFields);
    this.genSort = genSort ?? false;
    this.rowKey = rowKey;
    this.columns = columns;
    if (!isArray(this.mergeFields)) {
      warn('mergeFields should be an array');
      return;
    }
    this.sortBy = isString(sortBy)
      ? sortBy
      : getFirstMergeField(this.mergeFields);
    this.initMergeOpts(this.dataSource, this.mergeFields);
    if (this.mode === Mode.Row) {
      this.mergeCells(this.dataSource);
    } else if (this.mode === Mode.Col) {
      const validCol = validateColumns(columns);
      if (!validCol) {
        return;
      }
      const validMergeFields = validateMergeFields(
        this.mergeFields,
        this.columns,
        this.mode,
      );
      if (!validMergeFields) {
        return;
      }
      this.mergeCols(this.dataSource, this.columns);
    } else if (this.mode === Mode.RowCol) {
      this.mergeCells(this.dataSource);
      const validCol = validateColumns(columns);
      if (!validCol) {
        return;
      }
      const validMergeFields = validateMergeFields(
        this.mergeFields,
        this.columns,
        this.mode,
      );
      if (!validMergeFields) {
        return;
      }
      this.mergeCols(this.dataSource, this.columns);
    }
  }

  /**
   * 初始化合并配置
   */
  initMergeOpts(dataSource: DataSourceItem[], mergeFields: MergeFields): void {
    mergeFields.forEach((fieldItem) => {
      const field = isString(fieldItem) ? fieldItem : fieldItem.field;
      if (!isString(field)) {
        warn('field should be a string');
        return;
      }
      dataSource.forEach((item) => {
        if (!isPlainObject(item[MERGE_OPTS_KEY])) {
          item[MERGE_OPTS_KEY] = {};
        }
        if (!isPlainObject(item[MERGE_OPTS_KEY][field])) {
          item[MERGE_OPTS_KEY][field] = {
            rowspan: 1,
            colspan: 1,
          };
        }
      });
    });
  }

  /**
   * 判断是否为被合并了的单元格
   */
  isMergedCell(item: DataSourceItem, field: string): boolean {
    const value = item[MERGE_OPTS_KEY][field];
    return isPlainObject(value) && value.rowspan === 0;
  }

  /**
   * 合并单元格
   */
  mergeCells(dataSource: DataSourceItem[]): void {
    this.mergeFields.forEach((fieldItem) => {
      if (isString(fieldItem)) {
        this.mergeCellsByField(dataSource, fieldItem);
      } else if (isPlainObject(fieldItem)) {
        const { field, callback } = fieldItem;
        if (isString(field) && isFunction(callback)) {
          this.mergeCellsByField(dataSource, field, callback);
        }
      }
    });
  }

  /**
   * 根据字段来计算单元格的合并
   */
  mergeCellsByField(
    dataSource: DataSourceItem[],
    field: string,
    condition?: MergeFieldItem['callback'],
  ): void {
    if (!isString(field)) {
      return;
    }
    let preItem: DataSourceItem | undefined;
    let startNo = 1;
    for (let i = 0; i < dataSource.length; i++) {
      const item = dataSource[i];
      if (isBoolean(this.genSort) && this.sortBy === field) {
        item[SORT_NO_KEY] = startNo;
      }
      if (preItem == null) {
        preItem = item;
        continue;
      }
      if (this.isMergedCell(item, field)) {
        continue;
      }
      if (
        isFunction(condition)
          ? condition(preItem, item)
          : preItem[field] === item[field]
      ) {
        preItem[MERGE_OPTS_KEY][field].rowspan += 1;
        item[MERGE_OPTS_KEY][field].rowspan = 0;
        item[FIRST_ID] = isString(this.rowKey) ? preItem[this.rowKey] : null;
      } else {
        preItem = item;
      }
      if (this.sortBy === field) {
        startNo += 1;
      }
    }
  }

  /**
   * 合并列
   */
  mergeCols(dataSource: DataSourceItem[], columns: ColumnItem[]): void {
    if (columns.length < 1 || dataSource.length < 1) return;
    const dataSourceLen = dataSource.length;
    // 遍历数据源
    for (let i = 0; i < dataSourceLen; i++) {
      const curItem = dataSource[i];
      this.mergeColByField(curItem, columns);
    }
  }

  /**
   * 根据「列字段」进行合并计算
   */
  mergeColByField(curItem: DataSourceItem, columns: ColumnItem[]): void {
    const columnsLen = columns.length;
    let preColumn: ColumnItem | undefined;
    for (let j = 0; j < columnsLen; j++) {
      // 当前列
      const curColumn = columns[j];
      if (preColumn == null) {
        preColumn = curColumn;
        continue;
      }
      if (curColumn.prop === SORT_NO_KEY) {
        continue;
      }
      if (curItem[curColumn.prop] == null) {
        continue;
      }
      // 如果当前列的colspan为0，则跳过
      if (curItem[MERGE_OPTS_KEY][curColumn.prop].colspan === 0) {
        continue;
      }
      if (
        curItem[preColumn.prop] === curItem[curColumn.prop] &&
        curItem[MERGE_OPTS_KEY][preColumn.prop].rowspan ===
          curItem[MERGE_OPTS_KEY][curColumn.prop].rowspan
      ) {
        curItem[MERGE_OPTS_KEY][preColumn.prop].colspan += 1;
        curItem[MERGE_OPTS_KEY][curColumn.prop].colspan = 0;
      } else {
        break;
      }
    }
  }

  /**
   * 获取合并后的数据
   */
  getMergedData(): DataSourceItem[] {
    return this.dataSource;
  }
}
