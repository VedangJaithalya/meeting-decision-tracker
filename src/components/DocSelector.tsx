import React, { useState } from 'react';
import {
  FileText,
  Search,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  Clock,
  Check,
  Eye,
  FileCode,
  Zap,
} from 'lucide-react';
import { GoogleDriveFile } from '../types';
import { SAMPLE_DOC_PRESETS, SampleDocPreset } from '../services/sampleData';

interface DocSelectorProps {
  isSampleMode: boolean;
  userAuthenticated: boolean;
  onSignIn: () => void;
  // Live Google Doc props
  driveDocs: GoogleDriveFile[];
  isLoadingDriveDocs: boolean;
  onRefreshDriveDocs: () => void;
  onSelectDriveDoc: (file: GoogleDriveFile) => void;
  selectedDocId: string;
  customDocUrl: string;
  onCustomDocUrlChange: (url: string) => void;
  onExtractLiveDoc: (docIdOrUrl: string) => void;
  // Sample mode props
  selectedSamplePreset: SampleDocPreset;
  onSelectSamplePreset: (preset: SampleDocPreset) => void;
  onLoadPrecomputedSample: () => void;
  onExtractSampleWithAI: (rawText: string, title: string) => void;
  // State
  isExtracting: boolean;
  error: string | null;
  onClearError: () => void;
}

export const DocSelector: React.FC<DocSelectorProps> = ({
  isSampleMode,
  userAuthenticated,
  onSignIn,
  driveDocs,
  isLoadingDriveDocs,
  onRefreshDriveDocs,
  onSelectDriveDoc,
  selectedDocId,
  customDocUrl,
  onCustomDocUrlChange,
  onExtractLiveDoc,
  selectedSamplePreset,
  onSelectSamplePreset,
  onLoadPrecomputedSample,
  onExtractSampleWithAI,
  isExtracting,
  error,
  onClearError,
}) => {
  const [showRawSampleText, setShowRawSampleText] = useState(false);
  const [editableSampleText, setEditableSampleText] = useState(selectedSamplePreset.rawText);

  // Keep editable text in sync when preset changes
  const handlePresetChange = (preset: SampleDocPreset) => {
    onSelectSamplePreset(preset);
    setEditableSampleText(preset.rawText);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8 transition-all">
      {/* Useful Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm text-red-900">Workspace Operation Notice</h4>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">{error}</p>
              <p className="text-xs text-red-600/80 mt-1.5 italic">
                Note: Real Google connection failures are not masked with fake sample data.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearError}
            className="text-xs font-medium text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-100 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {isSampleMode ? (
        /* SAMPLE DATA MODE CONTROLS */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                  Sample Data Mode
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Select Fictional Meeting Notes
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Demonstrate the entire extraction, review table, and export workflow without connecting your Google account.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowRawSampleText(!showRawSampleText)}
                className="text-xs inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{showRawSampleText ? 'Hide Notes Text' : 'View / Edit Raw Notes'}</span>
              </button>
            </div>
          </div>

          {/* Preset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {SAMPLE_DOC_PRESETS.map((preset) => {
              const isSelected = selectedSamplePreset.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handlePresetChange(preset)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all text-left relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="text-xs text-slate-500">{preset.date}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1 leading-snug">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                    {preset.description}
                  </p>
                  <div className="text-[11px] font-mono text-indigo-700 bg-white/80 px-2 py-1 rounded border border-indigo-100 inline-block">
                    {preset.precomputedExtraction.actionItems.length} actions &bull; {preset.precomputedExtraction.decisions.length} decisions
                  </div>
                </div>
              );
            })}
          </div>

          {/* Raw Notes Viewer/Editor (if toggled) */}
          {showRawSampleText && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <span>Source Meeting Notes Content (Editable)</span>
                </label>
                <span className="text-xs text-slate-400">
                  {editableSampleText.length} characters
                </span>
              </div>
              <textarea
                value={editableSampleText}
                onChange={(e) => setEditableSampleText(e.target.value)}
                rows={8}
                className="w-full text-xs font-mono p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
                placeholder="Paste or write meeting notes here..."
              />
              <p className="text-[11px] text-slate-500 mt-1">
                You can edit these notes directly before extracting to test custom edge cases (e.g. actions with no owner or discussions without decisions).
              </p>
            </div>
          )}

          {/* Action Buttons for Sample Mode */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isExtracting}
              onClick={onLoadPrecomputedSample}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Load Instant Demo Fixture</span>
            </button>

            <button
              type="button"
              disabled={isExtracting}
              onClick={() =>
                onExtractSampleWithAI(editableSampleText, selectedSamplePreset.title)
              }
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {isExtracting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-200" />
              )}
              <span>{isExtracting ? 'Analyzing with Gemini...' : 'Run Server-Side AI Extraction'}</span>
            </button>

            <span className="text-xs text-slate-400 pl-2">
              Uses server-side Gemini 3.8 Flash to strictly parse decisions, actions, and quotes.
            </span>
          </div>
        </div>
      ) : (
        /* LIVE GOOGLE WORKSPACE MODE CONTROLS */
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Google Workspace Connected
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Select Google Doc Meeting Notes
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose a document from your Google Drive or paste a Google Doc share URL.
              </p>
            </div>

            {userAuthenticated && (
              <button
                type="button"
                onClick={onRefreshDriveDocs}
                disabled={isLoadingDriveDocs}
                className="text-xs inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                title="Refresh Google Docs list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDriveDocs ? 'animate-spin' : ''}`} />
                <span>Refresh Docs</span>
              </button>
            )}
          </div>

          {!userAuthenticated ? (
            /* Sign-in prompt */
            <div className="text-center py-8 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-300">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Connect your Google Account to access Google Docs
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                Meeting Decision Tracker requires permission to read your Google Docs and sync approved items to Sheets and Calendar.
              </p>
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Sign in with Google to Select Docs</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Option A: Select from Drive */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Recent Google Docs in Drive:
                </label>
                {isLoadingDriveDocs ? (
                  <div className="flex items-center space-x-2 py-3 text-xs text-slate-500">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Loading documents from Google Drive...</span>
                  </div>
                ) : driveDocs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {driveDocs.map((doc) => {
                      const isSelected = selectedDocId === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => onSelectDriveDoc(doc)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <FileText
                              className={`w-4 h-4 mt-0.5 ${
                                isSelected ? 'text-indigo-600' : 'text-slate-400'
                              }`}
                            />
                            {doc.webViewLink && (
                              <a
                                href={doc.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-slate-600"
                                title="Open in Google Docs"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <p className="font-semibold text-xs text-slate-900 mt-2 truncate">
                            {doc.name}
                          </p>
                          {doc.modifiedTime && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Modified {new Date(doc.modifiedTime).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-2">
                    No recent Google Docs found in your Google Drive. You can paste a Doc URL below!
                  </p>
                )}
              </div>

              {/* Option B: Direct URL / ID */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Or Paste Google Doc URL / ID:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customDocUrl}
                      onChange={(e) => onCustomDocUrlChange(e.target.value)}
                      placeholder="https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                      className="w-full text-xs p-2.5 pl-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isExtracting || (!selectedDocId && !customDocUrl.trim())}
                    onClick={() => onExtractLiveDoc(customDocUrl || selectedDocId)}
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                    )}
                    <span>{isExtracting ? 'Extracting...' : 'Fetch & Extract'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
