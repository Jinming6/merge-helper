import { Mode, getFieldSpan, splitIntoFragments } from '../src/main';
import {
  type ColumnItem,
  type DataSourceItem,
} from '../src/cellMerger/models/types';
import { SORT_NO_KEY } from '../src/cellMerger/models/constants';
import { getSortNo } from '../src/api';

const getColumns = (): ColumnItem[] => {
  return [
    {
      label: '姓名',
      prop: 'name',
    },
    {
      label: '年龄',
      prop: 'age',
    },
    {
      label: '地址',
      prop: 'address',
    },
  ];
};

const getDataSource = (): DataSourceItem[] => {
  const dataSource = new Array(10).fill(0).map((_, index) => {
    return {
      name: index % 3 === 0 ? '张三' : '李四',
      age: 18 + index,
      address: '中国',
    };
  });

  return dataSource;
};

const validSortNo = (
  dataSource: DataSourceItem[][],
  sortField: string,
): boolean => {
  let startNo = 1;

  for (let i = 0; i < dataSource.length; i++) {
    for (let j = 0; j < dataSource[i].length; j++) {
      const item = dataSource[i][j];
      const { rowspan } = getFieldSpan(item, sortField);
      if (rowspan < 1) {
        continue;
      }
      if (item[SORT_NO_KEY] !== startNo) {
        return false;
      }
      startNo++;
    }
  }

  return true;
};

test('[合并行]拆分为二维数组', () => {
  const result = splitIntoFragments({
    mode: Mode.Row,
    dataSource: getDataSource(),
    pageSize: 3,
    mergeFields: ['name'],
  });

  expect(result.length).toBe(4);
});

test('[合并行]拆分为二维数组，并生成序号', () => {
  const result = splitIntoFragments({
    mode: Mode.Row,
    dataSource: getDataSource(),
    pageSize: 3,
    mergeFields: ['name'],
    genSort: true,
  });

  const flag = validSortNo(result, 'name');

  expect(flag).toBe(true);
});

test('[合并列]拆分为二维数组', () => {
  const result = splitIntoFragments({
    mode: Mode.Col,
    dataSource: getDataSource(),
    pageSize: 3,
    mergeFields: getColumns().map((item) => item.prop),
    columns: getColumns(),
  });

  expect(result.length).toBe(4);
});

test('[合并列]拆分为二维数组，并生成序号', () => {
  const result = splitIntoFragments({
    mode: Mode.Col,
    dataSource: getDataSource(),
    pageSize: 3,
    mergeFields: getColumns().map((item) => item.prop),
    genSort: true,
    columns: getColumns(),
  });

  const flag = validSortNo(result, 'name');

  expect(flag).toBe(true);
});

test('[合并行]拆分为二维数组，获取排序号', () => {
  const result = splitIntoFragments({
    mode: Mode.Col,
    dataSource: getDataSource(),
    pageSize: 3,
    mergeFields: getColumns().map((item) => item.prop),
    genSort: true,
    columns: getColumns(),
  });

  const flag = getSortNo(result[0][0]) === 1;

  expect(flag).toBe(true);
});
