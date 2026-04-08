import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the layout skeleton', () => {
    render(<App />);
    expect(screen.getByText('Toolbar')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
