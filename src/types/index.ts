export interface DecisionItem {
  id: string;
  decision: string;
  rationale?: string;
  quote: string;
  sourceLink?: string;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string; // 'Missing' or person name
  dueDate: string; // 'Missing' or YYYY-MM-DD
  quote: string;
  sourceLink?: string;
  approved: boolean;
  syncedToSheet?: boolean;
  sheetRowId?: string;
  syncedToCalendar?: boolean;
  calendarEventId?: string;
}

export interface OpenQuestionItem {
  id: string;
  question: string;
  context?: string;
  quote: string;
  sourceLink?: string;
  status?: 'Open' | 'Resolved';
  resolution?: string;
}

export interface ExtractedMeetingData {
  meetingName: string;
  meetingDate: string; // 'Missing' or date string
  sourceDocId?: string;
  sourceDocTitle?: string;
  sourceDocUrl?: string;
  decisions: DecisionItem[];
  actionItems: ActionItem[];
  openQuestions: OpenQuestionItem[];
  rawText?: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface GoogleSheetInfo {
  id: string;
  name: string;
  tabs?: string[];
}
