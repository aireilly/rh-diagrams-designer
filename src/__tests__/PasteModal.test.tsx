import { render, screen, fireEvent } from '@testing-library/react';
import { DiagramProvider } from '../state/DiagramContext';
import PasteModal from '../components/PasteModal';

function renderModal(onClose = vi.fn()) {
  return render(
    <DiagramProvider>
      <PasteModal onClose={onClose} />
    </DiagramProvider>
  );
}

describe('PasteModal', () => {
  it('renders textarea and buttons', () => {
    renderModal();
    expect(screen.getByPlaceholderText(/paste/i)).toBeInTheDocument();
    expect(screen.getByText('Load')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    renderModal(onClose);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error for invalid JSON', () => {
    renderModal();
    const textarea = screen.getByPlaceholderText(/paste/i);
    fireEvent.change(textarea, { target: { value: 'not json' } });
    fireEvent.click(screen.getByText('Load'));
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });

  it('loads valid JSON and closes', () => {
    const onClose = vi.fn();
    renderModal(onClose);
    const validJson = JSON.stringify({
      version: 1,
      elements: [],
      connectors: [],
      canvasHeight: 600,
    });
    const textarea = screen.getByPlaceholderText(/paste/i);
    fireEvent.change(textarea, { target: { value: validJson } });
    fireEvent.click(screen.getByText('Load'));
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
  });
});
