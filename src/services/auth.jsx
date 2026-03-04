// src/services/auth.js

// Ton backend est sur le port 3000
const API_URL = 'http://localhost:3000/api';

export async function register(userData) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'inscription");
  }
  return response.json();
}

export async function login(credentials) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Email ou mot de passe incorrect");
  }
  return response.json();
}