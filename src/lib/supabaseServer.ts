import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

// 이 클라이언트는 RLS를 무시하는 관리자용 클라이언트입니다.
// 절대로 클라이언트 사이드 컴포넌트나 브라우저에서 사용해서는 안 됩니다.
// 오직 서버 사이드 코드(API Route, Server Actions)에서만 사용해야 합니다.
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
