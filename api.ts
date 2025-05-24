import axios from 'axios';

const API_URL = 'http://localhost:5000/events';

interface SSEMessage {
  text: string;
}

export const streamChat = async (
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: any) => void
) => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    console.log('Connected to SSE stream...');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('Stream ended');
        onComplete();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() && line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6); // Remove 'data: ' prefix
            const data: SSEMessage = JSON.parse(jsonStr);
            
            console.log('Received text:', data.text);
            
            // Pass the text content to the onChunk callback
            onChunk(data.text);
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('SSE connection error:', error);
    onError(error);
  }
};

