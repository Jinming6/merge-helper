import { isNumber, isPlainObject, isString } from 'lodash';
import { CellMerger } from '../src/cellMerge';
import type { CellMergerOptions, DataSourceItem } from '../src/cellMerge/types';
import { MERGE_OPTS_KEY, SORT_NO_KEY } from '../src/shared/constants';
import data from '../data/data.json';
import { Mode } from '../src';

const validMergedData = (mergedData: DataSourceItem[]): boolean => {
	const result = mergedData.every((item) => {
		const obj = isPlainObject(item) ? item[MERGE_OPTS_KEY] : null;
		const isValid =
			obj != null && Object.keys(obj as Record<string, unknown>).length === 3;
		return isValid;
	});
	return result;
};

const validMergedDataSort = (
	mergedData: DataSourceItem[],
	sortBy?: string,
): boolean => {
	if (!isString(sortBy)) {
		return false;
	}
	const result = mergedData
		.filter((item) => item[MERGE_OPTS_KEY][sortBy].rowspan !== 0)
		.every((item) => isNumber(item[SORT_NO_KEY]));
	return result;
};

test('计算扁平数据-指定字段合并', () => {
	const options: CellMergerOptions = {
		mode: Mode.Row,
		dataSource: data.dataSource,
		mergeFields: ['name', 'age', 'address'],
	};
	const cellMerger = new CellMerger(options);
	const mergedData = cellMerger.getMergedData();
	const result = validMergedData(mergedData);
	expect(result).toEqual(true);
});

test('计算扁平数据-指定字段对象合并', () => {
	const options: CellMergerOptions = {
		mode: Mode.Row,
		dataSource: data.dataSource,
		mergeFields: [
			{
				field: 'name',
				callback: (curItem, nextItem) => {
					return curItem.name === nextItem.name;
				},
			},
			'age',
			'address',
		],
	};
	const cellMerger = new CellMerger(options);
	const mergedData = cellMerger.getMergedData();
	const result = validMergedData(mergedData);
	expect(result).toEqual(true);
});

test('计算扁平数据-自动生成序号', () => {
	const options: CellMergerOptions = {
		mode: Mode.Row,
		dataSource: data.dataSource,
		mergeFields: ['name', 'age', 'address'],
		genSort: true,
	};
	const cellMerger = new CellMerger(options);
	const mergedData = cellMerger.getMergedData();
	const result = validMergedDataSort(mergedData, 'name');
	expect(result).toEqual(true);
});

test('计算扁平数据-列合并', () => {
	const options: CellMergerOptions = {
		mode: Mode.Col,
		dataSource: data.dataSource,
		mergeFields: data.columns.map((item) => {
			if (item.prop === 'province') {
				return {
					field: 'province',
					callback(curItem, nextItem) {
						return (
							curItem.name === nextItem.name &&
							curItem.province === nextItem.province
						);
					},
				};
			}
			return item.prop;
		}),
		genSort: true,
		columns: data.columns,
	};
	const cellMerger = new CellMerger(options);
	const mergedData = cellMerger.getMergedData();

	const arr: boolean[] = [];
	mergedData.forEach((item, index) => {
		let flag = false;
		if (index < 3) {
			flag =
				item[MERGE_OPTS_KEY].name.rowspan === 1 &&
				item[MERGE_OPTS_KEY].name.colspan === 1;
		} else {
			if (index === 3) {
				flag =
					item[MERGE_OPTS_KEY].name.rowspan === 1 &&
					item[MERGE_OPTS_KEY].name.colspan === 2;
			} else {
				flag =
					item[MERGE_OPTS_KEY].name.rowspan === 1 &&
					item[MERGE_OPTS_KEY].name.colspan === 3;
			}
		}

		arr.push(flag);
	});

	const result = !arr.includes(false);

	expect(result).toEqual(true);
});

test('计算扁平数据-行列合并', () => {
	const options: CellMergerOptions = {
		mode: Mode.RowCol,
		dataSource: data.dataSource,
		mergeFields: data.columns.map((item) => {
			if (item.prop === 'province') {
				return {
					field: 'province',
					callback(curItem, nextItem) {
						return (
							curItem.name === nextItem.name &&
							curItem.province === nextItem.province
						);
					},
				};
			}
			return item.prop;
		}),
		genSort: true,
		columns: data.columns,
	};
	const cellMerger = new CellMerger(options);
	const mergedData = cellMerger.getMergedData();

	const arr: boolean[] = [];
	mergedData.forEach((item, index) => {
		let flag = false;
		if (index < 3) {
			if (index === 0) {
				flag =
					item[MERGE_OPTS_KEY].name.rowspan === 3 &&
					item[MERGE_OPTS_KEY].name.colspan === 1;
			} else {
				flag =
					item[MERGE_OPTS_KEY].name.rowspan === 0 &&
					item[MERGE_OPTS_KEY].name.colspan === 1;
			}
		} else {
			if (index === 3) {
				flag =
					item[MERGE_OPTS_KEY].name.rowspan === 3 &&
					item[MERGE_OPTS_KEY].name.colspan === 2;
			} else {
				flag =
					item[MERGE_OPTS_KEY].name.rowspan === 0 &&
					item[MERGE_OPTS_KEY].name.colspan === index - 2;
			}
		}

		arr.push(flag);
	});

	const result = !arr.includes(false);

	expect(result).toEqual(true);
});
