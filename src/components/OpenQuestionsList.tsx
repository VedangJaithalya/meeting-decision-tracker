import React from 'react';
import {
  HelpCircle,
  Trash2,
  Plus,
  ExternalLink,
  Quote,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { OpenQuestionItem } from '../types/index';

interface OpenQuestionsListProps {
  openQuestions: OpenQuestionItem[];
  onUpdateQuestion: (id: string, updates: Partial<OpenQuestionItem>) => void;
  onDeleteQuestion: (id: string) => void;
  onAddQuestion: () => void;
}

export const OpenQuestionsList: React.FC<OpenQuestionsListProps> = ({
  openQuestions,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestion,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 text-base">
              Open Questions & Undecided Discussions
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              {openQuestions.length} open
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unanswered questions, missing information, and debated topics that ended without a decision.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddQuestion}
          className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Question</span>
        </button>
      </div>

      {openQuestions.length === 0 ? (
        <div className="p-10 text-center text-slate-400 text-xs">
          No open questions or unresolved debates detected.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {openQuestions.map((item) => (
            <div key={item.id} className="p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* Question / Debate Topic */}
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) =>
                        onUpdateQuestion(item.id, { question: e.target.value })
                      }
                      className="w-full text-sm font-semibold text-slate-900 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-amber-400 rounded-lg p-1.5 focus:outline-none"
                    />

                    {/* Context / Why undecided */}
                    <div className="flex items-start space-x-2 text-xs text-slate-600 pl-1.5">
                      <span className="font-semibold text-slate-500 shrink-0 mt-1">Debate / Context:</span>
                      <textarea
                        value={item.context || ''}
                        rows={2}
                        placeholder="Context regarding debate or missing information..."
                        onChange={(e) =>
                          onUpdateQuestion(item.id, { context: e.target.value })
                        }
                        className="w-full text-xs text-slate-700 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-amber-300 rounded p-1 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Source Quote & Document Link */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                        <Quote className="w-3.5 h-3.5" />
                        <span className="font-medium">Source Quote</span>
                      </div>
                      <p className="italic text-slate-800 font-serif">
                        "{item.quote || 'No quote specified'}"
                      </p>
                      {item.sourceLink && (
                        <div className="pt-1">
                          <a
                            href={item.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                          >
                            <span>Verify in Source Document</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onDeleteQuestion(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
