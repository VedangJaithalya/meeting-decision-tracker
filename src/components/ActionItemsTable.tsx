import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  AlertCircle,
  Calendar,
  TableProperties,
  Trash2,
  Plus,
  ExternalLink,
  Quote,
  Check,
  CalendarClock,
  User as UserIcon,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ActionItem } from '../types/index';

interface ActionItemsTableProps {
  actionItems: ActionItem[];
  onUpdateActionItem: (id: string, updates: Partial<ActionItem>) => void;
  onDeleteActionItem: (id: string) => void;
  onAddActionItem: () => void;
  onOpenSheetModal: () => void;
  onOpenCalendarModal: () => void;
  selectedCalendarIds: string[];
  onToggleSelectCalendar: (id: string) => void;
  onSelectAllCalendar: () => void;
}

export const ActionItemsTable: React.FC<ActionItemsTableProps> = ({
  actionItems,
  onUpdateActionItem,
  onDeleteActionItem,
  onAddActionItem,
  onOpenSheetModal,
  onOpenCalendarModal,
  selectedCalendarIds,
  onToggleSelectCalendar,
  onSelectAllCalendar,
}) => {
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

  // Derived counts
  const approvedNotSynced = actionItems.filter((i) => i.approved && !i.syncedToSheet);
  const alreadySyncedToSheet = actionItems.filter((i) => i.syncedToSheet);

  const selectedForCalendar = actionItems.filter((i) => selectedCalendarIds.includes(i.id));
  const selectedWithMissingDate = selectedForCalendar.filter(
    (i) => !i.dueDate || i.dueDate === 'Missing' || i.dueDate.trim() === ''
  );
  const selectedWithEmptyTask = selectedForCalendar.filter(
    (i) => !i.task || i.task.trim() === ''
  );

  const canScheduleCalendar =
    selectedForCalendar.length > 0 &&
    selectedWithMissingDate.length === 0 &&
    selectedWithEmptyTask.length === 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Table Header & Action Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 text-base">
              Action Items Review Table
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
              {actionItems.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review, edit, or approve items. Owners or dates not stated in notes are strictly marked{' '}
            <span className="font-semibold text-amber-700">Missing</span>.
          </p>
        </div>

        {/* Separate Buttons for Sheet and Calendar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button 1: Add approved actions to Sheet */}
          <button
            type="button"
            onClick={onOpenSheetModal}
            disabled={approvedNotSynced.length === 0}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              approvedNotSynced.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
            title={
              approvedNotSynced.length === 0
                ? alreadySyncedToSheet.length > 0
                  ? 'All approved action items have already been added to the Sheet.'
                  : 'Approve at least one action item below to export to Google Sheets.'
                : 'Add approved actions to Google Sheets'
            }
          >
            <TableProperties className="w-4 h-4" />
            <span>Add approved to Sheet</span>
            {approvedNotSynced.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-emerald-700 rounded-full text-[10px]">
                {approvedNotSynced.length}
              </span>
            )}
          </button>

          {/* Button 2: Create selected Calendar events */}
          <button
            type="button"
            onClick={onOpenCalendarModal}
            disabled={!canScheduleCalendar}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              canScheduleCalendar
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
            title={
              selectedForCalendar.length === 0
                ? 'Select action items using checkboxes to schedule in Google Calendar.'
                : selectedWithMissingDate.length > 0
                ? 'Never create Calendar events without a confirmed date. Fix Missing dates first.'
                : selectedWithEmptyTask.length > 0
                ? 'Task description cannot be empty.'
                : 'Create selected Calendar events'
            }
          >
            <Calendar className="w-4 h-4" />
            <span>Create Calendar events</span>
            {selectedForCalendar.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  canScheduleCalendar ? 'bg-indigo-700 text-white' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedForCalendar.length}
              </span>
            )}
          </button>

          {/* Add Item Button */}
          <button
            type="button"
            onClick={onAddActionItem}
            className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Action</span>
          </button>
        </div>
      </div>

      {/* Warning Banner if user selected an item with Missing Date for Calendar */}
      {selectedWithMissingDate.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-5 py-2.5 flex items-center space-x-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Calendar Notice:</strong> {selectedWithMissingDate.length} selected action item(s) have a{' '}
            <span className="font-semibold underline">Missing due date</span>. Calendar events require a confirmed date. Please enter a valid date in the table to schedule.
          </span>
        </div>
      )}

      {/* Content Area */}
      {actionItems.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          No action items found or added yet.
        </div>
      ) : (
        <>
          {/* A. DESKTOP / TABLET VIEW (hidden on small screens) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-10 text-center" title="Select for Google Calendar">
                    <button
                      type="button"
                      onClick={onSelectAllCalendar}
                      className="text-slate-500 hover:text-slate-800"
                      title="Select / Deselect all for Calendar"
                    >
                      {selectedCalendarIds.length === actionItems.length && actionItems.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3 w-28 text-center" title="Approval for Google Sheet export">
                    Approve Sheet
                  </th>
                  <th className="py-3 px-4 min-w-[240px]">Action Item Description</th>
                  <th className="py-3 px-3 w-40">Owner</th>
                  <th className="py-3 px-3 w-36">Due Date</th>
                  <th className="py-3 px-3 w-52">Source Quote & Link</th>
                  <th className="py-3 px-3 w-32">Status</th>
                  <th className="py-3 px-2 w-12 text-center">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actionItems.map((item) => {
                  const isSelectedForCalendar = selectedCalendarIds.includes(item.id);
                  const isOwnerMissing = !item.owner || item.owner.trim() === 'Missing' || item.owner.trim() === '';
                  const isDateMissing = !item.dueDate || item.dueDate.trim() === 'Missing' || item.dueDate.trim() === '';
                  const isTaskEmpty = !item.task || item.task.trim() === '';
                  const isExpanded = expandedQuoteId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        item.approved ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* 1. Calendar Select Checkbox */}
                      <td className="py-3 px-3 text-center align-top">
                        <button
                          type="button"
                          onClick={() => onToggleSelectCalendar(item.id)}
                          className="p-1 text-slate-400 hover:text-indigo-600 focus:outline-none"
                          title={
                            isDateMissing
                              ? 'Warning: Due date is Missing. Set a date to enable calendar scheduling.'
                              : 'Select to create Calendar event'
                          }
                        >
                          {isSelectedForCalendar ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* 2. Sheet Approval Toggle */}
                      <td className="py-3 px-3 text-center align-top">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.approved}
                            onChange={(e) =>
                              onUpdateActionItem(item.id, { approved: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.approved ? (
                            <span className="text-emerald-700 font-semibold">Approved</span>
                          ) : (
                            <span>Pending</span>
                          )}
                        </div>
                      </td>

                      {/* 3. Action Description (Editable) */}
                      <td className="py-3 px-4 align-top">
                        <textarea
                          value={item.task}
                          onChange={(e) =>
                            onUpdateActionItem(item.id, { task: e.target.value })
                          }
                          rows={2}
                          placeholder="Action item description..."
                          className={`w-full text-xs p-1.5 rounded-lg border font-medium resize-none focus:outline-none ${
                            isTaskEmpty
                              ? 'border-red-300 bg-red-50 text-red-900 placeholder:text-red-400'
                              : 'bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-slate-200 focus:border-indigo-400 text-slate-900'
                          }`}
                        />
                        {isTaskEmpty && (
                          <span className="block text-[10px] text-red-600 font-semibold mt-0.5">
                            Description cannot be empty
                          </span>
                        )}
                      </td>

                      {/* 4. Owner (Strict Missing indicator, Editable) */}
                      <td className="py-3 px-3 align-top">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.owner}
                            onChange={(e) =>
                              onUpdateActionItem(item.id, { owner: e.target.value })
                            }
                            placeholder="Assign owner..."
                            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border font-medium focus:outline-none ${
                              isOwnerMissing
                                ? 'bg-amber-50/80 border-amber-300 text-amber-900 placeholder:text-amber-500'
                                : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          />
                          {isOwnerMissing && (
                            <span className="block text-[10px] text-amber-700 font-semibold mt-0.5 flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3 text-amber-600 inline" />
                              <span>Owner Missing in notes</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Due Date (Strict Missing indicator, Editable) */}
                      <td className="py-3 px-3 align-top">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.dueDate}
                            onChange={(e) =>
                              onUpdateActionItem(item.id, { dueDate: e.target.value })
                            }
                            placeholder="YYYY-MM-DD"
                            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border font-medium focus:outline-none ${
                              isDateMissing
                                ? 'bg-amber-50/80 border-amber-300 text-amber-900 placeholder:text-amber-500'
                                : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          />
                          {isDateMissing ? (
                            <span className="block text-[10px] text-amber-700 font-semibold mt-0.5 flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3 text-amber-600 inline" />
                              <span>Date Missing</span>
                            </span>
                          ) : (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Confirmed date
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Source Quote & Source Doc Link */}
                      <td className="py-3 px-3 align-top">
                        <div className="space-y-1">
                          <div
                            className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-[11px] text-slate-700 italic cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() =>
                              setExpandedQuoteId(isExpanded ? null : item.id)
                            }
                            title="Click to expand/collapse full quote"
                          >
                            <div className="flex items-center justify-between text-slate-400 text-[10px] not-italic mb-0.5">
                              <span className="flex items-center space-x-1">
                                <Quote className="w-3 h-3" />
                                <span>Source Quote</span>
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </div>
                            <p className={isExpanded ? 'whitespace-normal' : 'line-clamp-2'}>
                              "{item.quote || 'No direct quote'}"
                            </p>
                          </div>

                          {item.sourceLink && (
                            <a
                              href={item.sourceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline pt-0.5"
                            >
                              <span>View Source Doc</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* 7. Sync Status Badges */}
                      <td className="py-3 px-3 align-top space-y-1">
                        {item.syncedToSheet && (
                          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>In Sheet</span>
                          </div>
                        )}

                        {item.syncedToCalendar && (
                          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <CalendarClock className="w-3 h-3 text-indigo-600" />
                            <span>In Calendar</span>
                          </div>
                        )}

                        {!item.syncedToSheet && !item.syncedToCalendar && (
                          <span className="text-[11px] text-slate-400">Not synced</span>
                        )}
                      </td>

                      {/* 8. Delete Button */}
                      <td className="py-3 px-2 text-center align-top">
                        <button
                          type="button"
                          onClick={() => onDeleteActionItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove action item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* B. MOBILE CARD VIEW (Optimized for phones/small screens) */}
          <div className="block lg:hidden divide-y divide-slate-200">
            {actionItems.map((item) => {
              const isSelectedForCalendar = selectedCalendarIds.includes(item.id);
              const isOwnerMissing = !item.owner || item.owner.trim() === 'Missing' || item.owner.trim() === '';
              const isDateMissing = !item.dueDate || item.dueDate.trim() === 'Missing' || item.dueDate.trim() === '';
              const isExpanded = expandedQuoteId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 space-y-3 ${item.approved ? 'bg-emerald-50/20' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => onToggleSelectCalendar(item.id)}
                        className="text-slate-500 hover:text-indigo-600 p-0.5"
                        title="Select for Calendar"
                      >
                        {isSelectedForCalendar ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      <span className="text-xs font-semibold text-slate-600">Select Calendar</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-1.5 cursor-pointer text-xs">
                        <span className="text-slate-600 font-medium">Approve:</span>
                        <input
                          type="checkbox"
                          checked={item.approved}
                          onChange={(e) =>
                            onUpdateActionItem(item.id, { approved: e.target.checked })
                          }
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => onDeleteActionItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Remove action"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Task description */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Task Description:
                    </label>
                    <textarea
                      value={item.task}
                      onChange={(e) => onUpdateActionItem(item.id, { task: e.target.value })}
                      rows={2}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
                    />
                  </div>

                  {/* Owner and Date grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                        Owner:
                      </label>
                      <input
                        type="text"
                        value={item.owner}
                        onChange={(e) => onUpdateActionItem(item.id, { owner: e.target.value })}
                        placeholder="Owner name"
                        className={`w-full text-xs p-1.5 rounded-lg border font-medium ${
                          isOwnerMissing
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                      {isOwnerMissing && (
                        <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                          Owner Missing
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                        Due Date:
                      </label>
                      <input
                        type="text"
                        value={item.dueDate}
                        onChange={(e) => onUpdateActionItem(item.id, { dueDate: e.target.value })}
                        placeholder="YYYY-MM-DD"
                        className={`w-full text-xs p-1.5 rounded-lg border font-medium ${
                          isDateMissing
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                      {isDateMissing && (
                        <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                          Date Missing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quote & Link */}
                  <div
                    onClick={() => setExpandedQuoteId(isExpanded ? null : item.id)}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold flex items-center space-x-1">
                        <Quote className="w-3 h-3" />
                        <span>Source Quote</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </div>
                    <p className={`text-[11px] italic text-slate-700 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      "{item.quote || 'No quote'}"
                    </p>
                  </div>

                  {/* Sync Badges */}
                  <div className="flex items-center space-x-2 pt-1">
                    {item.syncedToSheet && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        In Sheet
                      </span>
                    )}
                    {item.syncedToCalendar && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                        In Calendar
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
