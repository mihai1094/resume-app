# Installing Test Dependencies

Due to React 19 compatibility, you may need to install dependencies with `--legacy-peer-deps`:

```bash
npm install --save-dev @vitejs/plugin-react vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom --legacy-peer-deps
```

Or if you prefer, you can install them one by one:

```bash
npm install --save-dev @vitejs/plugin-react --legacy-peer-deps
npm install --save-dev vitest --legacy-peer-deps
npm install --save-dev @testing-library/react --legacy-peer-deps
npm install --save-dev @testing-library/jest-dom --legacy-peer-deps
npm install --save-dev @testing-library/user-event --legacy-peer-deps
npm install --save-dev jsdom --legacy-peer-deps
```

This is a temporary workaround until @testing-library/react fully supports React 19.

