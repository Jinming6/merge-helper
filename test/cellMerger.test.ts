import { CellMerger } from '../src/cellMerge';
import { CellMergerOptions } from '../src/cellMerge/types';
import { MERGE_OPTS_KEY } from '../src/utils/constants';

test('计算扁平数据', () => {
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
	const result = mergedData.every((item) => {
		const obj = typeof item === 'object' ? item[MERGE_OPTS_KEY] : null;
		const isValid = obj != null && Object.keys(obj).length === 3;
		return isValid;
	});
	expect(result).toEqual(true);
});
