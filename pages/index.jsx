import '../styles/globals.css';
import { useState, useEffect } from 'react';
import Input from 'synapses/Input';
import Button from 'synapses/Button';
import AIResponse from 'synapses/chat/AIResponse';
import Dialog from 'synapses/Dialog';
import { Send, SquarePen, Menu, ChevronLeft } from 'lucide-react';

export default function Home() {
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [aiQueries, setAiQueries] = useState([]);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const storedSessions = localStorage.getItem('sessions');
        const storedSessionId = localStorage.getItem('currentSessionId');
        if (storedSessions) {
            const parsedSessions = JSON.parse(storedSessions);
            setSessions(parsedSessions);
            if (parsedSessions.length > 0) {
                if (storedSessionId) {
                    const parsedId = JSON.parse(storedSessionId);
                    const found = parsedSessions.find((s) => s.id === parsedId);
                    if (found) {
                        setCurrentSessionId(parsedId);
                        setQuery(found.query);
                        setSearchResults(found.searchResults);
                        setAiQueries(found.aiQueries);
                    } else {
                        setCurrentSessionId(parsedSessions[0].id);
                        setQuery(parsedSessions[0].query);
                        setSearchResults(parsedSessions[0].searchResults);
                        setAiQueries(parsedSessions[0].aiQueries);
                    }
                } else {
                    setCurrentSessionId(parsedSessions[0].id);
                    setQuery(parsedSessions[0].query);
                    setSearchResults(parsedSessions[0].searchResults);
                    setAiQueries(parsedSessions[0].aiQueries);
                }
            } else {
                createNewChat();
            }
        } else {
            createNewChat();
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('sessions', JSON.stringify(sessions));
        localStorage.setItem('currentSessionId', JSON.stringify(currentSessionId));
    }, [sessions, currentSessionId]);

    function createNewChat() {
        const newId = Date.now();
        const newSession = {
            id: newId,
            title: 'Untitled Chat',
            query: '',
            searchResults: null,
            aiQueries: [],
            aiResponse: ''
        };
        setSessions((prev) => [...prev, newSession]);
        setCurrentSessionId(newId);
        setQuery('');
        setSearchResults(null);
        setAiQueries([]);
        setError(null);
    }

    function selectSession(id) {
        const found = sessions.find((s) => s.id === id);
        if (!found) return;
        setCurrentSessionId(id);
        setQuery(found.query);
        setSearchResults(found.searchResults);
        setAiQueries(found.aiQueries);
        setError(null);
    }

    function handleDeleteSession(e, sessionId) {
        e.stopPropagation();
        setSessions((prev) => {
            const filtered = prev.filter((s) => s.id !== sessionId);
            if (sessionId === currentSessionId) {
                if (filtered.length > 0) {
                    setCurrentSessionId(filtered[0].id);
                    setQuery(filtered[0].query);
                    setSearchResults(filtered[0].searchResults);
                    setAiQueries(filtered[0].aiQueries);
                } else {
                    setCurrentSessionId(null);
                    setQuery('');
                    setSearchResults(null);
                    setAiQueries([]);
                }
            }
            return filtered;
        });
    }

    function handleProgressUpdate(sessionId, updatedProgress) {
        setSessions((prev) =>
            prev.map((s) => {
                if (s.id === sessionId) {
                    return { ...s, aiResponse: updatedProgress };
                }
                return s;
            })
        );
    }

    async function handleSearch() {
        if (!query.trim()) {
            setSearchResults(null);
            setAiQueries([]);
            setError(null);
            return;
        }
        setError(null);
        try {
            const currentSession = sessions.find((s) => s.id === currentSessionId);
            if (currentSession && currentSession.searchResults && currentSession.query === query) return;
            const res = await fetch(`/api/brave?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
            const data = await res.json();
            setSearchResults(data);
            const newQueries = data.web?.results?.slice(0, 3).map((item) => item.title) || [];
            setAiQueries(newQueries);
            setSessions((prev) =>
                prev.map((s) => {
                    if (s.id === currentSessionId) {
                        return { ...s, title: query, query, searchResults: data, aiQueries: newQueries, aiResponse: '' };
                    }
                    return s;
                })
            );
        } catch (err) {
            setError(err.message);
        }
    }

    const currentSession = sessions.find((s) => s.id === currentSessionId);

    function toggleSidebar() {
        setSidebarOpen((prev) => !prev);
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 10, top: 10 }}>
                <Button onClick={toggleSidebar} >
                    <Menu />
                </Button>
            </div>
            <div style={{ position: 'absolute', right: 10, top: 10 }}>
                <Button onClick={createNewChat} >
                    <SquarePen />
                </Button>
            </div>
            <h1 style={{ textAlign: 'center', marginTop: '3rem' }}>Synapsta</h1>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh',
                    backgroundColor: '#f8f9fa',
                    borderRight: '1px solid #ccc',
                    padding: '1rem',
                    overflowY: 'auto',
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease',
                    width: 300
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>Sessions</h2>
                    <Button onClick={toggleSidebar} >
                        <ChevronLeft />
                    </Button>
                </div>
                {sessions.length === 0 && <p>No sessions yet.</p>}
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '4px',
                            backgroundColor: session.id === currentSessionId ? '#e0f7fa' : 'transparent',
                            marginBottom: '4px'
                        }}
                        onClick={() => selectSession(session.id)}
                    >
                        <div style={{ flex: 1 }}>
                            {session.title || 'Untitled Chat'}
                        </div>
                        <div
                            onClick={(e) => handleDeleteSession(e, session.id)}
                            style={{ padding: '0 8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            &#10006;
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginLeft: sidebarOpen ? 300 : 0, transition: 'margin-left 0.3s ease', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />
                    <Button onClick={handleSearch} >
                        <Send />
                    </Button>
                </div>
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                {currentSession && currentSession.searchResults && (
                    <div style={{ marginTop: '1rem' }}>
                        <AIResponse
                            results={currentSession.searchResults}
                            queries={currentSession.aiQueries}
                            sessionId={currentSession.id}
                            existingProgress={currentSession.aiResponse}
                            onProgressUpdate={handleProgressUpdate}
                        />
                    </div>
                )}
                <Dialog
                    title="About This App"
                    content="This is a simple AI-powered search engine that uses the Brave Search API for web results and OpenAI for AI responses."
                />
            </div>
        </div>
    );
}
