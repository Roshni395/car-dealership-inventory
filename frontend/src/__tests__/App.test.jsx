import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

vi.mock('../api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    listVehicles: vi.fn(),
    searchVehicles: vi.fn(),
    purchase: vi.fn(),
    createVehicle: vi.fn(),
    updateVehicle: vi.fn(),
    deleteVehicle: vi.fn(),
    restock: vi.fn(),
  },
}));

import { api } from '../api';

describe('authentication screen', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('shows sign-in form', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('lets a visitor switch to registration', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('shows an API error when login fails', async () => {
    api.login.mockRejectedValueOnce(new Error('Incorrect email or password'));
    render(<App />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'WrongPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument();
  });
});
