import { CellMerger } from './cellMerger';
import * as constants from './cellMerger/models/constants';
import { Mode } from './cellMerger/models/enums';
import {
  getMergedData,
  splitIntoFragments,
  getSortNo,
  getFieldSpan,
} from './api';

export {
  CellMerger,
  constants,
  Mode,
  getFieldSpan,
  getMergedData,
  splitIntoFragments,
  getSortNo,
};
