import { useState, useEffect } from 'react';
import Input from 'synapses/Input';
import Button from 'synapses/Button';
import AIResponse from 'synapses/chat/AIResponse';
import Accordion from 'synapses/Accordion';
import Dialog from 'synapses/Dialog';

export default function Home() {
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [aiQueries, setAiQueries] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('sessions');
        if (stored) {
            const parsed = JSON.parse(stored);
            setSessions(parsed);
            if (parsed.length > 0) {
                setCurrentSessionId(parsed[0].id);
                setQuery(parsed[0].query);
                setSearchResults(parsed[0].searchResults);
                setAiQueries(parsed[0].aiQueries);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('sessions', JSON.stringify(sessions));
    }, [sessions]);

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
        setSessions([...sessions, newSession]);
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
            if (currentSession && currentSession.searchResults && currentSession.query === query) {
                return;
            }
            const res = await fetch(`/api/brave?q=${encodeURIComponent(query)}`);
            if (!res.ok) {
                throw new Error(`Request to Brave API failed with status ${res.status}`);
            }
            const data = await res.json();
            setSearchResults(data);
            const newQueries = data.web?.results?.slice(0, 3).map((item) => item.title) || [];
            setAiQueries(newQueries);
            setSessions((prev) =>
                prev.map((s) => {
                    if (s.id === currentSessionId) {
                        return {
                            ...s,
                            title: query,
                            query,
                            searchResults: data,
                            aiQueries: newQueries,
                            aiResponse: ''
                        };
                    }
                    return s;
                })
            );
        } catch (err) {
            setError(err.message);
        }
    }

    const currentSession = sessions.find((s) => s.id === currentSessionId);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
            <h1>Synapsta (Powered by Brave Search & AI)</h1>
            <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ minWidth: '200px', borderRight: '1px solid #ccc', paddingRight: '16px' }}>
                    <Button onClick={createNewChat}>New Chat</Button>
                    <div style={{ marginTop: '1rem' }}>
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
                            >
                                <div onClick={() => selectSession(session.id)} style={{ flex: 1 }}>
                                    {session.title || 'Untitled Chat'}
                                </div>
                                <div
                                    onClick={(e) => handleDeleteSession(e, session.id)}
                                    style={{
                                        padding: '0 8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    &#10006;
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <Button onClick={handleSearch}>Search</Button>
                    </div>
                    {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                    {currentSession && currentSession.searchResults && (
                        <div style={{ marginTop: '1rem' }}>
                            <Accordion title="Raw Brave Search Results">
                                <pre>{JSON.stringify(currentSession.searchResults, null, 2)}</pre>
                            </Accordion>
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
                        content="This is a simple AI-powered search engine that uses the Brave Search API for web results and OpenAI (gpt-3.5-turbo) for AI responses. Many other models will be added."
                    />
                </div>
            </div>
        </div>
    );
}
