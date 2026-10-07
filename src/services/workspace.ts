import { GoogleDriveFile, ActionItem } from '../types/index';

/**
 * Parses raw text out of a Google Docs API Document resource.
 * Traverses paragraphs, lists, and table elements.
 */
export function extractTextFromGoogleDoc(doc: any): string {
  let fullText = '';
  if (!doc?.body?.content) return '';

  for (const element of doc.body.content) {
    if (element.paragraph?.elements) {
      for (const elem of element.paragraph.elements) {
        if (elem.textRun?.content) {
          fullText += elem.textRun.content;
        }
      }
    } else if (element.table?.tableRows) {
      for (const row of element.table.tableRows) {
        for (const cell of row.tableCells || []) {
          for (const cellElem of cell.content || []) {
            if (cellElem.paragraph?.elements) {
              for (const elem of cellElem.paragraph.elements) {
                if (elem.textRun?.content) {
                  fullText += elem.textRun.content + ' ';
                }
              }
            }
          }
          fullText += ' | ';
        }
        fullText += '\n';
      }
    }
  }

  return fullText.trim();
}

/**
 * Extracts a Google Doc ID from a URL or raw ID string.
 */
export function extractDocId(input: string): string {
  const trimmed = input.trim();
  // Match standard Google Doc URL: /document/d/{ID}/
  const urlMatch = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  // Match standard Google Drive file URL: /file/d/{ID}/
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }
  // If it's already an ID (alphanumeric, dashes, underscores, length >= 20)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * Extracts a Google Sheet ID from a URL or raw ID string.
 */
export function extractSheetId(input: string): string {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * Fetches recent Google Docs from the user's Google Drive.
 */
export async function listGoogleDocs(accessToken: string): Promise<GoogleDriveFile[]> {
  try {
    const q = "mimeType='application/vnd.google-apps.document' and trashed=false";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=15`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const msg = errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      throw new Error(`Google Drive API error: ${msg}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (error: any) {
    console.error('Failed to list Google Docs:', error);
    throw error;
  }
}

/**
 * Fetches a single Google Doc by ID.
 */
export async function fetchGoogleDoc(
  accessToken: string,
  docId: string
): Promise<{ title: string; text: string; webViewLink: string }> {
  try {
    const cleanId = extractDocId(docId);
    if (!cleanId) {
      throw new Error('Please provide a valid Google Document ID or URL.');
    }

    const url = `https://docs.googleapis.com/v1/documents/${cleanId}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      if (res.status === 404) {
        throw new Error(`Google Doc not found (ID: ${cleanId}). Please verify the document exists and you have access.`);
      }
      if (res.status === 403) {
        throw new Error(`Permission denied for Google Doc (ID: ${cleanId}). Ensure your Google account has read access to this document.`);
      }
      const msg = errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      throw new Error(`Google Docs API error: ${msg}`);
    }

    const doc = await res.json();
    const title = doc.title || 'Untitled Document';
    const text = extractTextFromGoogleDoc(doc);

    if (!text.trim()) {
      throw new Error(`The selected Google Doc "${title}" appears to be empty or contains no readable text.`);
    }

    const webViewLink = `https://docs.google.com/document/d/${cleanId}/edit`;

    return { title, text, webViewLink };
  } catch (error: any) {
    console.error('Failed to fetch Google Doc:', error);
    throw error;
  }
}

/**
 * Lists user's Google Sheets from Drive.
 */
export async function listGoogleSheets(accessToken: string): Promise<GoogleDriveFile[]> {
  try {
    const q = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=15`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const msg = errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      throw new Error(`Google Drive API error when listing Sheets: ${msg}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (error: any) {
    console.error('Failed to list Google Sheets:', error);
    throw error;
  }
}

/**
 * Creates a brand new Google Sheet with dedicated columns for Meeting Action Items.
 */
export async function createMeetingActionSheet(
  accessToken: string,
  title: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; sheetName: string }> {
  try {
    const sheetTitle = 'Action Items';
    const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: sheetTitle,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: 'Meeting Name' } },
                      { userEnteredValue: { stringValue: 'Meeting Date' } },
                      { userEnteredValue: { stringValue: 'Action Item' } },
                      { userEnteredValue: { stringValue: 'Owner' } },
                      { userEnteredValue: { stringValue: 'Due Date' } },
                      { userEnteredValue: { stringValue: 'Status' } },
                      { userEnteredValue: { stringValue: 'Source Quote' } },
                      { userEnteredValue: { stringValue: 'Document Link' } },
                      { userEnteredValue: { stringValue: 'Added At' } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const msg = errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      throw new Error(`Failed to create Google Sheet: ${msg}`);
    }

    const data = await res.json();
    const spreadsheetId = data.spreadsheetId;
    const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    return { spreadsheetId, spreadsheetUrl, sheetName: sheetTitle };
  } catch (error: any) {
    console.error('Failed to create sheet:', error);
    throw error;
  }
}

/**
 * Appends approved action items to an existing Google Sheet.
 */
export async function appendActionItemsToSheet(
  accessToken: string,
  spreadsheetId: string,
  meetingName: string,
  meetingDate: string,
  actions: ActionItem[]
): Promise<{ updatedRows: number; spreadsheetUrl: string }> {
  try {
    const cleanId = extractSheetId(spreadsheetId);
    if (!cleanId) {
      throw new Error('Please specify a valid Google Spreadsheet ID or URL.');
    }

    // First fetch sheet details to get first sheet tab title and ensure headers exist
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=sheets.properties.title`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!metaRes.ok) {
      const errJson = await metaRes.json().catch(() => null);
      if (metaRes.status === 404) {
        throw new Error(`Google Sheet not found (ID: ${cleanId}). Check ID and sharing permissions.`);
      }
      if (metaRes.status === 403) {
        throw new Error(`Permission denied for Google Sheet (ID: ${cleanId}). Ensure edit access is granted.`);
      }
      const msg = errJson?.error?.message || `HTTP ${metaRes.status} ${metaRes.statusText}`;
      throw new Error(`Google Sheets API error: ${msg}`);
    }

    const metaData = await metaRes.json();
    const tabName = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

    // Prepare rows for appending
    const rows = actions.map((item) => [
      meetingName || 'Meeting',
      meetingDate || 'Missing',
      item.task,
      item.owner || 'Missing',
      item.dueDate || 'Missing',
      'Approved',
      item.quote || '',
      item.sourceLink || '',
      new Date().toLocaleString(),
    ]);

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
      tabName
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const appendRes = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    });

    if (!appendRes.ok) {
      const errJson = await appendRes.json().catch(() => null);
      const msg = errJson?.error?.message || `HTTP ${appendRes.status} ${appendRes.statusText}`;
      throw new Error(`Failed to append rows to Google Sheet: ${msg}`);
    }

    const appendData = await appendRes.json();
    const updatedRows = appendData.updates?.updatedRows || rows.length;
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;

    return { updatedRows, spreadsheetUrl };
  } catch (error: any) {
    console.error('Failed to append to sheet:', error);
    throw error;
  }
}

/**
 * Creates Google Calendar events for action items with confirmed dates.
 * STRICT: Validates that every item has a confirmed (non-'Missing') date.
 */
export async function createCalendarEventsForActions(
  accessToken: string,
  meetingName: string,
  actions: ActionItem[]
): Promise<Array<{ actionId: string; eventId: string; eventUrl: string }>> {
  const results: Array<{ actionId: string; eventId: string; eventUrl: string }> = [];

  for (const item of actions) {
    if (!item.dueDate || item.dueDate === 'Missing' || item.dueDate.trim() === '') {
      throw new Error(
        `Action "${item.task}" cannot be scheduled because its due date is Missing. Set a date in the table first.`
      );
    }

    // Normalize date format (prefer YYYY-MM-DD for all-day deadline)
    let formattedDate = item.dueDate.trim();
    // If it's not strictly YYYY-MM-DD, try to parse with Date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      const parsedDate = new Date(formattedDate);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = parsedDate.toISOString().split('T')[0];
      } else {
        throw new Error(
          `Date "${item.dueDate}" for action "${item.task}" is invalid. Please format as YYYY-MM-DD.`
        );
      }
    }

    const eventPayload = {
      summary: `[Action] ${item.task}`,
      description: `Meeting: ${meetingName}\nOwner: ${item.owner}\nDue Date: ${item.dueDate}\n\nSource Quote:\n"${item.quote}"\n\nSource Document: ${item.sourceLink || 'N/A'}\nCreated via Meeting Decision Tracker`,
      start: {
        date: formattedDate,
      },
      end: {
        date: formattedDate,
      },
      reminders: {
        useDefault: true,
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const msg = errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      throw new Error(`Google Calendar API error for action "${item.task}": ${msg}`);
    }

    const eventData = await res.json();
    results.push({
      actionId: item.id,
      eventId: eventData.id,
      eventUrl: eventData.htmlLink || `https://calendar.google.com/calendar/r/eventedit/${eventData.id}`,
    });
  }

  return results;
}
