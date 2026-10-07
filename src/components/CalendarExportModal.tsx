import React, { useState } from 'react';
import {
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  RefreshCw,
  User,
} from 'lucide-react';
import { ActionItem } from '../types/index';

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingName: string;
  selectedActions: ActionItem[];
  onConfirmSchedule: () => Promise<void>;
  isScheduling: boolean;
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  meetingName,
  selectedActions,
  onConfirmSchedule,
  isScheduling,
}) => {
  if (!isOpen) return null;

  const [localSubmitting, setLocalSubmitting] = useState(false);

  // Strict check: No items with Missing dates or empty tasks allowed!
  const missingDateItems = selectedActions.filter(
    (i) => !i.dueDate || i.dueDate === 'Missing' || i.dueDate.trim() === ''
  );
  const emptyTaskItems = selectedActions.filter(
    (i) => !i.task || i.task.trim() === ''
  );
  const isValid = selectedActions.length > 0 && missingDateItems.length === 0 && emptyTaskItems.length === 0;

  const handleConfirm = async () => {
    if (localSubmitting || isScheduling || !isValid) return;
    setLocalSubmitting(true);
    try {
      await onConfirmSchedule();
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Confirm Google Calendar Scheduling
              </h3>
              <p className="text-xs text-slate-500">
                Preview exact events before adding to Google Calendar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isScheduling || localSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Strict Date Validation Guard */}
          {missingDateItems.length > 0 ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-sm text-red-950">
                  Cannot Schedule: Missing Dates Detected
                </span>
                <p className="text-xs text-red-800 mt-1">
                  The following {missingDateItems.length} action item(s) have no confirmed due date.
                  Per policy, a Calendar event will <strong>never</strong> be created for an action without a confirmed date.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 font-semibold text-red-900">
                  {missingDateItems.map((item) => (
                    <li key={item.id}>{item.task || '(Unnamed Task)'}</li>
                  ))}
                </ul>
                <p className="text-xs text-red-700 mt-2">
                  Please close this dialog and edit the due date in the review table first.
                </p>
              </div>
            </div>
          ) : emptyTaskItems.length > 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-sm text-amber-950">
                  Task Description Required
                </span>
                <p className="text-xs text-amber-800 mt-1">
                  One or more selected items have an empty description. Please provide a task description before scheduling.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Confirmed Deadlines Verified:</span>
                <p className="text-indigo-800 mt-0.5">
                  All {selectedActions.length} selected action item(s) have confirmed due dates and are ready to be scheduled as all-day deadline events on your primary Google Calendar.
                </p>
              </div>
            </div>
          )}

          {/* EXACT Events Preview */}
          <div>
            <label className="font-bold text-slate-800 text-xs block mb-2">
              Exact Calendar Events to Create ({selectedActions.length}):
            </label>

            <div className="space-y-3">
              {selectedActions.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 space-y-2 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                        All-Day Deadline Event
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1.5">
                        [Action] {item.task || '(Unnamed Task)'}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{item.dueDate}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="font-semibold text-slate-500">Assignee:</span>{' '}
                      <span className={item.owner === 'Missing' ? 'text-amber-700 font-semibold' : 'text-slate-800'}>
                        {item.owner}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Meeting:</span>{' '}
                      <span className="text-slate-800">{meetingName || 'Meeting Notes'}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200/80">
                    "{item.quote}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isScheduling || localSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isScheduling || localSubmitting || !isValid}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {isScheduling || localSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            <span>
              {isScheduling || localSubmitting
                ? 'Creating Events...'
                : `Confirm & Create ${selectedActions.length} Events`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
