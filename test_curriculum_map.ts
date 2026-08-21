import { createClient } from '@supabase/supabase-js';

const url = 'https://qlfleszoyujelygwzdgu.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZmxlc3pveXVqZWx5Z3d6ZGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ2MDQ0MywiZXhwIjoyMTAyMDM2NDQzfQ.l98xUMY90bPZ1wLlTee9WJN_dKPN705aDZFtIA9ul7c';

const supabase = createClient(url, key);

async function inspectCurriculumMapping() {
  const { data: rows } = await supabase
    .from('educational_data')
    .select('id, file_name, subject_id, content')
    .eq('section_id', 'curriculum')
    .limit(20);

  console.log('--- Inspecting curriculum rows ---');
  for (const r of rows || []) {
    const info = r.content?.lesson_info;
    const pages = r.content?.pages || [];
    const itemsCount = pages.reduce((acc: number, p: any) => acc + (p.items?.length || 0), 0);
    console.log(`File: ${r.file_name} | subject_id: ${r.subject_id}`);
    console.log(`  lesson_info:`, info);
    console.log(`  pages: ${pages.length}, total items: ${itemsCount}`);
  }
}

inspectCurriculumMapping().catch(console.error);
