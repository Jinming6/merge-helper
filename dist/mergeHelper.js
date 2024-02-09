(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash')) :
    typeof define === 'function' && define.amd ? define(['exports', 'lodash'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["@jinming6/mergeHelper"] = {}, global._));
})(this, (function (exports, lodash) { 'use strict';

    const MERGE_OPTS_KEY = '_mergeOpts';
    const SORT_NO_KEY = '_sortNo';
    const FIRST_ID = '_firstId';
    const ROW_KEY = 'id';

    var constants = /*#__PURE__*/Object.freeze({
        __proto__: null,
        FIRST_ID: FIRST_ID,
        MERGE_OPTS_KEY: MERGE_OPTS_KEY,
        ROW_KEY: ROW_KEY,
        SORT_NO_KEY: SORT_NO_KEY
    });

    exports.Mode = void 0;
    (function (Mode) {
        Mode[Mode["Row"] = 0] = "Row";
        Mode[Mode["Col"] = 1] = "Col";
        Mode[Mode["RowCol"] = 2] = "RowCol";
    })(exports.Mode || (exports.Mode = {}));

    /**
     * 获取字段合并配置
     */
    function getFieldSpan(row, field) {
        const mergeOpts = row[MERGE_OPTS_KEY];
        const defaultSpanValue = {
            rowspan: 1,
            colspan: 1,
        };
        if (!lodash.isPlainObject(mergeOpts)) {
            return defaultSpanValue;
        }
        const fieldSpan = mergeOpts[field];
        if (!lodash.isPlainObject(fieldSpan)) {
            return defaultSpanValue;
        }
        return fieldSpan;
    }
    /**
     * 获取合并后的数据
     */
    function getMergedData(options) {
        const instance = new CellMerger(options);
        return instance.getMergedData();
    }
    /**
     * 将数据拆分为片段
     */
    function splitIntoFragments(options) {
        const { dataSource, pageSize, mergeFields, mode, genSort, sortBy, columns } = options;
        const copyData = lodash.cloneDeep(dataSource);
        // 按照pageSize拆分数据
        const len = Math.ceil(copyData.length / pageSize);
        let arr = [];
        for (let i = 0; i < len; i++) {
            const startIdx = i * pageSize;
            const endIdx = (i + 1) * pageSize;
            const fragment = copyData.slice(startIdx, endIdx);
            arr.push(fragment);
        }
        // 合并数据
        let isMerged = false;
        if (lodash.isArray(mergeFields) && mergeFields.length > 0) {
            arr = arr.map((item) => {
                const cellMerge = new CellMerger({
                    mode,
                    dataSource: item,
                    mergeFields,
                    columns,
                });
                return cellMerge.getMergedData();
            });
            isMerged = true;
        }
        // 生成排序号
        if (genSort === true) {
            const sortKey = lodash.isString(sortBy) ? sortBy : getFirstMergeField(mergeFields);
            if (!lodash.isString(sortKey)) {
                return arr;
            }
            let startIndex = 1;
            arr.forEach((childArr) => {
                childArr.forEach((item) => {
                    if (isMerged) {
                        if (getFieldSpan(item, sortKey).rowspan > 0) {
                            item[SORT_NO_KEY] = startIndex;
                            ++startIndex;
                        }
                    }
                    else {
                        item[SORT_NO_KEY] = startIndex;
                        startIndex++;
                    }
                });
            });
        }
        return arr;
    }
    /**
     * 获取第一个合并的列字段
     */
    function getFirstMergeField(mergeFields) {
        const elem = mergeFields[0];
        if (lodash.isString(elem)) {
            return elem;
        }
        else if (lodash.isPlainObject(elem)) {
            return elem.field;
        }
        return null;
    }

    function warn(msg) {
        console.warn(`[${"@jinming6/merge-helper"} warn] ${msg}`);
    }

    class CellMerger {
        constructor(options) {
            // 模式
            this.mode = exports.Mode.Row;
            const { dataSource, mergeFields, genSort, rowKey = ROW_KEY, columns = [], mode, sortBy, } = options;
            this.mode = mode;
            this.dataSource = lodash.cloneDeep(dataSource);
            this.mergeFields = lodash.cloneDeep(mergeFields);
            this.genSort = genSort !== null && genSort !== void 0 ? genSort : false;
            this.rowKey = rowKey;
            this.columns = columns;
            this.sortBy = lodash.isString(sortBy)
                ? sortBy
                : getFirstMergeField(this.mergeFields);
            this.initMergeOpts(this.dataSource, this.mergeFields);
            if (this.mode === exports.Mode.Row) {
                this.mergeCells(this.dataSource);
            }
            else if (this.mode === exports.Mode.Col) {
                console.log('columns', this.columns);
                if (this.columns.length < 1) {
                    warn('columns 不能为空');
                }
                this.mergeCols(this.dataSource, this.columns);
            }
            else if (this.mode === exports.Mode.RowCol) {
                this.mergeCells(this.dataSource);
                this.mergeCols(this.dataSource, this.columns);
            }
        }
        /**
         * 初始化合并配置
         */
        initMergeOpts(dataSource, mergeFields) {
            mergeFields.forEach((fieldItem) => {
                const field = lodash.isString(fieldItem) ? fieldItem : fieldItem.field;
                if (!lodash.isString(field)) {
                    throw new Error('field 必须是一个字符串');
                }
                dataSource.forEach((item) => {
                    if (!lodash.isPlainObject(item[MERGE_OPTS_KEY])) {
                        item[MERGE_OPTS_KEY] = {};
                    }
                    if (!lodash.isPlainObject(item[MERGE_OPTS_KEY][field])) {
                        item[MERGE_OPTS_KEY][field] = {
                            rowspan: 1,
                            colspan: 1,
                        };
                    }
                });
            });
        }
        /**
         * 判断是否为被合并了的单元格
         */
        isMergedCell(item, field) {
            const value = item[MERGE_OPTS_KEY][field];
            return lodash.isPlainObject(value) && value.rowspan === 0;
        }
        /**
         * 合并单元格
         */
        mergeCells(dataSource) {
            this.mergeFields.forEach((fieldItem) => {
                if (lodash.isString(fieldItem)) {
                    this.mergeCellsByField(dataSource, fieldItem);
                }
                else if (lodash.isPlainObject(fieldItem)) {
                    const { field, callback } = fieldItem;
                    if (lodash.isString(field) && lodash.isFunction(callback)) {
                        this.mergeCellsByField(dataSource, field, callback);
                    }
                }
            });
        }
        /**
         * 根据字段来计算单元格的合并
         */
        mergeCellsByField(dataSource, field, condition) {
            if (!lodash.isString(field)) {
                return;
            }
            let startNo = 1;
            for (let i = 0; i < dataSource.length; i++) {
                const item = dataSource[i];
                if (this.isMergedCell(item, field)) {
                    continue;
                }
                if (lodash.isBoolean(this.genSort) && this.sortBy === field) {
                    item[SORT_NO_KEY] = startNo;
                }
                for (let j = i + 1; j < dataSource.length; j++) {
                    const nextItem = dataSource[j];
                    if (lodash.isFunction(condition)
                        ? condition(item, nextItem)
                        : item[field] === nextItem[field]) {
                        item[MERGE_OPTS_KEY][field].rowspan += 1;
                        nextItem[MERGE_OPTS_KEY][field].rowspan = 0;
                        nextItem[FIRST_ID] = lodash.isString(this.rowKey) ? item[this.rowKey] : null;
                    }
                    else {
                        break;
                    }
                }
                if (this.sortBy === field) {
                    startNo += 1;
                }
            }
        }
        /**
         * 合并列
         */
        mergeCols(dataSource, columns) {
            if (columns.length < 1 || dataSource.length < 1)
                return;
            const dataSourceLen = dataSource.length;
            const columnsLen = columns.length;
            // 遍历数据源
            for (let i = 0; i < dataSourceLen; i++) {
                const curItem = dataSource[i];
                for (let j = 0; j < columnsLen; j++) {
                    // 当前列
                    const curColumn = columns[j];
                    if (curColumn.prop === SORT_NO_KEY) {
                        continue;
                    }
                    if (curItem[curColumn.prop] == null) {
                        continue;
                    }
                    // 如果当前列的colspan为0，则跳过
                    if (curItem[MERGE_OPTS_KEY][curColumn.prop].colspan === 0) {
                        continue;
                    }
                    for (let k = j + 1; k < columnsLen; k++) {
                        // 下一列
                        const nextColumn = columns[k];
                        if (nextColumn.prop === SORT_NO_KEY) {
                            break;
                        }
                        // 如果是空值，则跳过
                        if (curItem[nextColumn.prop] == null) {
                            break;
                        }
                        // 否则，就累加colspan
                        if (curItem[curColumn.prop] === curItem[nextColumn.prop] &&
                            curItem[MERGE_OPTS_KEY][curColumn.prop].rowspan ===
                                curItem[MERGE_OPTS_KEY][nextColumn.prop].rowspan) {
                            curItem[MERGE_OPTS_KEY][curColumn.prop].colspan += 1;
                            curItem[MERGE_OPTS_KEY][nextColumn.prop].colspan = 0;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        /**
         * 获取合并后的数据
         */
        getMergedData() {
            return this.dataSource;
        }
    }

    exports.CellMerger = CellMerger;
    exports.constants = constants;
    exports.getFieldSpan = getFieldSpan;
    exports.getMergedData = getMergedData;
    exports.splitIntoFragments = splitIntoFragments;

}));
