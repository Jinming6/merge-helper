# merge-helper

轻松处理单元格的合并

![效果展示](https://s2.loli.net/2023/12/27/CNDP1a3WJx9Hw6l.png)

## 特性

- [x] 跨行合并
- [x] 自定义条件合并
- [x] 生成合并后的序号
- [ ] 跨列合并

## 安装

### pnpm

```bash
$ pnpm add @jinming6/merge-helper
```

### cdn

```html
<script src="https://unpkg.com/@jinming6/merge-helper/dist/mergeHelper.min.js"></script>
```

### 快速上手

1. 处理数据源

```js
import { CellMerger } from '@jinming6/merge-helper';
const cellMerger = new CellMerger({
	dataSource: data,
	mergeFields: [
		{
			field: 'name',
			callback(curItem, nextItem) {
				return (
					curItem.name === nextItem.name && curItem.address === nextItem.address
				);
			},
		},
		'age',
		'address',
	],
	genSort: true,
	sortBy: 'name',
});
const tableData = cellMerger.getMergedData(); // 得到合并后的数据
```

2. 在el-table中传入合并后的`tableData`

```html
<el-table border :data="tableData" :span-method="mergeMethod">
	<el-table-column type="index" label="原始序号" width="100"></el-table-column>
	<el-table-column
		:prop="SORT_NO_KEY"
		label="合并序号"
		width="100"
	></el-table-column>
	<el-table-column prop="name" label="姓名"></el-table-column>
	<el-table-column prop="age" label="年龄"></el-table-column>
	<el-table-column prop="address" label="地址"></el-table-column>
</el-table>
```

3. 传入合并方法

```js
import { constants } from '@jinming6/merge-helper';
const { MERGE_OPTS_KEY, SORT_NO_KEY } = constants;

function mergeMethod({ row, column, rowIndex, columnIndex }) {
	if (columnIndex === 1) {
		return row[MERGE_OPTS_KEY].name;
	}
	if (columnIndex === 2) {
		return row[MERGE_OPTS_KEY].age;
	}
	if (columnIndex === 3) {
		return row[MERGE_OPTS_KEY].address;
	}
	return [1, 1];
}
```
