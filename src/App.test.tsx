import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * The app fetches filter options on mount; keep the smoke tests offline and
 * quiet by resolving with an empty (but valid) options payload.
 */
beforeEach(() => {
  (global as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      statusText: "OK",
      json: () => Promise.resolve({}),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders the portal chrome', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: /knowledge search/i })
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /search history/i })).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText(/search for expertise/i)
  ).toBeInTheDocument();
});

test('exposes a light/dark mode toggle', () => {
  render(<App />);

  expect(
    screen.getByRole('button', { name: /switch to (light|dark) mode/i })
  ).toBeInTheDocument();
});
