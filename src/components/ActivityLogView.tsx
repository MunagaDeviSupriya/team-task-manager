import { ActivityLog } from '../types';
import { History, Calendar, User, Info, ArrowUpRight } from 'lucide-react';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  projectId: string;
}

export default function ActivityLogView({ logs, projectId }: ActivityLogViewProps) {
  
  // Format long ISO dates nicely
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">

      {/* Logs Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          Project Revision History Logs
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Chronological tracing of task state mutations, assignments, and structural logs
        </p>
      </div>

      {/* Main Stream list */}
      <div className="bg-slate-900/10 border border-slate-800/60 rounded-2xl p-6 shadow-xl">
        {logs.length === 0 ? (
          <div className="bg-slate-950/40 rounded-xl p-6 border border-slate-800/40 text-center text-slate-400">
            <Info className="w-6 h-6 mx-auto text-slate-600 mb-2" />
            <p className="text-xs italic font-semibold">No operational log files generated for this project yet.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800/80 ml-3.5 pl-6.5 space-y-6">
            {logs.map((log) => {
              return (
                <div key={log.id} className="relative group transition-all">
                  
                  {/* Circle Node Indicator */}
                  <div className="absolute -left-[35px] top-1 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-indigo-500 scale-100 group-hover:scale-125 transition-transform" />

                  {/* Log Card body */}
                  <div className="space-y-1.5 pl-0.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold font-mono text-slate-300 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {log.userName}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 leading-relaxed font-normal">
                      <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{log.action}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
