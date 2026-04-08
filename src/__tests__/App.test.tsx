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

  it('renders component panel sections', () => {
    render(<App />);
    expect(screen.getByText('Boxes')).toBeInTheDocument();
    expect(screen.getByText('Callout')).toBeInTheDocument();
    expect(screen.getByText('Icons')).toBeInTheDocument();
    expect(screen.getByText('Connectors')).toBeInTheDocument();
  });
});
