import React, { useState } from 'react';
import {
  TableProperties,
  Calendar,
  ExternalLink,
  Check,
  Clock,
  Sparkles,
  Sheet,
} from 'lucide-react';
import { ActionItem } from '../types';

interface SimulatedWorkspaceViewProps {
  syncedSheetRows: Array<{
    meetingName: string;
    meetingDate: string;
    task: string;
    owner: string;
    dueDate: string;
    status: string;
    quote: string;
    addedAt: string;
  }>;
  scheduledEvents: Array<{
    task: string;
    owner: string;
    dueDate: string;
    meetingName: string;
    quote: string;
  }>;
}

export const SimulatedWorkspaceView: React.FC<SimulatedWorkspaceViewProps> = ({
  syncedSheetRows,
  scheduledEvents,
}) => {
  const [activeTab, setActiveTab] = useState<'sheet' | 'calendar'>('sheet');

  if (syncedSheetRows.length === 0 && scheduledEvents.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Tab Switcher */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded-lg bg-indigo-100 text-indigo-700">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="font-bold text-slate-900 text-sm">
            Live Workspace Sync Output (Demonstration View)
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('sheet')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'sheet'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>Synced Google Sheet ({syncedSheetRows.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Scheduled Calendar ({scheduledEvents.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Simulated Google Sheet */}
      {activeTab === 'sheet' && (
        <div className="p-4">
          {syncedSheetRows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No actions exported to Sheet yet. Click "Add approved to Sheet" in the table above.
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                <span className="font-semibold text-emerald-800 flex items-center space-x-1">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Google Sheet: "Meeting Action Items Tracker" &bull; Tab: "Action Items"</span>
                </span>
                <span className="text-[11px] text-slate-400">Auto-saved to cloud</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-inner bg-slate-50/30">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-200 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-300">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Meeting Name</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Action Item</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Owner</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Due Date</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Status</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Source Quote</th>
                      <th className="py-2.5 px-3">Exported At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {syncedSheetRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/20 font-mono text-[11px]">
                        <td className="py-2 px-3 text-slate-400 border-r border-slate-200">{idx + 1}</td>
                        <td className="py-2 px-3 text-slate-800 border-r border-slate-200 whitespace-nowrap font-sans font-medium">
                          {row.meetingName}
                        </td>
                        <td className="py-2 px-3 text-slate-900 border-r border-slate-200 font-sans font-semibold max-w-xs truncate">
                          {row.task}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              row.owner === 'Missing'
                                ? 'bg-amber-100 text-amber-800 font-sans'
                                : 'bg-slate-100 text-slate-800 font-sans font-medium'
                            }`}
                          >
                            {row.owner}
                          </span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-slate-700 font-sans">
                          {row.dueDate}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-sans">
                          <span className="text-emerald-700 font-semibold">{row.status}</span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-slate-500 italic font-serif max-w-xs truncate">
                          "{row.quote}"
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[10px] whitespace-nowrap font-sans">
                          {row.addedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Simulated Google Calendar */}
      {activeTab === 'calendar' && (
        <div className="p-4">
          {scheduledEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No calendar events scheduled yet. Select items with confirmed dates and click "Create Calendar events".
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                <span className="font-semibold text-indigo-800 flex items-center space-x-1">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span>Google Calendar: Primary &bull; All-Day Event Entries</span>
                </span>
                <span className="text-[11px] text-slate-400">Synced to calendar schedule</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {scheduledEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 text-xs space-y-2 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                        {evt.dueDate}
                      </span>
                      <span className="text-[11px] text-indigo-700 font-semibold">All Day</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      [Action] {evt.task}
                    </h4>

                    <div className="text-[11px] text-slate-600 pt-1 border-t border-indigo-100 flex items-center justify-between">
                      <span>Owner: <strong>{evt.owner}</strong></span>
                      <span className="text-slate-400 truncate max-w-[120px]">{evt.meetingName}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-indigo-100/60 truncate">
                      "{evt.quote}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
