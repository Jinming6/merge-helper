# merge-helper

轻松处理单元格的合并

![截屏2024-01-07 23.44.15.png](https://s2.loli.net/2024/01/07/rqlRbZgUt6TD3xk.png)

[更多示例](./example/el-table.html)

## 🎨 特性

- [x] 只合并`行`
- [x] 自定义条件进行`行合并`
- [x] 生成`行合并`后的序号
- [x] 只合并`列`
- [x] 合并`行`和`列`

## ⚙️ 安装

🔔 提示： 使用前，请安装`lodash`。

### pnpm

```bash
$ pnpm add @jinming6/merge-helper
```

### yarn

```bash
$ yarn add @jinming6/merge-helper
```

### npm

```bash
$ npm add @jinming6/merge-helper
```

### CDN

```html
<script src="https://unpkg.com/@jinming6/merge-helper/dist/mergeHelper.min.js"></script>
```

### 🏄 快速上手

#### 🌰 合并「 行 」

> 1. 处理数据源

```js
import { CellMerger, Mode } from '@jinming6/merge-helper';

async function getTableData() {
	const { dataSource } = await fetch('../data/data.json').then((res) =>
		res.json(),
	);
	const cellMerger = new CellMerger({
		mode: Mode.Row,
		dataSource,
		mergeFields: this.columns.map((item) => {
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
	});
	this.tableData = cellMerger.getMergedData();
}
```

> 2. 在el-table中传入合并后的`tableData`

```html
<el-table
	border
	:data="tableData"
	:span-method="mergeMethod"
	header-cell-class-name="tableHeader"
>
	<el-table-column
		:prop="SORT_NO_KEY"
		label="序号"
		width="100"
		:align="align"
	></el-table-column>
	<el-table-column
		v-for="columnItem in columns"
		:key="columnItem.prop"
		:prop="columnItem.prop"
		:label="columnItem.label"
		:align="align"
	></el-table-column>
</el-table>
```

> 3. 传入合并方法

```js
import { constants } from '@jinming6/merge-helper';
const { MERGE_OPTS_KEY, SORT_NO_KEY } = constants;

/**
 * 提示：
 * 根据合并后的值来处理
 * row[MERGE_OPTS_KEY]中就是计算后得到的值
 */
function mergeMethod({ row, column, rowIndex, columnIndex }) {
	if (columnIndex === 0) {
		return [row[MERGE_OPTS_KEY].name.rowspan, 1];
	}
	if (columnIndex === 1) {
		return row[MERGE_OPTS_KEY].name;
	}
	if (columnIndex === 2) {
		return row[MERGE_OPTS_KEY].age;
	}
	if (columnIndex === 3) {
		return row[MERGE_OPTS_KEY].province;
	}
	if (columnIndex === 4) {
		return row[MERGE_OPTS_KEY].city;
	}
	return [1, 1];
}
```

#### 🌰 合并「 列 」

> 1. 处理数据源

```js
import { CellMerger, Mode } from '@jinming6/merge-helper';

async function getTableData() {
	const { dataSource } = await fetch('../data/data.json').then((res) =>
		res.json(),
	);
	const cellMerger = new CellMerger({
		mode: Mode.Col,
		dataSource,
		mergeFields: this.columns.map((item) => item.prop),
		genSort: true,
		columns: this.columns,
	});
	this.colTableData = cellMerger.getMergedData();
}
```

> 2. 在el-table中传入合并后的`tableData`

```html
<el-table
	border
	:data="colTableData"
	:span-method="colMergeMethod"
	header-cell-class-name="tableHeader"
>
	<el-table-column
		type="index"
		label="序号"
		width="100"
		:align="align"
	></el-table-column>
	<el-table-column
		v-for="columnItem in columns"
		:key="columnItem.prop"
		:prop="columnItem.prop"
		:label="columnItem.label"
		:align="align"
	></el-table-column>
</el-table>
```

> 3. 传入合并方法

```js
import { constants } from '@jinming6/merge-helper';
const { MERGE_OPTS_KEY, SORT_NO_KEY } = constants;

/**
 * 提示：
 * 根据合并后的值来处理
 * row[MERGE_OPTS_KEY]中就是计算后得到的值
 */
function colMergeMethod({ row, column, rowIndex, columnIndex }) {
	if (columnIndex === 1) {
		return row[MERGE_OPTS_KEY].name;
	}
	if (columnIndex === 2) {
		return row[MERGE_OPTS_KEY].age;
	}
	if (columnIndex === 3) {
		return row[MERGE_OPTS_KEY].province;
	}
	if (columnIndex === 4) {
		return row[MERGE_OPTS_KEY].city;
	}
	return [1, 1];
}
```

#### 🌰 合并「 行 」 和 「 列 」

> 1. 处理数据源

```js
import { CellMerger, Mode } from '@jinming6/merge-helper';

async function getTableData() {
	const { dataSource } = await fetch('../data/data.json').then((res) =>
		res.json(),
	);
	const cellMerger = new CellMerger({
		mode: Mode.RowCol,
		dataSource,
		mergeFields: this.columns.map((item) => {
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
		columns: this.columns,
	});
	this.allMergeData = cellMerger.getMergedData();
}
```

> 2. 在el-table中传入合并后的`tableData`

```html
<el-table
	border
	:data="allMergeData"
	:span-method="allMergeMethod"
	header-cell-class-name="tableHeader"
>
	<el-table-column
		:prop="SORT_NO_KEY"
		label="序号"
		width="100"
		:align="align"
	></el-table-column>
	<el-table-column
		v-for="columnItem in columns"
		:key="columnItem.prop"
		:prop="columnItem.prop"
		:label="columnItem.label"
		:align="align"
	></el-table-column>
</el-table>
```

> 3. 传入合并方法

```js
import { constants } from '@jinming6/merge-helper';
const { MERGE_OPTS_KEY, SORT_NO_KEY } = constants;

/**
 * 提示：
 * 根据合并后的值来处理
 * row[MERGE_OPTS_KEY]中就是计算后得到的值
 */
function allMergeMethod({ row, column, columnIndex }) {
	if (columnIndex === 0) {
		return [row[MERGE_OPTS_KEY].name.rowspan, 1];
	}
	if (columnIndex === 1) {
		return row[MERGE_OPTS_KEY].name;
	}
	if (columnIndex === 2) {
		return row[MERGE_OPTS_KEY].age;
	}
	if (columnIndex === 3) {
		return row[MERGE_OPTS_KEY].province;
	}
	if (columnIndex === 4) {
		return row[MERGE_OPTS_KEY].city;
	}
	return [1, 1];
}
```

## 📄 API

### CellMerger

#### 属性

| 名称        | 类型                  | 必填 | 描述                       |
| ----------- | --------------------- | ---- | -------------------------- |
| dataSource  | Array                 | 是   | 数据源                     |
| mergeFields | [Array](#mergefields) | 是   | 需要进行「行合并」的字段   |
| genSort     | boolean               | 否   | 是否生成「行合并」后的序号 |
| mode        | [Number](#属性)       | 是   | 合并模式                   |
| columns     | [Array](#columns)     | 否   | 列头                       |

### 方法

| 名称          | 参数 | 描述             |
| ------------- | ---- | ---------------- |
| getMergedData | --   | 获取合并后的数据 |

### mode

#### 属性

| 名称   | 值  | 描述       |
| ------ | --- | ---------- |
| Row    | 0   | 合并行     |
| Col    | 1   | 合并列     |
| RowCol | 2   | 合并行和列 |

### mergeFields

#### 属性

| 名称     | 类型     | 必填 | 描述                         |
| -------- | -------- | ---- | ---------------------------- |
| field    | String   | 是   | 字段名称                     |
| callback | Function | 是   | 自定义逻辑进行「行合并计算」 |

### columns

#### 属性

| 名称 | 类型   | 必填 | 描述   |
| ---- | ------ | ---- | ------ |
| prop | String | 是   | 列字段 |
