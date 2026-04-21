import { useState } from 'react';
import { useDiagram } from '../state/DiagramContext';
import { deserializeProject } from '../utils/projectFile';
import './PasteModal.css';

interface PasteModalProps {
  onClose: () => void;
}

export default function PasteModal({ onClose }: PasteModalProps) {
  const { dispatch } = useDiagram();
  const [json, setJson] = useState('');
  const [error, setError] = useState('');

  const handleLoad = () => {
    try {
      const state = deserializeProject(json);
      dispatch({ type: 'LOAD_STATE', state });
      onClose();
    } catch {
      setError('Invalid JSON — check the format and try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Paste Diagram JSON</h2>
        <textarea
          className="paste-modal-textarea"
          placeholder="Paste project JSON here..."
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            setError('');
          }}
        />
        {error && <p className="paste-modal-error">{error}</p>}
        <div className="modal-actions">
          <button className="modal-btn" onClick={handleLoad}>
            Load
          </button>
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
