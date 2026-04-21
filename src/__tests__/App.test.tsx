import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders all major layout sections', () => {
    render(<App />);
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Redo')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders Paste button instead of Select button', () => {
    render(<App />);
    expect(screen.getByText('Paste')).toBeInTheDocument();
    expect(screen.queryByText('Select')).not.toBeInTheDocument();
  });

  it('renders component panel sections', () => {
    render(<App />);
    expect(screen.getByText('Boxes')).toBeInTheDocument();
    expect(screen.getByText('Callout')).toBeInTheDocument();
    expect(screen.getByText(/Physical/)).toBeInTheDocument();
    expect(screen.getByText('Connectors')).toBeInTheDocument();
  });

  it('renders Claude Code skill info box in component panel', () => {
    render(<App />);
    expect(screen.getByText(/Claude Code/)).toBeInTheDocument();
    expect(screen.getByText(/Download skill/i)).toBeInTheDocument();
  });
});
