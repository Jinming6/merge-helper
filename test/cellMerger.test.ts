import { isPlainObject } from 'lodash';
import { CellMerger } from '../src/cellMerge';
import type { CellMergerOptions, DataSourceItem } from '../src/cellMerge/types';
import { MERGE_OPTS_KEY } from '../src/utils/constants';

const validMergedData = (mergedData: DataSourceItem[]): boolean => {
	const result = mergedData.every((item) => {
		const obj = isPlainObject(item) ? item[MERGE_OPTS_KEY] : null;
		const isValid =
			obj != null && Object.keys(obj as Record<string, unknown>).length === 3;
		return isValid;
	});
	return result;
};

test('计算扁平数据-指定字段合并', () => {
	const data = new Array(10).fill(0).map((_, index) => {
		return {
			id: index,
			name: index > 4 ? '张三' : '李四',
			age: index > 4 ? 18 : 20,
			address: index > 4 ? '北京' : '上海',
		};
	});
	const options: CellMergerOptions = {
		dataSource: data,
		mergeFields: ['name', 'age', 'address'],
	};
	const cellMerger = new CellMerger(options);
	const mergedData = cellMerger.getMergedData();
	const result = validMergedData(mergedData);
	expect(result).toEqual(true);
});

test('计算扁平数据-指定字段对象合并', () => {
	const data = new Array(10).fill(0).map((_, index) => {
		return {
			id: index,
			name: index > 4 ? '张三' : '李四',
			age: index > 4 ? 18 : 20,
			address: index > 4 ? '北京' : '上海',
		};
	});
	const options: CellMergerOptions = {
		dataSource: data,
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
