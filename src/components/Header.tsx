import React from 'react';
import { User } from 'firebase/auth';
import {
  FileText,
  TableProperties,
  Calendar,
  LogOut,
  Sparkles,
  ShieldCheck,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  isSampleMode: boolean;
  onToggleSampleMode: (sample: boolean) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
  driveConnected: boolean;
  sheetsConnected: boolean;
  calendarConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isSampleMode,
  onToggleSampleMode,
  onSignIn,
  onSignOut,
  isSigningIn,
  driveConnected,
  sheetsConnected,
  calendarConnected,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Portfolio Meta */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  Meeting Decision Tracker
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Portfolio Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Docs extraction &bull; Decisions &bull; Sheets &bull; Calendar sync
              </p>
            </div>
          </div>

          {/* Integration Status Indicators (in live mode) */}
          <div className="hidden md:flex items-center space-x-3 text-xs">
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${
                driveConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
              title="Google Docs & Drive API Status"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Docs</span>
              {driveConnected && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            </div>

            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${
                sheetsConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
              title="Google Sheets API Status"
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Sheets</span>
              {sheetsConnected && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            </div>

            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${
                calendarConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
              title="Google Calendar API Status"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
              {calendarConnected && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            </div>
          </div>

          {/* Right Controls: Mode Toggle & Auth */}
          <div className="flex items-center space-x-3">
            {/* Sample Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => onToggleSampleMode(false)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  !isSampleMode
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Google Live</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onToggleSampleMode(true)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  isSampleMode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Sample Demo</span>
                </span>
              </button>
            </div>

            {/* Auth / User Section */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="flex items-center space-x-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-slate-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-semibold text-slate-900 truncate max-w-[120px]">
                      {user.displayName || 'Signed In'}
                    </p>
                    <p className="text-slate-500 truncate max-w-[120px]">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : !isSampleMode ? (
              /* Google Sign In Button */
              <button
                type="button"
                onClick={onSignIn}
                disabled={isSigningIn}
                className="inline-flex items-center justify-center px-3.5 py-1.5 border border-slate-300 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
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
                <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            ) : (
              <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-medium">
                Sample Mode (Fictional Data)
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
