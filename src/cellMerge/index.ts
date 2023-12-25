import { cloneDeep, isString, isPlainObject } from 'lodash';
import type { CellMergerOptions, DataSourceItem, MergeFields } from './types';
import { MERGE_OPTS_KEY } from '../utils/constants';

export class CellMerger {
	// 数据源
	dataSource: DataSourceItem[];
	// 需要合并的字段
	mergeFields: MergeFields;
	// 是否为树结构数据
	isTreeData: boolean;

	constructor(options: CellMergerOptions) {
		const { dataSource, mergeFields, isTreeData } = options;
		this.dataSource = cloneDeep(dataSource);
		this.mergeFields = cloneDeep(mergeFields);
		this.isTreeData = (isTreeData ?? false) || false;
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
		this.mergeFields.forEach((field) => {
			if (isString(field)) {
				for (let i = 0; i < dataSource.length; i++) {
					const item = dataSource[i];
					this.initMergeOpts(item, field);
					if (this.isMergedCell(item, field)) {
						continue;
					}
					for (let j = i + 1; j < dataSource.length; j++) {
						const nextItem = dataSource[j];
						this.initMergeOpts(nextItem, field);

						if (item[field] === nextItem[field]) {
							item[MERGE_OPTS_KEY][field].rowspan += 1;
							nextItem[MERGE_OPTS_KEY][field].rowspan = 0;
						} else {
							break;
						}
					}
				}
			}
		});
	}

	// 获取合并后的数据
	getMergedData(): DataSourceItem[] {
		return this.dataSource;
	}
}
