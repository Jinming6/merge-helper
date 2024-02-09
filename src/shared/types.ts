import { type CellMergerOptions } from '../cellMerge/types';

export interface SplitIntoFragmentsOpts extends CellMergerOptions {
  /**
   * 每页条数
   */
  pageSize: number;
}
