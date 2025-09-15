

export interface BookTypeCounts {
  External: number;
  Internal: number;
  Fax: number;
}

export interface BookStatusCounts {
  Accomplished: number;
  Pending: number;
  Deliberation: number;
}

export interface UserBookCount {
  username: string;
  bookCount: number;
}