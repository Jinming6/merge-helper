# merge-helper

轻松处理单元格的合并

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
