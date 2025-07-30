// test-api.js - Simple script to test API connection from the client

// Import our API client
import { apiClient } from './client/lib/api.ts';

// Test login function
async function testLogin() {
  try {
    const result = await apiClient.login('admin', 'admin123');
    console.log('Login successful!');
    console.log('Token:', result.access_token);
    return result.access_token;
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// Test getting turnos
async function getTurnos() {
  try {
    const turnos = await apiClient.getTurnos();
    console.log('Turnos:', turnos);
  } catch (error) {
    console.error('Failed to get turnos:', error);
  }
}

// Run tests
async function runTests() {
  const token = await testLogin();
  if (token) {
    await getTurnos();
  }
}

runTests();
