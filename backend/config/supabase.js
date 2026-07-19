const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://wkhcgqbtzkwhuuurhujc.supabase.co',
  '.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraGNncWJ0emt3aHV1dXJodWpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg0Mzk0MSwiZXhwIjoyMDkyNDE5OTQxfQ.18Ni0Kp5pjayeXcTmiC34q3ohjOEqbvxsFOt9x7U0b0'
)

module.exports = supabase
