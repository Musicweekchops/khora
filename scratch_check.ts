import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Searching for Vannesa Mendoza...');
  
  // First, find the user
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .ilike('nombre', '%Vannesa%');
    
  if (userError) {
    console.error('Error fetching users:', userError);
  }
  
  let foundUsers = users || [];

  if (foundUsers.length === 0) {
    // try last name
    const { data: usersByLastName } = await supabase
      .from('users')
      .select('*')
      .ilike('apellidos', '%Mendoza%');
      
    if (usersByLastName && usersByLastName.length > 0) {
        foundUsers = usersByLastName;
    } else {
        const { data: rawUsers } = await supabase.from('users').select('*').ilike('name', '%Vannesa Mendoza%');
        if (rawUsers && rawUsers.length > 0) foundUsers = rawUsers;
    }
  }
  
  if (foundUsers.length === 0) {
      console.log('No user found in "users" table. Let us check "alumnos" or "students"');
      const { data: alumnos } = await supabase.from('alumnos').select('*').ilike('nombre', '%Vannesa%');
      if (alumnos && alumnos.length > 0) foundUsers = alumnos;
  }

  console.log('Users found:', foundUsers);

  for (const user of foundUsers) {
      await checkUserClasses(user);
  }
}

async function checkUserClasses(user: any) {
  console.log(`\nChecking classes for user ID: ${user.id}`);
  
  const { data: classes, error: classesError } = await supabase
    .from('clases')
    .select('*')
    .eq('alumno_id', user.id);
    
  if (classesError) {
     console.log('clases table error:', classesError.message);
  } else {
     console.log('Classes for this student:', classes);
  }
  
  // check subscripciones or similar for current count
  const { data: sub, error: subError } = await supabase
    .from('subscripciones')
    .select('*')
    .eq('alumno_id', user.id);
    
  if (sub) {
    console.log('Subscriptions:', sub);
  }
}

main().catch(console.error);
