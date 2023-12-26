export interface MergeFieldItem {
	field: string;
	callback: (curItem: DataSourceItem, nextItem: DataSourceItem) => boolean;
}

export type MergeFields = Array<string | MergeFieldItem>;

export interface CellMergerOptions {
	dataSource: DataSourceItem[];
	mergeFields: MergeFields;
	isTreeData?: boolean;
}

export type DataSourceItem = Record<string, any>;
