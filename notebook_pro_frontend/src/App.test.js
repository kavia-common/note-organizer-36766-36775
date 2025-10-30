import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Notebook Pro brand', () => {
  render(<App />);
  const brand = screen.getByText(/Notebook Pro/i);
  expect(brand).toBeInTheDocument();
});
