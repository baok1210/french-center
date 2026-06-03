'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { FileText, CheckCircle2, Clock, Send } from 'lucide-react';

export default function AdminReportsPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    const { data } = await supabase
      .from('reports')
      .select('*, profiles!student_id(full_name, student_code)')
      .order('created_at', { ascending: false });
    if (data) setReports(data);
  }

  async function approveReport(reportId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('reports')
      .update({ status: 'approved', reviewed_by: session?.user.id, reviewed_at: new Date().toISOString() })
      .eq('id', reportId);
    loadReports();
  }

  async function sendReport(reportId: string) {
    await supabase.from('reports')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', reportId);
    loadReports();
  }

  const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    draft: { icon: <Clock className="h-4 w-4" strokeWidth={1.5} />, label: 'Nháp', color: 'text-amber-600 bg-amber-50' },
    pending_approval: { icon: <FileText className="h-4 w-4" strokeWidth={1.5} />, label: 'Chờ duyệt', color: 'text-blue-600 bg-blue-50' },
    approved: { icon: <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />, label: 'Đã duyệt', color: 'text-green-600 bg-green-50' },
    sent: { icon: <Send className="h-4 w-4" strokeWidth={1.5} />, label: 'Đã gửi', color: 'text-primary bg-primary/5' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Duyệt báo cáo</h2>
        <p className="text-sm text-muted-foreground">Phê duyệt và gửi báo cáo học tập</p>
      </div>

      <div className="space-y-3">
        {reports.map((report) => {
          const status = statusConfig[report.status] || statusConfig.draft;
          return (
            <div key={report.id}
              className="diffusion-shadow flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-5">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${status.color}`}>
                  {status.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{report.profiles?.full_name} ({report.profiles?.student_code})</p>
                  <p className="text-xs text-muted-foreground">
                    {report.period_start} → {report.period_end}
                    {report.is_weekly ? ' • Hàng tuần' : ' • Cuối tháng'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {report.status === 'pending_approval' && (
                  <button onClick={() => approveReport(report.id)}
                    className="rounded-xl bg-success px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-success/90 ">
                    Phê duyệt
                  </button>
                )}
                {report.status === 'approved' && (
                  <button onClick={() => sendReport(report.id)}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 ">
                    Gửi báo cáo
                  </button>
                )}
                {report.status === 'sent' && (
                  <span className="text-xs font-medium text-success">Đã gửi</span>
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
