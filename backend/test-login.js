import fetch from 'node-fetch';

async function testLogin(email, password) {
  try {
    const resp = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await resp.json();
    console.log(`Status: ${resp.status}`);
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

// Testing with one of the known emails
testLogin('teste@exemplo.com', '123456');
