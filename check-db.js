const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
  const parts = line.split('=');
  if(parts.length >= 2) {
    const k = parts.shift().trim();
    let v = parts.join('=').trim();
    if(v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if(v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    envVars[k] = v;
  }
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const { data, error } = await supabase.from('responses').select('id, is_complete, section_timestamps').eq('is_complete', false).order('created_at', { ascending: false }).limit(1);
  if(error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
check();
