/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import {
  FileText,
  TableProperties,
  Calendar,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FlaskConical,
  HelpCircle,
  Clock,
  Layers,
  Edit3,
} from 'lucide-react';

import {
  ExtractedMeetingData,
  ActionItem,
  DecisionItem,
  OpenQuestionItem,
  GoogleDriveFile,
} from './types/index';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebase';
import {
  listGoogleDocs,
  fetchGoogleDoc,
  listGoogleSheets,
  createMeetingActionSheet,
  appendActionItemsToSheet,
  createCalendarEventsForActions,
} from './services/workspace';
import { SAMPLE_DOC_PRESETS, SampleDocPreset } from './services/sampleData';

import { Header } from './components/Header';
import { DocSelector } from './components/DocSelector';
import { ActionItemsTable } from './components/ActionItemsTable';
import { DecisionsList } from './components/DecisionsList';
import { OpenQuestionsList } from './components/OpenQuestionsList';
import { SheetExportModal } from './components/SheetExportModal';
import { CalendarExportModal } from './components/CalendarExportModal';
import { SimulatedWorkspaceView } from './components/SimulatedWorkspaceView';

export default function App() {
  // Mode: Sample mode by default so recruiters can test in 3 minutes without setup
  const [isSampleMode, setIsSampleMode] = useState<boolean>(true);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Live Workspace Data
  const [driveDocs, setDriveDocs] = useState<GoogleDriveFile[]>([]);
  const [isLoadingDriveDocs, setIsLoadingDriveDocs] = useState<boolean>(false);
  const [existingSheets, setExistingSheets] = useState<GoogleDriveFile[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState<boolean>(false);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [customDocUrl, setCustomDocUrl] = useState<string>('');

  // Sample Mode Presets
  const [selectedSamplePreset, setSelectedSamplePreset] = useState<SampleDocPreset>(
    SAMPLE_DOC_PRESETS[0]
  );

  // Core Extracted Data State
  const [extractedData, setExtractedData] = useState<ExtractedMeetingData | null>(
    SAMPLE_DOC_PRESETS[0].precomputedExtraction
  );
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // Selection & Modal States
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState<boolean>(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [isExportingSheet, setIsExportingSheet] = useState<boolean>(false);
  const [isSchedulingCalendar, setIsSchedulingCalendar] = useState<boolean>(false);

  // Active review tab
  const [activeTab, setActiveTab] = useState<'actions' | 'decisions' | 'questions'>('actions');

  // Simulated Outputs for Sample Mode
  const [simulatedSheetRows, setSimulatedSheetRows] = useState<
    Array<{
      meetingName: string;
      meetingDate: string;
      task: string;
      owner: string;
      dueDate: string;
      status: string;
      quote: string;
      addedAt: string;
    }>
  >([]);
  const [simulatedCalendarEvents, setSimulatedCalendarEvents] = useState<
    Array<{
      task: string;
      owner: string;
      dueDate: string;
      meetingName: string;
      quote: string;
    }>
  >([]);

  // Feedback State
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
    url?: string;
    urlLabel?: string;
  } | null>(null);

  // 1. Initialize Auth on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        // Load drive docs when authenticated
        loadUserWorkspaceFiles(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Helper to load user's Google Docs and Sheets
  const loadUserWorkspaceFiles = async (token: string) => {
    setIsLoadingDriveDocs(true);
    setIsLoadingSheets(true);
    setError(null);
    try {
      const [docs, sheets] = await Promise.all([
        listGoogleDocs(token).catch((err) => {
          console.error('Error listing docs:', err);
          return [];
        }),
        listGoogleSheets(token).catch((err) => {
          console.error('Error listing sheets:', err);
          return [];
        }),
      ]);
      setDriveDocs(docs);
      setExistingSheets(sheets);
    } catch (err: any) {
      setError(`Google Drive connection error: ${err.message}`);
    } finally {
      setIsLoadingDriveDocs(false);
      setIsLoadingSheets(false);
    }
  };

  // Google Sign-In Trigger
  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setIsSampleMode(false); // Switch to live on sign-in
        await loadUserWorkspaceFiles(res.accessToken);
        showToast('success', `Signed in as ${res.user.displayName || res.user.email}`);
      }
    } catch (err: any) {
      setError(`Sign-in failed: ${err.message || 'Popup closed or blocked'}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setDriveDocs([]);
    setExistingSheets([]);
    showToast('info', 'Signed out from Google Workspace');
  };

  const showToast = (
    type: 'success' | 'info' | 'error',
    text: string,
    url?: string,
    urlLabel?: string
  ) => {
    setToastMessage({ type, text, url, urlLabel });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 6000);
  };

  // Extraction via Backend Server API
  const performServerExtraction = async (
    text: string,
    docTitle: string,
    docId?: string,
    docUrl?: string
  ) => {
    setIsExtracting(true);
    setError(null);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, docTitle }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.ok) {
        throw new Error(resData.error || 'Server extraction request failed');
      }

      const raw = resData.data;

      // Transform into our internal data model with IDs, approval defaults, and source links
      const sourceLink = docUrl || (docId ? `https://docs.google.com/document/d/${docId}/edit` : undefined);

      const transformed: ExtractedMeetingData = {
        meetingName: raw.meetingName || docTitle || 'Extracted Meeting',
        meetingDate: raw.meetingDate || 'Missing',
        sourceDocId: docId,
        sourceDocTitle: docTitle,
        sourceDocUrl: sourceLink,
        rawText: text,
        decisions: (raw.decisions || []).map((d: any, idx: number) => ({
          id: `dec-${Date.now()}-${idx}`,
          decision: d.decision,
          rationale: d.rationale || '',
          quote: d.quote,
          sourceLink,
        })),
        actionItems: (raw.actionItems || []).map((a: any, idx: number) => ({
          id: `act-${Date.now()}-${idx}`,
          task: a.task,
          owner: a.owner || 'Missing',
          dueDate: a.dueDate || 'Missing',
          quote: a.quote,
          sourceLink,
          approved: false, // User must explicitly approve to sync to Sheet
          syncedToSheet: false,
          syncedToCalendar: false,
        })),
        openQuestions: (raw.openQuestions || []).map((q: any, idx: number) => ({
          id: `oq-${Date.now()}-${idx}`,
          question: q.question,
          context: q.context || '',
          quote: q.quote,
          sourceLink,
        })),
      };

      setExtractedData(transformed);
      setSelectedCalendarIds([]);
      showToast('success', `Extracted ${transformed.actionItems.length} actions & ${transformed.decisions.length} decisions from "${transformed.meetingName}"`);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(`Extraction error: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  // Live Google Doc Extraction
  const handleExtractLiveDoc = async (docIdOrUrl: string) => {
    if (!accessToken) {
      setError('Please sign in with Google to fetch Google Docs.');
      return;
    }

    setIsExtracting(true);
    setError(null);
    try {
      const { title, text, webViewLink } = await fetchGoogleDoc(accessToken, docIdOrUrl);
      await performServerExtraction(text, title, docIdOrUrl, webViewLink);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Google Doc');
      setIsExtracting(false);
    }
  };

  // Sample Mode Precomputed Load
  const handleLoadPrecomputedSample = () => {
    setExtractedData(JSON.parse(JSON.stringify(selectedSamplePreset.precomputedExtraction)));
    setSelectedCalendarIds([]);
    showToast(
      'info',
      `Loaded demo fixture for "${selectedSamplePreset.title}". Ready for review & export!`
    );
  };

  // Sample Mode Live AI Extract
  const handleExtractSampleWithAI = async (rawText: string, title: string) => {
    await performServerExtraction(
      rawText,
      title,
      selectedSamplePreset.id,
      selectedSamplePreset.sourceDocUrl
    );
  };

  // Update Action Item
  const handleUpdateActionItem = (id: string, updates: Partial<ActionItem>) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      actionItems: extractedData.actionItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  // Delete Action Item
  const handleDeleteActionItem = (id: string) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      actionItems: extractedData.actionItems.filter((item) => item.id !== id),
    });
    setSelectedCalendarIds((prev) => prev.filter((calId) => calId !== id));
  };

  // Add Action Item
  const handleAddActionItem = () => {
    if (!extractedData) return;
    const newItem: ActionItem = {
      id: `act-manual-${Date.now()}`,
      task: 'New actionable task',
      owner: 'Missing',
      dueDate: 'Missing',
      quote: 'Manually added during review',
      sourceLink: extractedData.sourceDocUrl,
      approved: false,
      syncedToSheet: false,
      syncedToCalendar: false,
    };
    setExtractedData({
      ...extractedData,
      actionItems: [newItem, ...extractedData.actionItems],
    });
  };

  // Update Decision
  const handleUpdateDecision = (id: string, updates: Partial<DecisionItem>) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      decisions: extractedData.decisions.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  // Delete Decision
  const handleDeleteDecision = (id: string) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      decisions: extractedData.decisions.filter((item) => item.id !== id),
    });
  };

  // Add Decision
  const handleAddDecision = () => {
    if (!extractedData) return;
    const newDec: DecisionItem = {
      id: `dec-manual-${Date.now()}`,
      decision: 'New agreed decision',
      rationale: '',
      quote: 'Manually added during review',
      sourceLink: extractedData.sourceDocUrl,
    };
    setExtractedData({
      ...extractedData,
      decisions: [newDec, ...extractedData.decisions],
    });
  };

  // Update Question
  const handleUpdateQuestion = (id: string, updates: Partial<OpenQuestionItem>) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      openQuestions: extractedData.openQuestions.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  // Delete Question
  const handleDeleteQuestion = (id: string) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      openQuestions: extractedData.openQuestions.filter((item) => item.id !== id),
    });
  };

  // Add Question
  const handleAddQuestion = () => {
    if (!extractedData) return;
    const newQ: OpenQuestionItem = {
      id: `oq-manual-${Date.now()}`,
      question: 'New open question or unresolved debate',
      context: '',
      quote: 'Manually added during review',
      sourceLink: extractedData.sourceDocUrl,
    };
    setExtractedData({
      ...extractedData,
      openQuestions: [newQ, ...extractedData.openQuestions],
    });
  };

  // Calendar Selection Controls
  const handleToggleSelectCalendar = (id: string) => {
    setSelectedCalendarIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllCalendar = () => {
    if (!extractedData) return;
    if (selectedCalendarIds.length === extractedData.actionItems.length) {
      setSelectedCalendarIds([]);
    } else {
      setSelectedCalendarIds(extractedData.actionItems.map((i) => i.id));
    }
  };

  // Confirm Google Sheets Export (Live or Sample)
  const handleConfirmSheetExport = async (config: {
    mode: 'new' | 'existing';
    newSheetTitle?: string;
    existingSheetId?: string;
  }) => {
    if (isExportingSheet) return;
    if (!extractedData) return;
    const actionsToSync = extractedData.actionItems.filter(
      (item) => item.approved && !item.syncedToSheet
    );

    if (actionsToSync.length === 0) {
      showToast('info', 'No approved, un-synced action items to export.');
      setIsSheetModalOpen(false);
      return;
    }

    setIsExportingSheet(true);
    setError(null);

    try {
      if (isSampleMode) {
        // Sample Mode: Simulate Sheet Append & Update Simulated View
        await new Promise((r) => setTimeout(r, 800)); // Realism latency

        const newSimulatedRows = actionsToSync.map((item) => ({
          meetingName: extractedData.meetingName,
          meetingDate: extractedData.meetingDate,
          task: item.task,
          owner: item.owner,
          dueDate: item.dueDate,
          status: 'Approved',
          quote: item.quote,
          addedAt: new Date().toLocaleTimeString(),
        }));

        setSimulatedSheetRows((prev) => [...prev, ...newSimulatedRows]);

        // Mark items as synced to prevent duplicate rows
        setExtractedData({
          ...extractedData,
          actionItems: extractedData.actionItems.map((item) =>
            actionsToSync.some((s) => s.id === item.id)
              ? { ...item, syncedToSheet: true }
              : item
          ),
        });

        setIsSheetModalOpen(false);
        showToast(
          'success',
          `Exported ${actionsToSync.length} approved actions to Sheet (Demo Mode preview updated below!)`
        );
      } else {
        // LIVE Google Sheets API Mode
        if (!accessToken) {
          throw new Error('Please sign in with Google to export to Google Sheets.');
        }

        let targetSpreadsheetId = config.existingSheetId;
        let sheetUrl = '';

        if (config.mode === 'new') {
          const created = await createMeetingActionSheet(
            accessToken,
            config.newSheetTitle || `Meeting Actions - ${extractedData.meetingName}`
          );
          targetSpreadsheetId = created.spreadsheetId;
          sheetUrl = created.spreadsheetUrl;
        }

        if (!targetSpreadsheetId) {
          throw new Error('Please select or specify a valid Google Spreadsheet.');
        }

        const appendResult = await appendActionItemsToSheet(
          accessToken,
          targetSpreadsheetId,
          extractedData.meetingName,
          extractedData.meetingDate,
          actionsToSync
        );

        sheetUrl = appendResult.spreadsheetUrl;

        // Mark items as synced in state
        setExtractedData({
          ...extractedData,
          actionItems: extractedData.actionItems.map((item) =>
            actionsToSync.some((s) => s.id === item.id)
              ? { ...item, syncedToSheet: true }
              : item
          ),
        });

        setIsSheetModalOpen(false);
        showToast(
          'success',
          `Successfully exported ${actionsToSync.length} row(s) to Google Sheets!`,
          sheetUrl,
          'Open Google Sheet'
        );
      }
    } catch (err: any) {
      console.error('Sheet export failed:', err);
      setError(`Google Sheets export error: ${err.message}`);
    } finally {
      setIsExportingSheet(false);
    }
  };

  // Confirm Google Calendar Scheduling (Live or Sample)
  const handleConfirmCalendarSchedule = async () => {
    if (isSchedulingCalendar) return;
    if (!extractedData) return;
    const actionsToSchedule = extractedData.actionItems.filter((i) =>
      selectedCalendarIds.includes(i.id)
    );

    // Strict validation
    const missingDates = actionsToSchedule.filter(
      (i) => !i.dueDate || i.dueDate === 'Missing' || i.dueDate.trim() === ''
    );
    if (missingDates.length > 0) {
      setError(
        `Cannot create Calendar events: ${missingDates.length} item(s) have a Missing date. Set a date in the table first.`
      );
      setIsCalendarModalOpen(false);
      return;
    }

    setIsSchedulingCalendar(true);
    setError(null);

    try {
      if (isSampleMode) {
        // Sample Mode: Simulate Calendar Event Creation
        await new Promise((r) => setTimeout(r, 800));

        const newSimulatedEvents = actionsToSchedule.map((item) => ({
          task: item.task,
          owner: item.owner,
          dueDate: item.dueDate,
          meetingName: extractedData.meetingName,
          quote: item.quote,
        }));

        setSimulatedCalendarEvents((prev) => [...prev, ...newSimulatedEvents]);

        // Mark as synced to Calendar
        setExtractedData({
          ...extractedData,
          actionItems: extractedData.actionItems.map((item) =>
            actionsToSchedule.some((s) => s.id === item.id)
              ? { ...item, syncedToCalendar: true }
              : item
          ),
        });

        setIsCalendarModalOpen(false);
        showToast(
          'success',
          `Scheduled ${actionsToSchedule.length} deadline event(s) in Calendar (Demo preview updated below!)`
        );
      } else {
        // LIVE Google Calendar API Mode
        if (!accessToken) {
          throw new Error('Please sign in with Google to create Google Calendar events.');
        }

        const scheduled = await createCalendarEventsForActions(
          accessToken,
          extractedData.meetingName,
          actionsToSchedule
        );

        // Mark as scheduled in state
        setExtractedData({
          ...extractedData,
          actionItems: extractedData.actionItems.map((item) =>
            actionsToSchedule.some((s) => s.id === item.id)
              ? { ...item, syncedToCalendar: true }
              : item
          ),
        });

        setIsCalendarModalOpen(false);
        showToast(
          'success',
          `Successfully created ${scheduled.length} event(s) in Google Calendar!`,
          'https://calendar.google.com',
          'Open Google Calendar'
        );
      }
    } catch (err: any) {
      console.error('Calendar scheduling failed:', err);
      setError(`Google Calendar scheduling error: ${err.message}`);
    } finally {
      setIsSchedulingCalendar(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. App Header */}
      <Header
        user={user}
        isSampleMode={isSampleMode}
        onToggleSampleMode={(mode) => {
          setIsSampleMode(mode);
          if (mode && !extractedData) {
            setExtractedData(SAMPLE_DOC_PRESETS[0].precomputedExtraction);
          }
        }}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSigningIn={isSigningIn}
        driveConnected={!!accessToken}
        sheetsConnected={!!accessToken}
        calendarConnected={!!accessToken}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-800'
                : toastMessage.type === 'error'
                ? 'bg-red-900 text-white border-red-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
            {toastMessage.url && (
              <a
                href={toastMessage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-emerald-300 hover:text-white font-bold ml-2 inline-flex items-center space-x-1"
              >
                <span>{toastMessage.urlLabel || 'Open'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recruiter / Quick Demo Guide Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                3-Minute Recruiter Demo
              </span>
              <h1 className="font-bold text-sm sm:text-base">
                Meeting Decision Tracker — Google Workspace AI Intelligence
              </h1>
            </div>
            <p className="text-xs text-indigo-200/90 leading-relaxed max-w-3xl">
              Extracts decisions actually agreed upon, action items with strict owner/date checks (marking Missing when not stated), and open questions.
              Supports real Google Docs, Sheets, Calendar sync, and sample mode with instant preview!
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="text-xs text-indigo-300 hidden sm:inline">
              Mode:
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                isSampleMode
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                  : 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
              }`}
            >
              {isSampleMode ? 'Sample Data Mode' : 'Connected to Google'}
            </span>
          </div>
        </div>

        {/* 2. Document Selection Component */}
        <DocSelector
          isSampleMode={isSampleMode}
          userAuthenticated={!!accessToken}
          onSignIn={handleSignIn}
          driveDocs={driveDocs}
          isLoadingDriveDocs={isLoadingDriveDocs}
          onRefreshDriveDocs={() => accessToken && loadUserWorkspaceFiles(accessToken)}
          onSelectDriveDoc={(file) => {
            setSelectedDocId(file.id);
            setCustomDocUrl(file.webViewLink || '');
            handleExtractLiveDoc(file.id);
          }}
          selectedDocId={selectedDocId}
          customDocUrl={customDocUrl}
          onCustomDocUrlChange={setCustomDocUrl}
          onExtractLiveDoc={handleExtractLiveDoc}
          selectedSamplePreset={selectedSamplePreset}
          onSelectSamplePreset={setSelectedSamplePreset}
          onLoadPrecomputedSample={handleLoadPrecomputedSample}
          onExtractSampleWithAI={handleExtractSampleWithAI}
          isExtracting={isExtracting}
          error={error}
          onClearError={() => setError(null)}
        />

        {/* 3. Review Workspace (when data is loaded) */}
        {extractedData && (
          <div className="space-y-6">
            {/* Meeting Metadata Banner (Editable) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Meeting Title
                  </span>
                  {extractedData.sourceDocUrl && (
                    <a
                      href={extractedData.sourceDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline ml-2"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Source Google Doc</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="text"
                    value={extractedData.meetingName}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, meetingName: e.target.value })
                    }
                    className="text-lg font-bold text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-indigo-400 rounded-lg px-2 py-1 focus:outline-none flex-1"
                  />

                  <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-500">Date:</span>
                    <input
                      type="text"
                      value={extractedData.meetingDate}
                      onChange={(e) =>
                        setExtractedData({ ...extractedData, meetingDate: e.target.value })
                      }
                      placeholder="Date or Missing"
                      className="bg-transparent font-medium text-slate-800 w-28 focus:outline-none focus:bg-white rounded px-1"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-xs font-bold text-slate-900">
                    {extractedData.decisions.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Decisions</span>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-xs font-bold text-slate-900">
                    {extractedData.actionItems.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Actions</span>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-xs font-bold text-slate-900">
                    {extractedData.openQuestions.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Open Qs</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('actions')}
                className={`pb-3 px-3 transition-colors relative flex items-center space-x-2 ${
                  activeTab === 'actions'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableProperties className="w-4 h-4" />
                <span>Action Items Review Table</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                  {extractedData.actionItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('decisions')}
                className={`pb-3 px-3 transition-colors relative flex items-center space-x-2 ${
                  activeTab === 'decisions'
                    ? 'text-emerald-600 border-b-2 border-emerald-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Decisions Actually Made</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px]">
                  {extractedData.decisions.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className={`pb-3 px-3 transition-colors relative flex items-center space-x-2 ${
                  activeTab === 'questions'
                    ? 'text-amber-600 border-b-2 border-amber-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Open Questions & Discussions</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px]">
                  {extractedData.openQuestions.length}
                </span>
              </button>
            </div>

            {/* Tab Panels */}
            {activeTab === 'actions' && (
              <ActionItemsTable
                actionItems={extractedData.actionItems}
                onUpdateActionItem={handleUpdateActionItem}
                onDeleteActionItem={handleDeleteActionItem}
                onAddActionItem={handleAddActionItem}
                onOpenSheetModal={() => setIsSheetModalOpen(true)}
                onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
                selectedCalendarIds={selectedCalendarIds}
                onToggleSelectCalendar={handleToggleSelectCalendar}
                onSelectAllCalendar={handleSelectAllCalendar}
              />
            )}

            {activeTab === 'decisions' && (
              <DecisionsList
                decisions={extractedData.decisions}
                onUpdateDecision={handleUpdateDecision}
                onDeleteDecision={handleDeleteDecision}
                onAddDecision={handleAddDecision}
              />
            )}

            {activeTab === 'questions' && (
              <OpenQuestionsList
                openQuestions={extractedData.openQuestions}
                onUpdateQuestion={handleUpdateQuestion}
                onDeleteQuestion={handleDeleteQuestion}
                onAddQuestion={handleAddQuestion}
              />
            )}

            {/* 4. Simulated Workspace Output (for sample mode demonstration) */}
            {isSampleMode && (
              <SimulatedWorkspaceView
                syncedSheetRows={simulatedSheetRows}
                scheduledEvents={simulatedCalendarEvents}
              />
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal 1: Google Sheets Export */}
      {extractedData && (
        <SheetExportModal
          isOpen={isSheetModalOpen}
          onClose={() => setIsSheetModalOpen(false)}
          meetingName={extractedData.meetingName}
          meetingDate={extractedData.meetingDate}
          actionsToExport={extractedData.actionItems.filter(
            (item) => item.approved && !item.syncedToSheet
          )}
          existingSheets={existingSheets}
          isLoadingSheets={isLoadingSheets}
          isSampleMode={isSampleMode}
          onConfirmExport={handleConfirmSheetExport}
          isExporting={isExportingSheet}
        />
      )}

      {/* Confirmation Modal 2: Google Calendar Scheduling */}
      {extractedData && (
        <CalendarExportModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          meetingName={extractedData.meetingName}
          selectedActions={extractedData.actionItems.filter((i) =>
            selectedCalendarIds.includes(i.id)
          )}
          onConfirmSchedule={handleConfirmCalendarSchedule}
          isScheduling={isSchedulingCalendar}
        />
      )}
    </div>
  );
}
