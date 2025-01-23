import React, { useState, useEffect } from 'react';
import openaiHandler from '../../pages/api/openaiHandler';
import { marked } from 'marked';

marked.setOptions({
    gfm: true,
    breaks: true
});

export default function AIResponse({
    results,
    queries,
    sessionId,
    existingProgress,
    onProgressUpdate
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(existingProgress || '');

    useEffect(() => {
        setProgress(existingProgress || '');
    }, [existingProgress]);

    const handleFetchResponses = async () => {
        setIsLoading(true);
        setProgress('');
        onProgressUpdate(sessionId, '');
        try {
            const finalData = await openaiHandler.fetchResponses(queries, (chunk) => {
                setProgress((prev) => {
                    const updated = prev + chunk;
                    onProgressUpdate(sessionId, updated);
                    return updated;
                });
            });
            setProgress(finalData);
            onProgressUpdate(sessionId, finalData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (queries && queries.length > 0 && sessionId && !existingProgress) {
            handleFetchResponses();
        }
    }, [queries, sessionId]);

    const renderMarkdown = (markdown) => {
        return { __html: marked(markdown) };
    };

    if (!results) return null;
    const webResults = results.web?.results || [];

    return (
        <div style={{ marginTop: '1rem', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <div
                style={{
                    marginTop: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '1rem',
                }}
            >
                <h2 style={{ textAlign: 'center' }}>Search Results</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-evenly' }}>
                    {webResults.slice(0, 6).map((item, idx) => {
                        const faviconUrl = new URL(item.url).origin + '/favicon.ico';
                        return (
                            <a
                                key={idx}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '220px',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: '#333',
                                    transition: 'background-color 0.3s',
                                    overflow: 'hidden',
                                }}
                                title={item.title}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                            >
                                <img
                                    src={faviconUrl}
                                    alt=""
                                    style={{ width: '16px', height: '16px', borderRadius: '3px' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <span
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {item.title}
                                </span>
                            </a>
                        );
                    })}
                </div>
            </div>
            <div style={{ marginTop: '2rem' }}>
                {isLoading && (
                    <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem' }}>
                        Generating answers...
                    </p>
                )}
                <div
                    dangerouslySetInnerHTML={renderMarkdown(progress)}
                    style={{
                        background: '#f9f9f9',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginTop: '1rem',
                        fontSize: '1rem',
                        lineHeight: '1.5',
                        color: '#333',
                    }}
                />
            </div>
        </div>
    );
}
