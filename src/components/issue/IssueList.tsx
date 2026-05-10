import { SystemIssue } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface Props {
  issues: SystemIssue[];
}

export function IssueList({ issues }: Props) {
  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <div key={issue.id}
          className={`border rounded-2xl p-4 flex gap-4 items-start ${
            issue.type === 'error' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
          }`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            issue.type === 'error' ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            {issue.type === 'error' ? (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  issue.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                }`}>{issue.type === 'error' ? 'ERROR' : 'WARNING'}</span>
                <span className="ml-2 text-xs text-slate-400 font-medium">{issue.source}</span>
              </div>
              <p className="text-[10px] text-slate-400 flex-shrink-0">{formatDateTime(issue.timestamp)}</p>
            </div>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">{issue.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyIssue() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p className="text-slate-700 font-semibold text-base">Tidak ada issue</p>
      <p className="text-slate-400 text-sm mt-1">Sistem berjalan normal. Semua komponen sehat.</p>
    </div>
  );
}
