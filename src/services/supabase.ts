function getRequiredClientEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY') {
  const value = import.meta.env[name] as string | undefined;
  if (!value?.trim()) {
    throw new Error(`Missing ${name}. Configure the Villa Floyd Supabase connection before building the site.`);
  }
  return value.trim();
}

export function getFunctionUrl(slug: string) {
  return `${getRequiredClientEnv('VITE_SUPABASE_URL').replace(/\/$/, '')}/functions/v1/${slug}`;
}

export function getFunctionHeaders() {
  const anonKey = getRequiredClientEnv('VITE_SUPABASE_ANON_KEY');
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  };
}
