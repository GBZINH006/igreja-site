import { createClient } from '@supabase/supabase-js';

// Pegue esses dados em Settings > API no seu painel Supabase
const supabaseUrl = 'https://hcxsmphzsebeaddowcvz.supabase.co';
const supabaseKey = 'sb_publishable_miFUhXV1GAk2HYy70qzvAQ_B0Z8vi3i';

export const supabase = createClient(supabaseUrl, supabaseKey);
