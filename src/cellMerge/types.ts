export interface MergeFieldItem {
	field: string;
	callback: () => boolean;
}

export type MergeFields = string[] | MergeFieldItem[];

export interface CellMergerOptions {
	dataSource: DataSourceItem[];
	mergeFields: MergeFields;
	isTreeData?: boolean;
}

export type DataSourceItem = Record<string, any>;
