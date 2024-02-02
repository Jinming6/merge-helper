# merge-helper

[简体中文](./README-CN.md)

Easily handle cell merges

![截屏2024-01-07 23.44.15.png](https://s2.loli.net/2024/01/07/rqlRbZgUt6TD3xk.png)

[More examples](./example/el-table.html)

## 🎨 Features

- [x] Merge `rows` only
- [x] Customize conditions for `row merging`
- [x] Generate sequential numbers after `row merging`
- [x] Merge `columns` only
- [x] Merge both `rows` and `columns`

## ⚙️ Installation

🔔 Note: Before using, please install `lodash`.

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
$ npm i @jinming6/merge-helper
```

### CDN

```html
<script src="https://unpkg.com/@jinming6/merge-helper/dist/mergeHelper.min.js"></script>
```

### 🏄 Quick Start

> Merge "Rows"

1. Process the data source

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

2. Pass the `merged tableData` into the el-table component.

```html
<el-table border :data="tableData" :span-method="mergeMethod">
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

3. Pass the merge method.

```js
import { constants } from '@jinming6/merge-helper';
const { MERGE_OPTS_KEY, SORT_NO_KEY } = constants;

/**
 * Note:
 * Process based on the merged values.
 * The value in row[MERGE_OPTS_KEY] represents the computed result.
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

## 📄 API

### CellMerger

#### Properties

| Name        | Type                  | Required | Description                                                |
| ----------- | --------------------- | -------- | ---------------------------------------------------------- |
| dataSource  | Array                 | Yes      | Data source                                                |
| mergeFields | [Array](#mergefields) | Yes      | Fields for "row merging"                                   |
| genSort     | boolean               | No       | Whether to generate sequential numbers after "row merging" |
| mode        | [Number](#mode)       | Yes      | Merging mode                                               |
| columns     | [Array](#columns)     | No       | Column headers                                             |

### Methods

| Name          | Parameters | Description     |
| ------------- | ---------- | --------------- |
| getMergedData | --         | Get merged data |

### mode

#### Properties

| Name   | Value | Description            |
| ------ | ----- | ---------------------- |
| Row    | 0     | Merge rows             |
| Col    | 1     | Merge columns          |
| RowCol | 2     | Merge rows and columns |

### mergeFields

#### Properties

| Name     | Type     | Required | Description                    |
| -------- | -------- | -------- | ------------------------------ |
| field    | String   | Yes      | Field name                     |
| callback | Function | Yes      | Custom logic for "row merging" |

### columns

#### Properties

| Name | Type   | Required | Description  |
| ---- | ------ | -------- | ------------ |
| prop | String | Yes      | Column field |
