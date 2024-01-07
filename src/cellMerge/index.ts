import { cloneDeep, isString, isPlainObject, isFunction } from 'lodash';
import type {
	CellMergerOptions,
	ColumnItem,
	DataSourceItem,
	MergeFieldItem,
	MergeFields,
} from './types';
import {
	FIRST_ID,
	IS_FIRST,
	MERGE_OPTS_KEY,
	ROW_KEY,
	SORT_NO_KEY,
} from '../shared/constants';
import { Mode } from '../shared/enums';

export class CellMerger {
	// 数据源
	dataSource: DataSourceItem[];
	// 需要合并的字段
	mergeFields: MergeFields;
	// 是否生成序号
	genSort: boolean;
	// 唯一key
	rowKey: string;
	// 表格列
	columns: ColumnItem[];
	// 模式
	mode: Mode = Mode.Row;

	constructor(options: CellMergerOptions) {
		const {
			dataSource,
			mergeFields,
			genSort,
			rowKey = ROW_KEY,
			columns = [],
			mode,
		} = options;
		this.mode = mode;
		this.dataSource = cloneDeep(dataSource);
		this.mergeFields = cloneDeep(mergeFields);
		this.genSort = genSort ?? false;
		this.rowKey = rowKey;
		this.columns = columns;
		this.initMergeOpts(this.dataSource, this.mergeFields);
		if (this.mode === Mode.Row || this.mode === Mode.RowCol) {
			this.mergeCells(this.dataSource);
		}
		if (this.mode === Mode.Col || this.mode === Mode.RowCol) {
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
				throw new Error('field 必须是一个字符串');
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
		let startNo = 1;
		for (let i = 0; i < dataSource.length; i++) {
			const item = dataSource[i];
			if (this.isMergedCell(item, field)) {
				continue;
			}
			if (this.genSort) {
				item[SORT_NO_KEY] = startNo;
			}
			for (let j = i + 1; j < dataSource.length; j++) {
				const nextItem = dataSource[j];
				if (
					isFunction(condition)
						? condition(item, nextItem)
						: item[field] === nextItem[field]
				) {
					item[MERGE_OPTS_KEY][field].rowspan += 1;
					nextItem[MERGE_OPTS_KEY][field].rowspan = 0;
					item[IS_FIRST] = true;
					nextItem[IS_FIRST] = false;
					nextItem[FIRST_ID] = item[this.rowKey];
				} else {
					break;
				}
			}
			startNo += 1;
		}
	}

	/**
	 * 合并列
	 */
	mergeCols(dataSource: DataSourceItem[], columns: ColumnItem[]): void {
		if (columns.length < 1 || dataSource.length < 1) return;
		const dataSourceLen = dataSource.length;
		const columnsLen = columns.length;
		// 遍历数据源
		for (let i = 0; i < dataSourceLen; i++) {
			const curItem = dataSource[i];
			for (let j = 0; j < columnsLen; j++) {
				// 当前列
				const curColumn = columns[j];
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
				for (let k = j + 1; k < columnsLen; k++) {
					// 下一列
					const nextColumn = columns[k];
					if (nextColumn.prop === SORT_NO_KEY) {
						break;
					}
					// 如果是空值，则跳过
					if (curItem[nextColumn.prop] == null) {
						break;
					}
					// 否则，就累加colspan
					if (
						curItem[curColumn.prop] === curItem[nextColumn.prop] &&
						curItem[MERGE_OPTS_KEY][curColumn.prop].rowspan ===
							curItem[MERGE_OPTS_KEY][nextColumn.prop].rowspan
					) {
						curItem[MERGE_OPTS_KEY][curColumn.prop].colspan += 1;
						curItem[MERGE_OPTS_KEY][nextColumn.prop].colspan = 0;
					} else {
						break;
					}
				}
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
