import React, { useState } from 'react';
import {
  TableProperties,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  PlusCircle,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { ActionItem, GoogleDriveFile } from '../types/index';

interface SheetExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingName: string;
  meetingDate: string;
  actionsToExport: ActionItem[];
  existingSheets: GoogleDriveFile[];
  isLoadingSheets: boolean;
  isSampleMode: boolean;
  onConfirmExport: (config: {
    mode: 'new' | 'existing';
    newSheetTitle?: string;
    existingSheetId?: string;
  }) => Promise<void>;
  isExporting: boolean;
}

export const SheetExportModal: React.FC<SheetExportModalProps> = ({
  isOpen,
  onClose,
  meetingName,
  meetingDate,
  actionsToExport,
  existingSheets,
  isLoadingSheets,
  isSampleMode,
  onConfirmExport,
  isExporting,
}) => {
  if (!isOpen) return null;

  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [sheetChoice, setSheetChoice] = useState<'new' | 'existing'>('new');
  const [newTitle, setNewTitle] = useState(`Meeting Action Items - ${meetingName || 'Notes'}`);
  const [selectedSheetId, setSelectedSheetId] = useState<string>(
    existingSheets.length > 0 ? existingSheets[0].id : ''
  );
  const [customSheetUrl, setCustomSheetUrl] = useState('');

  const handleConfirm = async () => {
    if (localSubmitting || isExporting) return;
    setLocalSubmitting(true);
    try {
      const targetId = customSheetUrl.trim() || selectedSheetId;
      await onConfirmExport({
        mode: sheetChoice,
        newSheetTitle: newTitle.trim(),
        existingSheetId: targetId,
      });
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <TableProperties className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Confirm Google Sheets Export
              </h3>
              <p className="text-xs text-slate-500">
                Preview exact data rows to be appended to your spreadsheet.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Duplicate Prevention Guard */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Idempotency & Duplicate Prevention:</span>
              <p className="text-emerald-800 mt-0.5">
                Only {actionsToExport.length} approved, un-synced action item(s) will be exported.
                Already exported rows are tracked and strictly excluded to prevent duplicates if you click again.
              </p>
            </div>
          </div>

          {/* Target Spreadsheet Destination */}
          <div className="space-y-3">
            <label className="font-bold text-slate-800 text-xs block">
              Choose Target Spreadsheet:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setSheetChoice('new')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  sheetChoice === 'new'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">Create New Spreadsheet</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Automatically formats a new Google Sheet with dedicated action item columns.
                </p>
              </div>

              <div
                onClick={() => setSheetChoice('existing')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  sheetChoice === 'existing'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">Append to Existing Sheet</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Add new rows to an existing spreadsheet in your Google Drive.
                </p>
              </div>
            </div>

            {sheetChoice === 'new' ? (
              <div className="pt-2">
                <label className="block text-slate-600 mb-1 font-medium">New Spreadsheet Title:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            ) : (
              <div className="pt-2 space-y-2">
                {!isSampleMode && existingSheets.length > 0 && (
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">
                      Select Existing Google Sheet:
                    </label>
                    <select
                      value={selectedSheetId}
                      onChange={(e) => setSelectedSheetId(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      {existingSheets.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.id.substring(0, 8)}...)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    Or Paste Spreadsheet URL / ID:
                  </label>
                  <input
                    type="text"
                    value={customSheetUrl}
                    onChange={(e) => setCustomSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* EXACT Rows to be written preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 text-xs">
                Exact Row Payloads ({actionsToExport.length} rows):
              </label>
              <span className="text-[11px] text-slate-400">
                Includes meeting name, owner, due date, quote & document link
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-60">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Meeting</th>
                    <th className="py-2 px-3">Action Item</th>
                    <th className="py-2 px-3">Owner</th>
                    <th className="py-2 px-3">Due Date</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Source Quote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actionsToExport.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                        {meetingName || 'Meeting'}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900 max-w-xs truncate">
                        {item.task}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            item.owner === 'Missing'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800 font-semibold'
                          }`}
                        >
                          {item.owner}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            item.dueDate === 'Missing'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {item.dueDate}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-emerald-700 font-semibold">Approved</td>
                      <td className="py-2 px-3 italic text-slate-500 max-w-xs truncate">
                        "{item.quote}"
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isExporting || localSubmitting || actionsToExport.length === 0}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all disabled:opacity-50"
          >
            {isExporting || localSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <TableProperties className="w-4 h-4" />
            )}
            <span>
              {isExporting || localSubmitting
                ? 'Exporting Rows to Sheet...'
                : `Confirm & Export ${actionsToExport.length} Actions`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
