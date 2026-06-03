import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { student_id, period_start, period_end, is_weekly } = await req.json();

  // Simulate report generation
  const reportUrl = `/reports/${student_id}/${period_start}_${period_end}.pdf`;

  const { data, error } = await supabase.from('reports').insert({
    student_id,
    report_url: reportUrl,
    period_start,
    period_end,
    is_weekly: is_weekly ?? true,
    status: 'pending_approval',
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Simulate sending notification
  console.log(`[MOCK] Notification sent to student ${student_id}: Report ready at ${reportUrl}`);

  return NextResponse.json({ report: data, notification: 'simulated' });
}

export async function GET() {
  const supabase = await createServerSupabase();

  // Simulate cron: generate reports for all students with evaluations this week
  const { data: students } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'Student');

  if (!students) return NextResponse.json({ reports: [] });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const periodStart = weekStart.toISOString().slice(0, 10);
  const periodEnd = new Date().toISOString().slice(0, 10);

  const reports = [];
  for (const student of students) {
    const { data: report } = await supabase.from('reports').insert({
      student_id: student.id,
      report_url: `/reports/${student.id}/${periodStart}_${periodEnd}.pdf`,
      period_start: periodStart,
      period_end: periodEnd,
      is_weekly: true,
      status: 'pending_approval',
    }).select().single();

    if (report) {
      reports.push(report);
      console.log(`[MOCK CRON] Report generated for ${student.id}`);
    }
  }

  return NextResponse.json({ reports, generated: reports.length, period: { periodStart, periodEnd } });
}
