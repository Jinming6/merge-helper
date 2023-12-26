export interface MergeFieldItem {
	field: string;
	callback: (curItem: DataSourceItem, nextItem: DataSourceItem) => boolean;
}

export type MergeFields = Array<string | MergeFieldItem>;

export interface CellMergerOptions {
	dataSource: DataSourceItem[]; // 数据源
	mergeFields: MergeFields; // 需要合并的字段
	isTreeData?: boolean; // 是否为树结构
	genSort?: boolean; // 是否生成序号
	sortBy?: string; // 以该字段为准，进行排序
}

export type DataSourceItem = Record<string, any>;
