import fetch from 'node-fetch';

async function testAPI() {
  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'frieren',
        password: 'MeldaErkan!5352'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.message);
    
    const token = loginData.token;
    
    // Get all notes
    console.log('\n📝 Getting all notes...');
    const notesResponse = await fetch('http://localhost:5001/api/notes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const notes = await notesResponse.json();
    console.log(`✅ Found ${notes.length} notes`);
    
    // Get first note details
    if (notes.length > 0) {
      const noteId = notes[0].id;
      console.log(`\n🔍 Getting details for note ${noteId}: "${notes[0].title}"`);
      
      const noteResponse = await fetch(`http://localhost:5001/api/notes/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const noteDetails = await noteResponse.json();
      console.log('✅ Note details retrieved:');
      console.log(`- Title: ${noteDetails.title}`);
      console.log(`- Solutions: ${noteDetails.solutions?.length || 0}`);
      console.log(`- Code Snippets: ${noteDetails.codeSnippets?.length || 0}`);
      console.log(`- Scripts: ${noteDetails.scripts?.length || 0}`);
      
      if (noteDetails.scripts && noteDetails.scripts.length > 0) {
        console.log('\n📜 Scripts found:');
        noteDetails.scripts.forEach((script, index) => {
          console.log(`  ${index + 1}. ${script.title} (${script.script_type}) - ${script.content.length} chars`);
        });
      }
      
      if (noteDetails.codeSnippets && noteDetails.codeSnippets.length > 0) {
        console.log('\n💻 Code snippets found:');
        noteDetails.codeSnippets.forEach((code, index) => {
          console.log(`  ${index + 1}. ${code.title || 'Untitled'} (${code.language}) - ${code.code.length} chars`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();