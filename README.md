# merge-helper

[Documentation ( 中文 )](https://jinming6.github.io/plugins/merge-helper.html)

Easily handle cell merges

![capture-1710119346804.png](https://s2.loli.net/2024/03/11/Fb6mMay49HWjrke.png)

## Features

- [x] Merge `rows` and `columns`
- [x] Generates the merged sequence number
- [x] data fractionation

## Installation

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

### Quick Start

#### Merge Rows

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

# Summary

If [@jinming6/merge-helper](https://github.com/Jinming6/merge-helper) is helpful, you can click [Star](<(https://github.com/Jinming6/merge-helper)>) .
