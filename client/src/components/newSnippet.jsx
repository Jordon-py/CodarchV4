import {useState, useRef, useEffect} from "react";
import axios from "axios";

// Set axios base URL globally
axios.defaults.baseURL = 'http://localhost:3000/api';  // Standardized base URL for consistency



// Snippet creation component
export default function NewSnippet() {
  const [title, setTitle] = useState("name your snippet");
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState('// your code here');
  const [version, setVersion] = useState(1);
  const [author, setAuthor] = useState(null);
  const [snippets, setSnippets] = useState([]);  // Array to store fetched snippets
  const formRef = useRef(null);

  // Fetch snippets on component mount
  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        const response = await axios.get('/snippets');  // Use relative path with baseURL
        setSnippets(response.data.items || []);  // Update state with response.items
      } catch (error) {
        console.error('Failed to fetch snippets:', error);  // Handle errors gracefully
      }
    };
    fetchSnippets();  // Call immediately
  }, []);  // Empty dependency array = run once on component mount

  const createParticles = () => {
    const container = document.createElement('div');
    container.className = 'particles-container';
    document.body.appendChild(container);

    // Get form position
    const formRect = formRef.current.getBoundingClientRect();
    const formCenterX = formRect.left + formRect.width / 2;
    const formCenterY = formRect.top + formRect.height / 2;

    // Create 50 particles that fly in random directions
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      // Random end position (away from center, toward edges/corners)
      const angle = (Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.5;
      const distance = 400 + Math.random() * 600;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      particle.style.left = `${formCenterX}px`;
      particle.style.top = `${formCenterY}px`;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      particle.style.animationDelay = `${Math.random() * 0.3}s`;

      container.appendChild(particle);
    }

    // Clean up particles after animation
    setTimeout(() => {
      container.remove();
    }, 5500);

    // Activate starfield
    document.getElementById('root').classList.add('starfield-active');

    // Reset form after effect
    setTimeout(() => {
      formRef.current?.classList.remove('exploding');
      document.getElementById('root').classList.remove('starfield-active');
    }, 6000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trigger explosion animation
    formRef.current.classList.add('exploding');
    createParticles();

    try {
      const response = await axios.post('/snippets', {  // Use relative path with baseURL
        title: title,
        language: language,
        code: code,
        version: version,
        author: author,  // Include author as string (schema updated accordingly)
      });
      console.log('Created snippet id:', response.data?._id);
      console.log(response.data)

      // Refetch to update list
      const fetchResponse = await axios.get('/snippets');  // Use relative path with baseURL
      setSnippets(fetchResponse.data.items || []);

      // Optional: reset form after animation
      setTimeout(() => {
        setTitle("name your snippet");
        setCode("// your code here");
        setVersion(1);
      }, 2000);

    } catch (error) {
      console.log(error);
      // Remove explosion class on error
      formRef.current?.classList.remove('exploding');
    }
  };

  return (
    <>
      <form ref={formRef} className="snippet-form sidebar" onSubmit={handleSubmit}>
        <input
          id="snippet-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Snippet title"
          required
          autoComplete="on"
        />
        <select
          id="snippet-language"
          name="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          autoComplete="on"
        >
          <option value="JavaScript">JavaScript</option>
          <option value="Python">Python</option>
          <option value="CSS">CSS</option>
          <option value="HTML">HTML</option>
          <option value="Markdown">Markdown</option>
        </select>
        <textarea
          id="snippet-code"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Your code here..."
          rows={10}
          required
          autoComplete="on"
        />
        <input
          id="snippet-version"
          name="version"
          type="number"
          value={version}
          onChange={(e) => setVersion(Number(e.target.value))}
          min="1"
          placeholder="Version"
          autoComplete="on"
        />
        <input
          id="snippet-author"
          name="author"
          value={author || ''}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author (optional)"
          autoComplete="on"
        />
        <button onSubmit={handleSubmit} type="submit">✨ Create Snippet</button>
      </form>

      {/* Display created snippets */}
      <div className={"CodeArchive"}>
        <h2>Your CodeArchive: ({snippets.length})</h2>
        {snippets.length === 0 ? (
          <p>No snippets yet. Create one above!</p>  // Empty state
        ) : (
          <ul className="snippets-list">
            {snippets.map(snippet => (  // Map over array
              <li className="each-snippet" key={snippet._id}>
                <h4>{snippet.title}</h4>
                <p><strong>Language:</strong> {snippet.language}</p>
                <p><strong>Version:</strong> {snippet.version}</p>
                <pre className="code-block">
                  {snippet.code}
                </pre>
                <small>Created: {new Date(snippet.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}