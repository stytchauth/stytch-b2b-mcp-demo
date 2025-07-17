import React, { useState } from 'react';

const Notes = () => {
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote]);
      setNewNote('');
    }
  };

  const deleteNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notes</h1>
        <p className="page-subtitle">Keep track of important information and ideas</p>
      </div>
      
      <div className="admin-content-wrapper">
        <div style={{ padding: '24px' }}>
          {notes.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: 'rgba(55, 53, 47, 0.6)',
              fontSize: '16px',
              padding: '48px 24px'
            }}>
              Add your first note
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              {notes.map((note, index) => (
                <div 
                  key={index}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(55, 53, 47, 0.09)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    position: 'relative',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                  }}
                >
                  <div style={{ paddingRight: '32px', color: 'rgba(55, 53, 47, 0.8)' }}>
                    {note}
                  </div>
                  <button
                    onClick={() => deleteNote(index)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(55, 53, 47, 0.4)',
                      fontSize: '14px',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note..."
              onKeyPress={(e) => e.key === 'Enter' && addNote()}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
                outline: 'none'
              }}
            />
            <button
              onClick={addNote}
              style={{
                padding: '12px 24px',
                background: '#2383e2',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
              }}
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes; 