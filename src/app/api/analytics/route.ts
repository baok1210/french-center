import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');

  if (!studentId) {
    return NextResponse.json({ error: 'Missing student_id' }, { status: 400 });
  }

  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('*')
    .eq('student_id', studentId)
    .order('session_date', { ascending: false });

  const { data: gaps } = await supabase
    .from('knowledge_gaps')
    .select('*')
    .eq('student_id', studentId)
    .eq('is_resolved', false);

  return NextResponse.json({
    evaluations,
    knowledgeGaps: gaps ?? [],
  });
}
