import {
  cloneDeep,
  isString,
  isPlainObject,
  isFunction,
  isBoolean,
  isArray,
} from 'lodash-es';
import type {
  CellMergerOptions,
  ColumnItem,
  DataSourceItem,
  MergeFieldItem,
  MergeFields,
} from './models/types';
import { MERGE_OPTS_KEY, ROW_KEY, SORT_NO_KEY } from './models/constants';
import { Mode } from './models/enums';
import {
  getFirstMergeField,
  isValueInEnum,
  validateColumns,
  validateMergeFields,
} from './models/helpers';
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
  // 合并模式
  mode: CellMergerOptions['mode'];
  // 是否重新计算合并配置
  reCalc: CellMergerOptions['reCalc'];

  constructor(options: CellMergerOptions) {
    const {
      dataSource,
      mergeFields,
      genSort,
      rowKey = ROW_KEY,
      columns = [],
      mode,
      sortBy,
      reCalc,
    } = options;
    this.mode = isValueInEnum(mode, Mode) ? mode : Mode.Row;
    this.reCalc = isBoolean(reCalc) ? reCalc : false;
    if (this.reCalc) {
      this.dataSource = this.clearDataSource(dataSource);
    } else {
      this.dataSource = cloneDeep(dataSource);
    }
    this.mergeFields = cloneDeep(mergeFields);
    this.genSort = genSort ?? false;
    this.rowKey = rowKey;
    this.columns = columns;
    if (!isArray(this.mergeFields)) {
      warn('mergeFields必须是一个数组');
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
      warn('Mode.RowCol已废弃，在未来版本将会被删除');
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
        warn('field必须是一个字符串');
        return;
      }

      dataSource.forEach((item) => {
        // 初始化"合并配置项"
        if (!isPlainObject(item[MERGE_OPTS_KEY])) {
          item[MERGE_OPTS_KEY] = {};
        }

        // 初始化"合并配置项"中的"字段默认合并值"
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
      // 处理合并字段字符串
      if (isString(fieldItem)) {
        this.mergeCellsByField(dataSource, fieldItem);
        return;
      }

      // 处理合并字段对象
      if (isPlainObject(fieldItem)) {
        const { field, callback } = fieldItem;
        if (isString(field) && isFunction(callback)) {
          this.mergeCellsByField(dataSource, field, callback);
        }
      }
    });
  }

  /**
   * 判断是否需要排序
   */
  isShouldSort(field: string): boolean {
    return isBoolean(this.genSort) && this.sortBy === field;
  }

  /**
   * 判断是否需要合并
   */
  isShouldMerge(
    preItem: DataSourceItem,
    item: DataSourceItem,
    field: string,
    condition?: MergeFieldItem['callback'],
  ): boolean {
    return isFunction(condition)
      ? condition(preItem, item)
      : preItem[field] === item[field];
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

      // 如果要求排序，则初始化排序字段
      if (this.isShouldSort(field)) {
        item[SORT_NO_KEY] = startNo;
      }

      if (preItem == null) {
        preItem = item;
        continue;
      }

      // 跳过已合并的项
      if (this.isMergedCell(item, field)) {
        continue;
      }

      // 进行合并判断
      if (this.isShouldMerge(preItem, item, field, condition)) {
        preItem[MERGE_OPTS_KEY][field].rowspan += 1;
        item[MERGE_OPTS_KEY][field].rowspan = 0;
      } else {
        preItem = item;
      }

      // 如果当前是指定的排序字段，则排序号累加
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
   * 判断是否应该合并列
   */
  isShouldMergeCol(
    preColumn: ColumnItem,
    curItem: DataSourceItem,
    curColumn: ColumnItem,
  ): boolean {
    return (
      curItem[preColumn.prop] === curItem[curColumn.prop] &&
      curItem[MERGE_OPTS_KEY][preColumn.prop].rowspan ===
        curItem[MERGE_OPTS_KEY][curColumn.prop].rowspan
    );
  }

  /**
   * 根据「列字段」进行合并计算
   */
  mergeColByField(curItem: DataSourceItem, columns: ColumnItem[]): void {
    const columnsLen = columns.length;
    let preColumn: ColumnItem | undefined;
    for (let j = 0; j < columnsLen; j++) {
      const curColumn = columns[j];
      // 跳过首列
      if (preColumn == null) {
        preColumn = curColumn;
        continue;
      }

      // 跳过“序号列”
      if (curColumn.prop === SORT_NO_KEY) {
        continue;
      }

      // 跳过“空属性列”
      if (curItem[curColumn.prop] == null) {
        continue;
      }

      // 跳过“已被合并的列”
      if (curItem[MERGE_OPTS_KEY][curColumn.prop].colspan === 0) {
        continue;
      }

      // 进行合并判断
      if (this.isShouldMergeCol(preColumn, curItem, curColumn)) {
        curItem[MERGE_OPTS_KEY][preColumn.prop].colspan += 1;
        curItem[MERGE_OPTS_KEY][curColumn.prop].colspan = 0;
      } else {
        preColumn = curColumn;
      }
    }
  }

  /**
   * 获取合并后的数据
   */
  getMergedData(): DataSourceItem[] {
    return this.dataSource;
  }

  /**
   * 清理数据源合并参数
   */
  clearDataSource(
    dataSource: CellMergerOptions['dataSource'],
  ): CellMergerOptions['dataSource'] {
    const newDataSource = cloneDeep(dataSource);
    newDataSource.forEach((item) => {
      delete item[MERGE_OPTS_KEY];
      delete item[SORT_NO_KEY];
    });
    return newDataSource;
  }
}
