const BASE_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const openaiHandler = {
  fetchResponses: async (queries, onChunkUpdate = () => {}) => {
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      throw new Error('Queries must be a non-empty array.');
    }

    if (!API_KEY) {
      throw new Error('Missing OpenAI API Key.');
    }

    try {
      const combinedQuery = queries.join('\n');

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: combinedQuery }],
          max_tokens: 1024,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let finalContent = '';
      let buffer = '';

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');

        for (let i = 0; i < lines.length - 1; i++) {
          let line = lines[i].trim();

          if (!line.startsWith('data: ')) {
            continue;
          }

          const jsonStr = line.slice('data: '.length);
          if (jsonStr === '[DONE]') {
            break outer;
          }

          try {
            const parsed = JSON.parse(jsonStr);

            const contentChunk = parsed.choices?.[0]?.delta?.content ?? '';
            if (contentChunk) {
              finalContent += contentChunk;
              onChunkUpdate(contentChunk);
            }
          } catch (err) {
            console.error('JSON parse error on chunk:', err);
          }
        }

        buffer = lines[lines.length - 1];
      }

      return finalContent;
    } catch (error) {
      console.error('Error with OpenAI API:', error);
      throw new Error('Failed to fetch response from OpenAI.');
    }
  },
};

export default openaiHandler;
