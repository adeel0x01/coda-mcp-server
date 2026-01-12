/**
 * TypeScript interfaces for Coda API responses
 */

export interface CodaDoc {
  id: string;
  type: 'doc';
  href: string;
  browserLink: string;
  name: string;
  owner: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  workspace?: {
    id: string;
    type: string;
    organizationId?: string;
    browserLink: string;
  };
  folder?: {
    id: string;
    type: string;
    browserLink: string;
    name: string;
  };
  icon?: {
    name: string;
    type: string;
    browserLink: string;
  };
}

export interface CodaPage {
  id: string;
  type: 'page';
  href: string;
  browserLink: string;
  name: string;
  subtitle?: string;
  icon?: {
    name: string;
    type: string;
    browserLink: string;
  };
  image?: {
    type: string;
    browserLink: string;
  };
  contentType: 'canvas' | 'embed' | 'syncPage';
  isHidden?: boolean;
  children?: CodaPage[];
  parent?: {
    id: string;
    type: string;
    href: string;
    browserLink: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CodaTable {
  id: string;
  type: 'table';
  href: string;
  browserLink: string;
  name: string;
  parent: {
    id: string;
    type: string;
    href: string;
    browserLink: string;
  };
  parentTable?: {
    id: string;
    type: string;
    href: string;
    browserLink: string;
  };
  displayColumn: {
    id: string;
    name: string;
  };
  rowCount: number;
  sorts: any[];
  layout: 'default' | 'areaChart' | 'barChart' | 'bubbleChart' | 'calendar' | 'card' | 'detail' | 'form' | 'ganttChart' | 'lineChart' | 'masterDetail' | 'pieChart' | 'scatterChart' | 'slide' | 'wordCloud';
  filter?: {
    valid: boolean;
    isVolatile: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CodaColumn {
  id: string;
  type: 'column';
  href: string;
  name: string;
  display: boolean;
  calculated: boolean;
  formula?: string;
  defaultValue?: string;
  format: {
    type?: string;
    isArray?: boolean;
    label?: string;
    disableIf?: string;
    action?: string;
    [key: string]: any;
  };
}

export interface CodaRow {
  id: string;
  type: 'row';
  href: string;
  name: string;
  index: number;
  browserLink: string;
  createdAt: string;
  updatedAt: string;
  values: Record<string, any>;
}

export interface CodaCell {
  column: string;
  value: any;
}

export interface CodaRequestStatus {
  requestId: string;
  status?: 'pending' | 'complete' | 'failed';
}

export interface CodaListResponse<T> {
  items: T[];
  href: string;
  nextPageToken?: string;
  nextPageLink?: string;
}

export interface CodaMutationResponse {
  requestId: string;
  addedRowIds?: string[];
  rowIds?: string[];
}
