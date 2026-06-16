import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wkhcgqbtzkwhuuurhujc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraGNncWJ0emt3aHV1dXJodWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDM5NDEsImV4cCI6MjA5MjQxOTk0MX0.2uYhRMRYdIWXPh0oAW1vB-O2kHATcdBS9NgY2Ueoacw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
