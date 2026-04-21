import { useState } from 'react';
import type Konva from 'konva';
import { useDiagram } from '../state/DiagramContext';
import { generateSvg } from '../utils/exportSvg';
import { exportPng, downloadBlob } from '../utils/exportPng';
import { downloadFile, serializeProject } from '../utils/projectFile';
import './ExportModal.css';

interface ExportModalProps {
  onClose: () => void;
  stageRef: React.RefObject<unknown>;
}

function generateFilename(issue: string, product: string, desc: string, date: string): string {
  const parts = [issue, product, desc, date].filter(Boolean);
  return parts.join('_').replace(/\s+/g, '_').toLowerCase();
}

export default function ExportModal({ onClose, stageRef }: ExportModalProps) {
  const { state } = useDiagram();
  const [issueNumber, setIssueNumber] = useState('');
  const [productFamily, setProductFamily] = useState('');
  const [description, setDescription] = useState('');

  const now = new Date();
  const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}`;

  const filename = generateFilename(issueNumber, productFamily, description, dateStr);

  const handleExportSvg = () => {
    const svg = generateSvg(state);
    downloadFile(svg, `${filename || 'diagram'}.svg`, 'image/svg+xml');
  };

  const handleExportPng = async () => {
    const stage = stageRef?.current as Konva.Stage | null;
    if (!stage) return;

    const blob = await exportPng(stage, state.elements);
    downloadBlob(blob, `${filename || 'diagram'}.png`);
  };

  const handleSaveProject = () => {
    const json = serializeProject(state);
    downloadFile(json, `${filename || 'diagram'}.json`, 'application/json');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Export Diagram</h2>

        <div className="modal-field">
          <label>Issue Number</label>
          <input
            type="text"
            placeholder="e.g., 123"
            value={issueNumber}
            onChange={(e) => setIssueNumber(e.target.value)}
          />
        </div>

        <div className="modal-field">
          <label>Product Family</label>
          <input
            type="text"
            placeholder="e.g., OpenShift"
            value={productFamily}
            onChange={(e) => setProductFamily(e.target.value)}
          />
        </div>

        <div className="modal-field">
          <label>Description</label>
          <input
            type="text"
            placeholder="e.g., network_topology"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="modal-field">
          <label>Generated Filename</label>
          <span className="modal-filename">{filename || 'diagram'}.[svg|png]</span>
        </div>

        <div className="modal-actions">
          <button className="modal-btn" onClick={handleExportSvg}>
            Export SVG
          </button>
          <button className="modal-btn" onClick={handleExportPng}>
            Export PNG
          </button>
          <button className="modal-btn modal-btn-secondary" onClick={handleSaveProject}>
            Save Project (.json)
          </button>
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
