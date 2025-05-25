import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, updateStreamingMessage, finishStreaming, setLoading } from '../store/chatSlice';
import { streamChat } from '../services/api';
import type { RootState } from '../store/store';
import type { Message } from '../store/chatSlice';

export const Chat = () => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state: RootState) => state.chat);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
    };

    dispatch(addMessage(userMessage));
    setInput('');

    // Add assistant message placeholder
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      isStreaming: true,
    };
    dispatch(addMessage(assistantMessage));
    dispatch(setLoading(true));

    await streamChat(
      input,
      (chunk) => {
        dispatch(updateStreamingMessage({ content: chunk }));
      },
      () => {
        dispatch(finishStreaming());
        dispatch(setLoading(false));
      },
      (error) => {
        console.error('Error:', error);
        dispatch(setLoading(false));
      }
    );
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: message.role === 'user' ? '#e3f2fd' : '#f5f5f5',
              borderRadius: '5px',
            }}
          >
            <strong>{message.role === 'user' ? 'You: ' : 'Assistant: '}</strong>
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ width: '80%', padding: '10px' }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{ width: '18%', padding: '10px', marginLeft: '2%' }}
        >
          Send
        </button>
      </form>
    </div>
  );
}; 
