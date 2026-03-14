async function test() {
  const email = 'admin@prospect.com';
  const password = 'prospect123';
  
  console.log(`Testing login for ${email}...`);
  try {
    const res = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
