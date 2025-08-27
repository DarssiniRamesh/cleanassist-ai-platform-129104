import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CleanAssist header', () => {
  render(<App />);
  const header = screen.getByRole('heading', { name: /cleanassist/i });
  expect(header).toBeInTheDocument();
});
