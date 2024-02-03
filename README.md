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

Note: Before using, please install [lodash](https://lodash.com)

### Package management tool

```bash
# pnpm
$ pnpm add @jinming6/merge-helper

# yarn
$ yarn add @jinming6/merge-helper

# npm
$ npm i @jinming6/merge-helper
```

### CDN

```html
<script src="https://unpkg.com/@jinming6/merge-helper/dist/mergeHelper.min.js"></script>
```

### 🏄 Quick Start

#### Merge " Rows "

```html
<template>
  <el-table border :data="tableData" :span-method="mergeMethod">
    <el-table-column :prop="SORT_NO_KEY" label="Index"></el-table-column>
    <el-table-column prop="province" label="Province"></el-table-column>
  </el-table>
</template>

<script>
  import {
    getMergedData,
    Mode,
    SORT_NO_KEY,
    getFieldSpan,
  } from '@jinming6/merge-helper';

  export default {
    data() {
      return {
        SORT_NO_KEY,
        tableData: [],
      };
    },
    mounted() {
      this.getTableData();
    },
    methods: {
      /**
       * Get table data
       */
      async getTableData() {
        const { dataSource } = await fetch('../data/data.json').then((res) =>
          res.json(),
        );
        // or: const mergeFields = ['province']
        // If the province is the same as the next row, the rowspan is added, and the process is iterated down.
        const mergeFields = [
          {
            field: 'province',
            callback(curItem, nextItem) {
              return (
                curItem.name === nextItem.name &&
                curItem.province === nextItem.province
              );
            },
          },
        ];
        const options = {
          mode: Mode.Row,
          dataSource,
          mergeFields,
          genSort: true,
        };
        this.tableData = getMergedData(options);
      },
      /**
       * Table merge logic
       */
      mergeMethod({ row, columnIndex }) {
        if (columnIndex === 1) {
          return getFieldSpan(row, 'province');
        }
        return {
          rowspan: 1,
          colspan: 1,
        };
      },
    },
  };
</script>
```

## 📄 API

1. [CellMerger](#cellmerger-parameter)
2. [getMergedData](#getmergeddata)
3. [getFieldSpan](#getfieldspan)

### CellMerger parameter

| Name        | Type                            | Required | Description                                                                                       |
| ----------- | ------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| dataSource  | Array                           | yes      | data source                                                                                       |
| mergeFields | [Array](#mergefields-parameter) | yes      | Fields that need to be "row merged"                                                               |
| genSort     | Boolean                         | no       | Whether to generate the sequence number after Row Merge                                           |
| sortBy      | String                          | no       | Sort the calculation by the latitude of the field. (The default is the first item of mergeFiedls) |
| mode        | [Number](#mode-parameter)       | yes      | Merge mode                                                                                        |
| columns     | [Array](#columns-parameter)     | no       | columns                                                                                           |

### CellMerger method

| Name          | Type | Description         |
| ------------- | ---- | ------------------- |
| getMergedData | --   | Get the merged data |

### mode parameter

| Name   | Type | Description            |
| ------ | ---- | ---------------------- |
| Row    | 0    | Merge rows             |
| Col    | 1    | Merge columns          |
| RowCol | 2    | Merge rows and columns |

### mergeFields parameter

| Name     | Type     | Required | Description                               |
| -------- | -------- | -------- | ----------------------------------------- |
| field    | String   | yes      | field name                                |
| callback | Function | yes      | Custom logic for "row merge calculations" |

### columns parameter

| Name | Type   | Required | Description  |
| ---- | ------ | -------- | ------------ |
| prop | String | yes      | column field |

### getMergedData parameter

Same as [CellMerger parameter](#cellmerger-parameter)

### Utilities

#### getMergedData

Get the merged data

```js
import { getMergedData, Mode } from '@jinming6/merge-helper';

const options = {
  mode: Mode.Row,
  dataSource: [
    { province: 'shandong province', name: 'John' },
    { province: 'shandong province', name: 'John' },
    { province: 'Jiangsu province', name: 'peace' },
  ],
  mergeFields: [
    {
      field: 'province',
      callback(curItem, nextItem) {
        // Customize merge conditions
        return (
          curItem.name === nextItem.name &&
          curItem.province === nextItem.province
        );
      },
    },
  ],
  genSort: true,
};
const mergeData = getMergedData(options);
```

#### getFieldSpan

Gets the field merge configuration

```js
import { getFieldSpan } from '@jinming6/merge-helper';

const spanMethod = ({ row, columnIndex }) => {
  // Merge column 1 by province
  if (columnIndex === 0) {
    return getFieldSpan(row, 'province');
  }
  // Or return [1, 1]
  return {
    rowspan: 1,
    colspan: 1,
  };
};
```
