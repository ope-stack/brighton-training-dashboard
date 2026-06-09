import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: Change 'brighton-training-dashboard' below to match your GitHub repo name
// e.g. if your repo URL is https://github.com/ope/scoutsplaybook then base = '/scoutsplaybook/'
// If you deploy to a user/org root site (e.g. ope.github.io) then base = '/'
export default defineConfig({
  plugins: [react()],
  base: '/brighton-training-dashboard/'
});
