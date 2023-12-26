import { cloneDeep, isString, isPlainObject, isFunction } from 'lodash';
import type {
	CellMergerOptions,
	DataSourceItem,
	MergeFieldItem,
	MergeFields,
} from './types';
import { MERGE_OPTS_KEY, SORT_NO_KEY } from '../utils/constants';

export class CellMerger {
	// 数据源
	dataSource: DataSourceItem[];
	// 需要合并的字段
	mergeFields: MergeFields;
	// 是否为树结构数据
	isTreeData: boolean;
	// 是否生成序号
	genSort: boolean;
	// 以该字段为准，进行排序
	sortBy?: string;

	constructor(options: CellMergerOptions) {
		const { dataSource, mergeFields, isTreeData, genSort, sortBy } = options;
		this.dataSource = cloneDeep(dataSource);
		this.mergeFields = cloneDeep(mergeFields);
		this.isTreeData = isTreeData ?? false;
		this.genSort = genSort ?? false;
		this.sortBy = sortBy;
		if (!this.isTreeData) {
			this.mergeCells(this.dataSource);
		}
	}

	// 初始化合并配置
	initMergeOpts(item: DataSourceItem, field: string): void {
		if (!isPlainObject(item[MERGE_OPTS_KEY])) {
			item[MERGE_OPTS_KEY] = {};
		}
		if (!isPlainObject(item[MERGE_OPTS_KEY][field])) {
			item[MERGE_OPTS_KEY][field] = {
				rowspan: 1,
				colspan: 1,
			};
		}
	}

	// 判断是否为被合并了的单元格
	isMergedCell(item: DataSourceItem, field: string): boolean {
		const value = item[MERGE_OPTS_KEY][field];
		return isPlainObject(value) && value.rowspan === 0;
	}

	// 合并单元格
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

	// 根据字段来计算单元格的合并
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
			this.initMergeOpts(item, field);
			if (this.isMergedCell(item, field)) {
				continue;
			}
			if (this.genSort) {
				item[SORT_NO_KEY] = startNo;
			}
			for (let j = i + 1; j < dataSource.length; j++) {
				const nextItem = dataSource[j];
				this.initMergeOpts(nextItem, field);
				if (
					isFunction(condition)
						? condition(item, nextItem)
						: item[field] === nextItem[field]
				) {
					item[MERGE_OPTS_KEY][field].rowspan += 1;
					nextItem[MERGE_OPTS_KEY][field].rowspan = 0;
				} else {
					break;
				}
			}
			startNo += 1;
		}
	}

	// 获取合并后的数据
	getMergedData(): DataSourceItem[] {
		return this.dataSource;
	}
}
