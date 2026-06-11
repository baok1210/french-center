'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { isDemoMode, loadDemoReports, updateDemoReport } from '@/data/admin-store';
import { FileText, CheckCircle2, Clock, Send } from 'lucide-react';

export default function AdminReportsPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<any[]>([]);
  const demo = isDemoMode();

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    if (demo) {
      setReports(loadDemoReports());
      return;
    }
    const { data } = await supabase
      .from('reports')
      .select('*, profiles!student_id(full_name, student_code)')
      .order('created_at', { ascending: false });
    if (data) setReports(data);
  }

  async function approveReport(reportId: string) {
    if (demo) {
      updateDemoReport(reportId, { status: 'approved', reviewed_at: new Date().toISOString() });
      loadReports();
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('reports')
      .update({ status: 'approved', reviewed_by: session?.user.id, reviewed_at: new Date().toISOString() })
      .eq('id', reportId);
    loadReports();
  }

  async function sendReport(reportId: string) {
    if (demo) {
      updateDemoReport(reportId, { status: 'sent', sent_at: new Date().toISOString() });
      loadReports();
      return;
    }
    await supabase.from('reports')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', reportId);
    loadReports();
  }

  const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    draft: { icon: <Clock className="h-4 w-4" strokeWidth={1.5} />, label: 'Nháp', color: 'text-warning bg-warning/10' },
    pending_approval: { icon: <FileText className="h-4 w-4" strokeWidth={1.5} />, label: 'Chờ duyệt', color: 'text-primary bg-primary/10' },
    approved: { icon: <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />, label: 'Đã duyệt', color: 'text-success bg-success/10' },
    sent: { icon: <Send className="h-4 w-4" strokeWidth={1.5} />, label: 'Đã gửi', color: 'text-muted-foreground bg-muted/50' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Duyệt báo cáo</h2>
        <p className="text-sm text-muted-foreground">Phê duyệt và gửi báo cáo học tập</p>
      </div>

      <div className="space-y-3">
        {reports.map((rpt: any) => {
          const status = statusConfig[rpt.status] || statusConfig.draft;
          return (
            <div key={rpt.id}
              className="diffusion-shadow flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-5">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{rpt.student_name || rpt.profiles?.full_name || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">
                    {rpt.student_code || rpt.profiles?.student_code || ''} — {rpt.period_start} → {rpt.period_end}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${status.color}`}>
                  {status.icon} {status.label}
                </span>
                {rpt.status === 'draft' && (
                  <button onClick={() => approveReport(rpt.id)}
                    className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                    Duyệt
                  </button>
                )}
                {rpt.status === 'approved' && (
                  <button onClick={() => sendReport(rpt.id)}
                    className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/20">
                    Gửi
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {reports.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">Chưa có báo cáo nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
