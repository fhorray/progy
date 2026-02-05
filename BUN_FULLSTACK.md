> ## Documentation Index
>
> Fetch the complete documentation index at: https://bun.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Fullstack dev server

> Build fullstack applications with Bun's integrated dev server that bundles frontend assets and handles API routes

To get started, import HTML files and pass them to the `routes` option in `Bun.serve()`.

```ts title="app.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serve } from 'bun';
import dashboard from './dashboard.html';
import homepage from './index.html';

const server = serve({
  routes: {
    // ** HTML imports **
    // Bundle & route index.html to "/". This uses HTMLRewriter to scan
    // the HTML for `<script>` and `<link>` tags, runs Bun's JavaScript
    // & CSS bundler on them, transpiles any TypeScript, JSX, and TSX,
    // downlevels CSS with Bun's CSS parser and serves the result.
    '/': homepage,
    // Bundle & route dashboard.html to "/dashboard"
    '/dashboard': dashboard,

    // ** API endpoints ** (Bun v1.2.3+ required)
    '/api/users': {
      async GET(req) {
        const users = await sql`SELECT * FROM users`;
        return Response.json(users);
      },
      async POST(req) {
        const { name, email } = await req.json();
        const [user] =
          await sql`INSERT INTO users (name, email) VALUES (${name}, ${email})`;
        return Response.json(user);
      },
    },
    '/api/users/:id': async (req) => {
      const { id } = req.params;
      const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
      return Response.json(user);
    },
  },

  // Enable development mode for:
  // - Detailed error messages
  // - Hot reloading (Bun v1.2.3+ required)
  development: true,
});

console.log(`Listening on ${server.url}`);
```

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run app.ts
```

## HTML Routes

### HTML Imports as Routes

The web starts with HTML, and so does Bun's fullstack dev server.

To specify entrypoints to your frontend, import HTML files into your JavaScript/TypeScript/TSX/JSX files.

```ts title="app.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import dashboard from './dashboard.html';
import homepage from './index.html';
```

These HTML files are used as routes in Bun's dev server you can pass to `Bun.serve()`.

```ts title="app.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
  routes: {
    '/': homepage,
    '/dashboard': dashboard,
  },

  fetch(req) {
    // ... api requests
  },
});
```

When you make a request to `/dashboard` or `/`, Bun automatically bundles the `<script>` and `<link>` tags in the HTML files, exposes them as static routes, and serves the result.

### HTML Processing Example

An `index.html` file like this:

```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!DOCTYPE html>
<html>
  <head>
    <title>Home</title>
    <link rel="stylesheet" href="./reset.css" />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./sentry-and-preloads.ts"></script>
    <script type="module" src="./my-app.tsx"></script>
  </body>
</html>
```

Becomes something like this:

```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!DOCTYPE html>
<html>
  <head>
    <title>Home</title>
    <link rel="stylesheet" href="/index-[hash].css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index-[hash].js"></script>
  </body>
</html>
```

## React Integration

To use React in your client-side code, import `react-dom/client` and render your app.

<CodeGroup>
  ```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import dashboard from "../public/dashboard.html";
  import { serve } from "bun";

serve({
routes: {
"/": dashboard,
},
async fetch(req) {
// ...api requests
return new Response("hello world");
},
});

````

```tsx title="src/frontend.tsx" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { createRoot } from 'react-dom/client';
import App from './app';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
````

```html title="public/dashboard.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!DOCTYPE html>
<html>
  <head>
    <title>Dashboard</title>
    <link rel="stylesheet" href="../src/styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="../src/frontend.tsx"></script>
  </body>
</html>
```

```tsx title="src/app.tsx" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}
```

</CodeGroup>

## Development Mode

When building locally, enable development mode by setting `development: true` in `Bun.serve()`.

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import homepage from './index.html';
import dashboard from './dashboard.html';

Bun.serve({
  routes: {
    '/': homepage,
    '/dashboard': dashboard,
  },

  development: true,

  fetch(req) {
    // ... api requests
  },
});
```

### Development Mode Features

When `development` is `true`, Bun will:

- Include the SourceMap header in the response so that devtools can show the original source code
- Disable minification
- Re-bundle assets on each request to a `.html` file
- Enable hot module reloading (unless `hmr: false` is set)
- Echo console logs from browser to terminal

### Advanced Development Configuration

`Bun.serve()` supports echoing console logs from the browser to the terminal.

To enable this, pass `console: true` in the development object in `Bun.serve()`.

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import homepage from './index.html';

Bun.serve({
  // development can also be an object.
  development: {
    // Enable Hot Module Reloading
    hmr: true,

    // Echo console logs from the browser to the terminal
    console: true,
  },

  routes: {
    '/': homepage,
  },
});
```

When `console: true` is set, Bun will stream console logs from the browser to the terminal. This reuses the existing WebSocket connection from HMR to send the logs.

### Development vs Production

| Feature             | Development           | Production  |
| ------------------- | --------------------- | ----------- |
| **Source maps**     | ✅ Enabled            | ❌ Disabled |
| **Minification**    | ❌ Disabled           | ✅ Enabled  |
| **Hot reloading**   | ✅ Enabled            | ❌ Disabled |
| **Asset bundling**  | 🔄 On each request    | 💾 Cached   |
| **Console logging** | 🖥️ Browser → Terminal | ❌ Disabled |
| **Error details**   | 📝 Detailed           | 🔒 Minimal  |

## Production Mode

Hot reloading and `development: true` helps you iterate quickly, but in production, your server should be as fast as possible and have as few external dependencies as possible.

### Ahead of Time Bundling (Recommended)

As of Bun v1.2.17, you can use `Bun.build` or `bun build` to bundle your full-stack application ahead of time.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --target=bun --production --outdir=dist ./src/index.ts
```

When Bun's bundler sees an HTML import from server-side code, it will bundle the referenced JavaScript/TypeScript/TSX/JSX and CSS files into a manifest object that `Bun.serve()` can use to serve the assets.

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serve } from 'bun';
import index from './index.html';

serve({
  routes: { '/': index },
});
```

### Runtime Bundling

When adding a build step is too complicated, you can set `development: false` in `Bun.serve()`.

This will:

- Enable in-memory caching of bundled assets. Bun will bundle assets lazily on the first request to an `.html` file, and cache the result in memory until the server restarts.
- Enable `Cache-Control` headers and `ETag` headers
- Minify JavaScript/TypeScript/TSX/JSX files

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serve } from 'bun';
import homepage from './index.html';

serve({
  routes: {
    '/': homepage,
  },

  // Production mode
  development: false,
});
```

## API Routes

### HTTP Method Handlers

Define API endpoints with HTTP method handlers:

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serve } from 'bun';

serve({
  routes: {
    '/api/users': {
      async GET(req) {
        // Handle GET requests
        const users = await getUsers();
        return Response.json(users);
      },

      async POST(req) {
        // Handle POST requests
        const userData = await req.json();
        const user = await createUser(userData);
        return Response.json(user, { status: 201 });
      },

      async PUT(req) {
        // Handle PUT requests
        const userData = await req.json();
        const user = await updateUser(userData);
        return Response.json(user);
      },

      async DELETE(req) {
        // Handle DELETE requests
        await deleteUser(req.params.id);
        return new Response(null, { status: 204 });
      },
    },
  },
});
```

### Dynamic Routes

Use URL parameters in your routes:

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
serve({
  routes: {
    // Single parameter
    '/api/users/:id': async (req) => {
      const { id } = req.params;
      const user = await getUserById(id);
      return Response.json(user);
    },

    // Multiple parameters
    '/api/users/:userId/posts/:postId': async (req) => {
      const { userId, postId } = req.params;
      const post = await getPostByUser(userId, postId);
      return Response.json(post);
    },

    // Wildcard routes
    '/api/files/*': async (req) => {
      const filePath = req.params['*'];
      const file = await getFile(filePath);
      return new Response(file);
    },
  },
});
```

### Request Handling

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
serve({
  routes: {
    '/api/data': {
      async POST(req) {
        // Parse JSON body
        const body = await req.json();

        // Access headers
        const auth = req.headers.get('Authorization');

        // Access URL parameters
        const { id } = req.params;

        // Access query parameters
        const url = new URL(req.url);
        const page = url.searchParams.get('page') || '1';

        // Return response
        return Response.json({
          message: 'Data processed',
          page: parseInt(page),
          authenticated: !!auth,
        });
      },
    },
  },
});
```

## Plugins

Bun's bundler plugins are also supported when bundling static routes.

To configure plugins for `Bun.serve`, add a `plugins` array in the `[serve.static]` section of your `bunfig.toml`.

### TailwindCSS Plugin

You can use TailwindCSS by installing and adding the `tailwindcss` package and `bun-plugin-tailwind` plugin.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add tailwindcss bun-plugin-tailwind
```

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[serve.static]
plugins = ["bun-plugin-tailwind"]
```

This will allow you to use TailwindCSS utility classes in your HTML and CSS files. All you need to do is import `tailwindcss` somewhere:

```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!doctype html>
<html>
  <head>
    <!-- [!code ++] -->
    <link rel="stylesheet" href="tailwindcss" />
  </head>
  <!-- the rest of your HTML... -->
</html>
```

Alternatively, you can import TailwindCSS in your CSS file:

```css title="style.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
@import 'tailwindcss';

.custom-class {
  @apply bg-red-500 text-white;
}
```

```html index.html icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!doctype html>
<html>
  <head>
    <!-- [!code ++] -->
    <link rel="stylesheet" href="./style.css" />
  </head>
  <!-- the rest of your HTML... -->
</html>
```

### Custom Plugins

Any JS file or module which exports a valid bundler plugin object (essentially an object with a `name` and `setup` field) can be placed inside the plugins array:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[serve.static]
plugins = ["./my-plugin-implementation.ts"]
```

```ts title="my-plugin-implementation.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import type { BunPlugin } from 'bun';

const myPlugin: BunPlugin = {
  name: 'my-custom-plugin',
  setup(build) {
    // Plugin implementation
    build.onLoad({ filter: /\.custom$/ }, async (args) => {
      const text = await Bun.file(args.path).text();
      return {
        contents: `export default ${JSON.stringify(text)};`,
        loader: 'js',
      };
    });
  },
};

export default myPlugin;
```

Bun will lazily resolve and load each plugin and use them to bundle your routes.

<Note>
  This is currently in `bunfig.toml` to make it possible to know statically which plugins are in use when we eventually
  integrate this with the `bun build` CLI. These plugins work in `Bun.build()`'s JS API, but are not yet supported in
  the CLI.
</Note>

## Inline Environment Variables

Bun can replace `process.env.*` references in your frontend JavaScript and TypeScript with their actual values at build time. Configure the `env` option in your `bunfig.toml`:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[serve.static]
env = "PUBLIC_*"  # only inline env vars starting with PUBLIC_ (recommended)
# env = "inline"  # inline all environment variables
# env = "disable" # disable env var replacement (default)
```

<Note>
  This only works with literal `process.env.FOO` references, not `import.meta.env` or indirect access like `const env =
    process.env; env.FOO`.

If an environment variable is not set, you may see runtime errors like `ReferenceError: process
    is not defined` in the browser.
</Note>

See the [HTML & static sites documentation](/bundler/html-static#inline-environment-variables) for more details on build-time configuration and examples.

## How It Works

Bun uses `HTMLRewriter` to scan for `<script>` and `<link>` tags in HTML files, uses them as entrypoints for Bun's bundler, generates an optimized bundle for the JavaScript/TypeScript/TSX/JSX and CSS files, and serves the result.

### Processing Pipeline

<Steps>
  <Step title="1. <script> Processing">
    * Transpiles TypeScript, JSX, and TSX in `<script>` tags
    * Bundles imported dependencies
    * Generates sourcemaps for debugging
    * Minifies when `development` is not `true` in `Bun.serve()`

    ```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
    <script type="module" src="./counter.tsx"></script>
    ```

  </Step>

  <Step title="2. <link> Processing">
    * Processes CSS imports and `<link>` tags
    * Concatenates CSS files
    * Rewrites url and asset paths to include content-addressable hashes in URLs

    ```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
    <link rel="stylesheet" href="./styles.css" />
    ```

  </Step>

  <Step title="3. <img> & Asset Processing">
    * Links to assets are rewritten to include content-addressable hashes in URLs
    * Small assets in CSS files are inlined into `data:` URLs, reducing the total number of HTTP requests sent over the wire
  </Step>

  <Step title="4. HTML Rewriting">
    * Combines all `<script>` tags into a single `<script>` tag with a content-addressable hash in the URL
    * Combines all `<link>` tags into a single `<link>` tag with a content-addressable hash in the URL
    * Outputs a new HTML file
  </Step>

  <Step title="5. Serving">
    * All the output files from the bundler are exposed as static routes, using the same mechanism internally as when you pass a Response object to `static` in `Bun.serve()`.
    * This works similarly to how `Bun.build` processes HTML files.
  </Step>
</Steps>

## Complete Example

Here's a complete fullstack application example:

```ts title="server.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serve } from 'bun';
import { Database } from 'bun:sqlite';
import homepage from './public/index.html';
import dashboard from './public/dashboard.html';

// Initialize database
const db = new Database('app.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const server = serve({
  routes: {
    // Frontend routes
    '/': homepage,
    '/dashboard': dashboard,

    // API routes
    '/api/users': {
      async GET() {
        const users = db.query('SELECT * FROM users').all();
        return Response.json(users);
      },

      async POST(req) {
        const { name, email } = await req.json();

        try {
          const result = db
            .query('INSERT INTO users (name, email) VALUES (?, ?) RETURNING *')
            .get(name, email);

          return Response.json(result, { status: 201 });
        } catch (error) {
          return Response.json(
            { error: 'Email already exists' },
            { status: 400 },
          );
        }
      },
    },

    '/api/users/:id': {
      async GET(req) {
        const { id } = req.params;
        const user = db.query('SELECT * FROM users WHERE id = ?').get(id);

        if (!user) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json(user);
      },

      async DELETE(req) {
        const { id } = req.params;
        const result = db.query('DELETE FROM users WHERE id = ?').run(id);

        if (result.changes === 0) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return new Response(null, { status: 204 });
      },
    },

    // Health check endpoint
    '/api/health': {
      GET() {
        return Response.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
        });
      },
    },
  },

  // Enable development mode
  development: {
    hmr: true,
    console: true,
  },

  // Fallback for unmatched routes
  fetch(req) {
    return new Response('Not Found', { status: 404 });
  },
});

console.log(`🚀 Server running on ${server.url}`);
```

```html title="public/index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fullstack Bun App</title>
    <link rel="stylesheet" href="../src/styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="../src/main.tsx"></script>
  </body>
</html>
```

```tsx title="src/main.tsx" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { createRoot } from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);
```

```tsx title="src/App.tsx" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        setName('');
        setEmail('');
        await fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      alert('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure?')) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container">
      <h1>User Management</h1>

      <form onSubmit={createUser} className="form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>

      <div className="users">
        <h2>Users ({users.length})</h2>
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div>
              <strong>{user.name}</strong>
              <br />
              <span>{user.email}</span>
            </div>
            <button onClick={() => deleteUser(user.id)} className="delete-btn">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

```css title="src/styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f5f5f5;
  color: #333;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #2563eb;
  margin-bottom: 2rem;
}

.form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form button {
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form button:hover {
  background: #1d4ed8;
}

.form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.users {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.user-card:last-child {
  border-bottom: none;
}

.delete-btn {
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #b91c1c;
}
```

## Best Practices

### Project Structure

```
my-app/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   └── UserList.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   ├── utils/
│   │   └── api.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── index.html
│   ├── dashboard.html
│   └── favicon.ico
├── server/
│   ├── routes/
│   │   ├── users.ts
│   │   └── auth.ts
│   ├── db/
│   │   └── schema.sql
│   └── index.ts
├── bunfig.toml
└── package.json
```

### Environment-Based Configuration

```ts title="server/config.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export const config = {
  development: process.env.NODE_ENV !== 'production',
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL || './dev.db',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};
```

### Error Handling

```ts title="server/middleware.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export function errorHandler(error: Error, req: Request) {
  console.error('Server error:', error);

  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  return Response.json(
    {
      error: error.message,
      stack: error.stack,
    },
    { status: 500 },
  );
}
```

### API Response Helpers

```ts title="server/utils.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export function json(data: any, status = 200) {
  return Response.json(data, { status });
}

export function error(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function notFound(message = 'Not found') {
  return error(message, 404);
}

export function unauthorized(message = 'Unauthorized') {
  return error(message, 401);
}
```

### Type Safety

```ts title="types/api.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
```

## Deployment

### Production Build

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Build for production
bun build --target=bun --production --outdir=dist ./server/index.ts

# Run production server
NODE_ENV=production bun dist/index.js
```

### Docker Deployment

```dockerfile title="Dockerfile" icon="docker" theme={"theme":{"light":"github-light","dark":"dracula"}}
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN bun build --target=bun --production --outdir=dist ./server/index.ts

# Production stage
FROM oven/bun:1-slim
WORKDIR /usr/src/app
COPY --from=base /usr/src/app/dist ./
COPY --from=base /usr/src/app/public ./public

EXPOSE 3000
CMD ["bun", "index.js"]
```

### Environment Variables

```ini title=".env.production" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp
CORS_ORIGIN=https://myapp.com
```

## Migration from Other Frameworks

### From Express + Webpack

```ts title="server.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Before (Express + Webpack)
app.use(express.static('dist'));
app.get('/api/users', (req, res) => {
  res.json(users);
});

// After (Bun fullstack)
serve({
  routes: {
    '/': homepage, // Replaces express.static
    '/api/users': {
      GET() {
        return Response.json(users);
      },
    },
  },
});
```

### From Next.js API Routes

```ts title="server.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Before (Next.js)
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json(users);
  }
}

// After (Bun)
"/api/users": {
  GET() { return Response.json(users); }
}
```

## Limitations and Future Plans

### Current Limitations

- `bun build` CLI integration is not yet available for fullstack apps
- Auto-discovery of API routes is not implemented
- Server-side rendering (SSR) is not built-in

### Planned Features

- Integration with `bun build` CLI
- File-based routing for API endpoints
- Built-in SSR support
- Enhanced plugin ecosystem

<Note>This is a work in progress. Features and APIs may change as Bun continues to evolve.</Note>

> ## Documentation Index
>
> Fetch the complete documentation index at: https://bun.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Single-file executable

> Generate standalone executables from TypeScript or JavaScript files with Bun

Bun's bundler implements a `--compile` flag for generating a standalone binary from a TypeScript or JavaScript file.

<Tabs>
  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./cli.ts --compile --outfile mycli
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./cli.ts"],
      compile: {
        outfile: "./mycli",
      },
    });
    ```
  </Tab>
</Tabs>

```ts cli.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log('Hello world!');
```

This bundles `cli.ts` into an executable that can be executed directly:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
./mycli
```

```txt theme={"theme":{"light":"github-light","dark":"dracula"}}
Hello world!
```

All imported files and packages are bundled into the executable, along with a copy of the Bun runtime. All built-in Bun and Node.js APIs are supported.

---

## Cross-compile to other platforms

The `--target` flag lets you compile your standalone executable for a different operating system, architecture, or version of Bun than the machine you're running `bun build` on.

To build for Linux x64 (most servers):

<Tabs>
  <Tab title="CLI">
    ```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile --target=bun-linux-x64 ./index.ts --outfile myapp

    # To support CPUs from before 2013, use the baseline version (nehalem)
    bun build --compile --target=bun-linux-x64-baseline ./index.ts --outfile myapp

    # To explicitly only support CPUs from 2013 and later, use the modern version (haswell)
    # modern is faster, but baseline is more compatible.
    bun build --compile --target=bun-linux-x64-modern ./index.ts --outfile myapp
    ```

  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    // Standard Linux x64
    await Bun.build({
      entrypoints: ["./index.ts"],
      compile: {
        target: "bun-linux-x64",
        outfile: "./myapp",
      },
    });

    // Baseline (pre-2013 CPUs)
    await Bun.build({
      entrypoints: ["./index.ts"],
      compile: {
        target: "bun-linux-x64-baseline",
        outfile: "./myapp",
      },
    });

    // Modern (2013+ CPUs, faster)
    await Bun.build({
      entrypoints: ["./index.ts"],
      compile: {
        target: "bun-linux-x64-modern",
        outfile: "./myapp",
      },
    });
    ```

  </Tab>
</Tabs>

To build for Linux ARM64 (e.g. Graviton or Raspberry Pi):

<Tabs>
  <Tab title="CLI">
    ```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
    # Note: the default architecture is x64 if no architecture is specified.
    bun build --compile --target=bun-linux-arm64 ./index.ts --outfile myapp
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./index.ts"],
      compile: {
        target: "bun-linux-arm64",
        outfile: "./myapp",
      },
    });
    ```
  </Tab>
</Tabs>

To build for Windows x64:

<Tabs>
  <Tab title="CLI">
    ```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile --target=bun-windows-x64 ./path/to/my/app.ts --outfile myapp

    # To support CPUs from before 2013, use the baseline version (nehalem)
    bun build --compile --target=bun-windows-x64-baseline ./path/to/my/app.ts --outfile myapp

    # To explicitly only support CPUs from 2013 and later, use the modern version (haswell)
    bun build --compile --target=bun-windows-x64-modern ./path/to/my/app.ts --outfile myapp

    # note: if no .exe extension is provided, Bun will automatically add it for Windows executables
    ```

  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    // Standard Windows x64
    await Bun.build({
      entrypoints: ["./path/to/my/app.ts"],
      compile: {
        target: "bun-windows-x64",
        outfile: "./myapp", // .exe added automatically
      },
    });

    // Baseline or modern variants
    await Bun.build({
      entrypoints: ["./path/to/my/app.ts"],
      compile: {
        target: "bun-windows-x64-baseline",
        outfile: "./myapp",
      },
    });
    ```

  </Tab>
</Tabs>

To build for macOS arm64:

<Tabs>
  <Tab title="CLI">
    ```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile --target=bun-darwin-arm64 ./path/to/my/app.ts --outfile myapp
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./path/to/my/app.ts"],
      compile: {
        target: "bun-darwin-arm64",
        outfile: "./myapp",
      },
    });
    ```
  </Tab>
</Tabs>

To build for macOS x64:

<Tabs>
  <Tab title="CLI">
    ```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile --target=bun-darwin-x64 ./path/to/my/app.ts --outfile myapp
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./path/to/my/app.ts"],
      compile: {
        target: "bun-darwin-x64",
        outfile: "./myapp",
      },
    });
    ```
  </Tab>
</Tabs>

### Supported targets

The order of the `--target` flag does not matter, as long as they're delimited by a `-`.

| --target              | Operating System | Architecture | Modern | Baseline | Libc  |
| --------------------- | ---------------- | ------------ | ------ | -------- | ----- |
| bun-linux-x64         | Linux            | x64          | ✅     | ✅       | glibc |
| bun-linux-arm64       | Linux            | arm64        | ✅     | N/A      | glibc |
| bun-windows-x64       | Windows          | x64          | ✅     | ✅       | -     |
| ~~bun-windows-arm64~~ | ~~Windows~~      | ~~arm64~~    | ❌     | ❌       | -     |
| bun-darwin-x64        | macOS            | x64          | ✅     | ✅       | -     |
| bun-darwin-arm64      | macOS            | arm64        | ✅     | N/A      | -     |
| bun-linux-x64-musl    | Linux            | x64          | ✅     | ✅       | musl  |
| bun-linux-arm64-musl  | Linux            | arm64        | ✅     | N/A      | musl  |

<Warning>
  On x64 platforms, Bun uses SIMD optimizations which require a modern CPU supporting AVX2 instructions. The `-baseline`
  build of Bun is for older CPUs that don't support these optimizations. Normally, when you install Bun we automatically
  detect which version to use but this can be harder to do when cross-compiling since you might not know the target CPU.
  You usually don't need to worry about it on Darwin x64, but it is relevant for Windows x64 and Linux x64. If you or
  your users see `"Illegal instruction"` errors, you might need to use the baseline version.
</Warning>

---

## Build-time constants

Use the `--define` flag to inject build-time constants into your executable, such as version numbers, build timestamps, or configuration values:

<Tabs>
  <Tab title="CLI">
    ```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile --define BUILD_VERSION='"1.2.3"' --define BUILD_TIME='"2024-01-15T10:30:00Z"' src/cli.ts --outfile mycli
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./src/cli.ts"],
      compile: {
        outfile: "./mycli",
      },
      define: {
        BUILD_VERSION: JSON.stringify("1.2.3"),
        BUILD_TIME: JSON.stringify("2024-01-15T10:30:00Z"),
      },
    });
    ```
  </Tab>
</Tabs>

These constants are embedded directly into your compiled binary at build time, providing zero runtime overhead and enabling dead code elimination optimizations.

<Note>
  For comprehensive examples and advanced patterns, see the [Build-time constants
  guide](/guides/runtime/build-time-constants).
</Note>

---

## Deploying to production

Compiled executables reduce memory usage and improve Bun's start time.

Normally, Bun reads and transpiles JavaScript and TypeScript files on `import` and `require`. This is part of what makes so much of Bun "just work", but it's not free. It costs time and memory to read files from disk, resolve file paths, parse, transpile, and print source code.

With compiled executables, you can move that cost from runtime to build-time.

When deploying to production, we recommend the following:

<Tabs>
  <Tab title="CLI">
    ```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile --minify --sourcemap ./path/to/my/app.ts --outfile myapp
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./path/to/my/app.ts"],
      compile: {
        outfile: "./myapp",
      },
      minify: true,
      sourcemap: "linked",
    });
    ```
  </Tab>
</Tabs>

### Bytecode compilation

To improve startup time, enable bytecode compilation:

<Tabs>
  <Tab title="CLI">
    ```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile --minify --sourcemap --bytecode ./path/to/my/app.ts --outfile myapp
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./path/to/my/app.ts"],
      compile: {
        outfile: "./myapp",
      },
      minify: true,
      sourcemap: "linked",
      bytecode: true,
    });
    ```
  </Tab>
</Tabs>

Using bytecode compilation, `tsc` starts 2x faster:

<Frame>
  ![Bytecode performance comparison](https://github.com/user-attachments/assets/dc8913db-01d2-48f8-a8ef-ac4e984f9763)
</Frame>

Bytecode compilation moves parsing overhead for large input files from runtime to bundle time. Your app starts faster, in exchange for making the `bun build` command a little slower. It doesn't obscure source code.

<Note>Bytecode compilation supports both `cjs` and `esm` formats when used with `--compile`.</Note>

### What do these flags do?

The `--minify` argument optimizes the size of the transpiled output code. If you have a large application, this can save megabytes of space. For smaller applications, it might still improve start time a little.

The `--sourcemap` argument embeds a sourcemap compressed with zstd, so that errors & stacktraces point to their original locations instead of the transpiled location. Bun will automatically decompress & resolve the sourcemap when an error occurs.

The `--bytecode` argument enables bytecode compilation. Every time you run JavaScript code in Bun, JavaScriptCore (the engine) will compile your source code into bytecode. We can move this parsing work from runtime to bundle time, saving you startup time.

---

## Embedding runtime arguments

**`--compile-exec-argv="args"`** - Embed runtime arguments that are available via `process.execArgv`:

<Tabs>
  <Tab title="CLI">
    ```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile --compile-exec-argv="--smol --user-agent=MyBot" ./app.ts --outfile myapp
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./app.ts"],
      compile: {
        execArgv: ["--smol", "--user-agent=MyBot"],
        outfile: "./myapp",
      },
    });
    ```
  </Tab>
</Tabs>

```ts app.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// In the compiled app
console.log(process.execArgv); // ["--smol", "--user-agent=MyBot"]
```

### Runtime arguments via `BUN_OPTIONS`

The `BUN_OPTIONS` environment variable is applied to standalone executables, allowing you to pass runtime flags without recompiling:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Enable CPU profiling on a compiled executable
BUN_OPTIONS="--cpu-prof" ./myapp

# Enable heap profiling with markdown output
BUN_OPTIONS="--heap-prof-md" ./myapp

# Combine multiple flags
BUN_OPTIONS="--smol --cpu-prof-md" ./myapp
```

This is useful for debugging or profiling production executables without rebuilding them.

---

## Automatic config loading

Standalone executables can automatically load configuration files from the directory where they are run. By default:

- **`tsconfig.json`** and **`package.json`** loading is **disabled** — these are typically only needed at development time, and the bundler already uses them when compiling
- **`.env`** and **`bunfig.toml`** loading is **enabled** — these often contain runtime configuration that may vary per deployment

<Note>
  In a future version of Bun, `.env` and `bunfig.toml` may also be disabled by default for more deterministic behavior.
</Note>

### Enabling config loading at runtime

If your executable needs to read `tsconfig.json` or `package.json` at runtime, you can opt in with the new CLI flags:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
# Enable runtime loading of tsconfig.json
bun build --compile --compile-autoload-tsconfig ./app.ts --outfile myapp

# Enable runtime loading of package.json
bun build --compile --compile-autoload-package-json ./app.ts --outfile myapp

# Enable both
bun build --compile --compile-autoload-tsconfig --compile-autoload-package-json ./app.ts --outfile myapp
```

### Disabling config loading at runtime

To disable `.env` or `bunfig.toml` loading for deterministic execution:

<Tabs>
  <Tab title="CLI">
    ```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
    # Disable .env loading
    bun build --compile --no-compile-autoload-dotenv ./app.ts --outfile myapp

    # Disable bunfig.toml loading
    bun build --compile --no-compile-autoload-bunfig ./app.ts --outfile myapp

    # Disable all config loading
    bun build --compile --no-compile-autoload-dotenv --no-compile-autoload-bunfig ./app.ts --outfile myapp
    ```

  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./app.ts"],
      compile: {
        // tsconfig.json and package.json are disabled by default
        autoloadTsconfig: true, // Enable tsconfig.json loading
        autoloadPackageJson: true, // Enable package.json loading

        // .env and bunfig.toml are enabled by default
        autoloadDotenv: false, // Disable .env loading
        autoloadBunfig: false, // Disable bunfig.toml loading
        outfile: "./myapp",
      },
    });
    ```

  </Tab>
</Tabs>

---

## Act as the Bun CLI

<Note>New in Bun v1.2.16</Note>

You can run a standalone executable as if it were the `bun` CLI itself by setting the `BUN_BE_BUN=1` environment variable. When this variable is set, the executable will ignore its bundled entrypoint and instead expose all the features of Bun's CLI.

For example, consider an executable compiled from a simple script:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
echo "console.log(\"you shouldn't see this\");" > such-bun.js
bun build --compile ./such-bun.js
```

```txt theme={"theme":{"light":"github-light","dark":"dracula"}}
[3ms] bundle 1 modules
[89ms] compile such-bun
```

Normally, running `./such-bun` with arguments would execute the script.

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
# Executable runs its own entrypoint by default
./such-bun install
```

```txt theme={"theme":{"light":"github-light","dark":"dracula"}}
you shouldn't see this
```

However, with the `BUN_BE_BUN=1` environment variable, it acts just like the `bun` binary:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
# With the env var, the executable acts like the `bun` CLI
BUN_BE_BUN=1 ./such-bun install
```

```txt theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install v1.2.16-canary.1 (1d1db811)
Checked 63 installs across 64 packages (no changes) [5.00ms]
```

This is useful for building CLI tools on top of Bun that may need to install packages, bundle dependencies, run different or local files and more without needing to download a separate binary or install bun.

---

## Full-stack executables

<Note>New in Bun v1.2.17</Note>

Bun's `--compile` flag can create standalone executables that contain both server and client code, making it ideal for full-stack applications. When you import an HTML file in your server code, Bun automatically bundles all frontend assets (JavaScript, CSS, etc.) and embeds them into the executable. When Bun sees the HTML import on the server, it kicks off a frontend build process to bundle JavaScript, CSS, and other assets.

<CodeGroup>
  ```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { serve } from "bun";
  import index from "./index.html";

const server = serve({
routes: {
"/": index,
"/api/hello": { GET: () => Response.json({ message: "Hello from API" }) },
},
});

console.log(`Server running at http://localhost:${server.port}`);

````

```html index.html icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <h1>Hello World</h1>
    <script src="./app.ts"></script>
  </body>
</html>
````

```ts app.ts icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log('Hello from the client!');
```

```css styles.css icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
body {
  background-color: #f0f0f0;
}
```

</CodeGroup>

To build this into a single executable:

<Tabs>
  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile ./server.ts --outfile myapp
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./server.ts"],
      compile: {
        outfile: "./myapp",
      },
    });
    ```
  </Tab>
</Tabs>

This creates a self-contained binary that includes:

- Your server code
- The Bun runtime
- All frontend assets (HTML, CSS, JavaScript)
- Any npm packages used by your server

The result is a single file that can be deployed anywhere without needing Node.js, Bun, or any dependencies installed. Just run:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
./myapp
```

Bun automatically handles serving the frontend assets with proper MIME types and cache headers. The HTML import is replaced with a manifest object that `Bun.serve` uses to efficiently serve pre-bundled assets.

For more details on building full-stack applications with Bun, see the [full-stack guide](/bundler/fullstack).

---

## Worker

To use workers in a standalone executable, add the worker's entrypoint to the build:

<Tabs>
  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile ./index.ts ./my-worker.ts --outfile myapp
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./index.ts", "./my-worker.ts"],
      compile: {
        outfile: "./myapp",
      },
    });
    ```
  </Tab>
</Tabs>

Then, reference the worker in your code:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log('Hello from Bun!');

// Any of these will work:
new Worker('./my-worker.ts');
new Worker(new URL('./my-worker.ts', import.meta.url));
new Worker(new URL('./my-worker.ts', import.meta.url).href);
```

When you add multiple entrypoints to a standalone executable, they will be bundled separately into the executable.

In the future, we may automatically detect usages of statically-known paths in `new Worker(path)` and then bundle those into the executable, but for now, you'll need to add it to the shell command manually like the above example.

If you use a relative path to a file not included in the standalone executable, it will attempt to load that path from disk relative to the current working directory of the process (and then error if it doesn't exist).

---

## SQLite

You can use `bun:sqlite` imports with `bun build --compile`.

By default, the database is resolved relative to the current working directory of the process.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import db from './my.db' with { type: 'sqlite' };

console.log(db.query('select * from users LIMIT 1').get());
```

That means if the executable is located at `/usr/bin/hello`, the user's terminal is located at `/home/me/Desktop`, it will look for `/home/me/Desktop/my.db`.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
cd /home/me/Desktop
./hello
```

---

## Embed assets & files

Standalone executables support embedding files directly into the binary. This lets you ship a single executable that contains images, JSON configs, templates, or any other assets your application needs.

### How it works

Use the `with { type: "file" }` [import attribute](https://github.com/tc39/proposal-import-attributes) to embed a file:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import icon from './icon.png' with { type: 'file' };

console.log(icon);
// During development: "./icon.png"
// After compilation: "$bunfs/icon-a1b2c3d4.png" (internal path)
```

The import returns a **path string** that points to the embedded file. At build time, Bun:

1. Reads the file contents
2. Embeds the data into the executable
3. Replaces the import with an internal path (prefixed with `$bunfs/`)

You can then read this embedded file using `Bun.file()` or Node.js `fs` APIs.

### Reading embedded files with Bun.file()

`Bun.file()` is the recommended way to read embedded files:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import icon from './icon.png' with { type: 'file' };
import { file } from 'bun';

// Get file contents as different types
const bytes = await file(icon).arrayBuffer(); // ArrayBuffer
const text = await file(icon).text(); // string (for text files)
const blob = file(icon); // Blob

// Stream the file in a response
export default {
  fetch(req) {
    return new Response(file(icon), {
      headers: { 'Content-Type': 'image/png' },
    });
  },
};
```

### Reading embedded files with Node.js fs

Embedded files work seamlessly with Node.js file system APIs:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import icon from './icon.png' with { type: 'file' };
import config from './config.json' with { type: 'file' };
import { readFileSync, promises as fs } from 'node:fs';

// Synchronous read
const iconBuffer = readFileSync(icon);

// Async read
const configData = await fs.readFile(config, 'utf-8');
const parsed = JSON.parse(configData);

// Check file stats
const stats = await fs.stat(icon);
console.log(`Icon size: ${stats.size} bytes`);
```

### Practical examples

#### Embedding a JSON config file

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import configPath from './default-config.json' with { type: 'file' };
import { file } from 'bun';

// Load the embedded default configuration
const defaultConfig = await file(configPath).json();

// Merge with user config if it exists
const userConfig = await file('./user-config.json')
  .json()
  .catch(() => ({}));
const config = { ...defaultConfig, ...userConfig };
```

#### Serving static assets in an HTTP server

Use `static` routes in `Bun.serve()` for efficient static file serving:

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import favicon from './favicon.ico' with { type: 'file' };
import logo from './logo.png' with { type: 'file' };
import styles from './styles.css' with { type: 'file' };
import { file, serve } from 'bun';

serve({
  static: {
    '/favicon.ico': file(favicon),
    '/logo.png': file(logo),
    '/styles.css': file(styles),
  },
  fetch(req) {
    return new Response('Not found', { status: 404 });
  },
});
```

Bun automatically handles Content-Type headers and caching for static routes.

#### Embedding templates

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import templatePath from './email-template.html' with { type: 'file' };
import { file } from 'bun';

async function sendWelcomeEmail(user: { name: string; email: string }) {
  const template = await file(templatePath).text();
  const html = template
    .replace('{{name}}', user.name)
    .replace('{{email}}', user.email);

  // Send email with the rendered template...
}
```

#### Embedding binary files

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import wasmPath from './processor.wasm' with { type: 'file' };
import fontPath from './font.ttf' with { type: 'file' };
import { file } from 'bun';

// Load a WebAssembly module
const wasmBytes = await file(wasmPath).arrayBuffer();
const wasmModule = await WebAssembly.instantiate(wasmBytes);

// Read binary font data
const fontData = await file(fontPath).bytes();
```

### Embed SQLite databases

If your application wants to embed a SQLite database into the compiled executable, set `type: "sqlite"` in the import attribute and the `embed` attribute to `"true"`.

The database file must already exist on disk. Then, import it in your code:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import myEmbeddedDb from './my.db' with { type: 'sqlite', embed: 'true' };

console.log(myEmbeddedDb.query('select * from users LIMIT 1').get());
```

Finally, compile it into a standalone executable:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile ./index.ts --outfile mycli
```

<Note>
  The database file must exist on disk when you run `bun build --compile`. The `embed: "true"` attribute tells the
  bundler to include the database contents inside the compiled executable. When running normally with `bun run`, the
  database file is loaded from disk just like a regular SQLite import.
</Note>

In the compiled executable, the embedded database is read-write, but all changes are lost when the executable exits (since it's stored in memory).

### Embed N-API Addons

You can embed `.node` files into executables.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const addon = require('./addon.node');

console.log(addon.hello());
```

Unfortunately, if you're using `@mapbox/node-pre-gyp` or other similar tools, you'll need to make sure the `.node` file is directly required or it won't bundle correctly.

### Embed directories

To embed a directory with `bun build --compile`, include file patterns in your build:

<Tabs>
  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile ./index.ts ./public/**/*.png
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    import { Glob } from "bun";

    // Expand glob pattern to file list
    const glob = new Glob("./public/**/*.png");
    const pngFiles = Array.from(glob.scanSync("."));

    await Bun.build({
      entrypoints: ["./index.ts", ...pngFiles],
      compile: {
        outfile: "./myapp",
      },
    });
    ```

  </Tab>
</Tabs>

Then, you can reference the files in your code:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import icon from './public/assets/icon.png' with { type: 'file' };
import { file } from 'bun';

export default {
  fetch(req) {
    // Embedded files can be streamed from Response objects
    return new Response(file(icon));
  },
};
```

This is honestly a workaround, and we expect to improve this in the future with a more direct API.

### Listing embedded files

`Bun.embeddedFiles` gives you access to all embedded files as `Blob` objects:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import './icon.png' with { type: 'file' };
import './data.json' with { type: 'file' };
import './template.html' with { type: 'file' };
import { embeddedFiles } from 'bun';

// List all embedded files
for (const blob of embeddedFiles) {
  console.log(`${blob.name} - ${blob.size} bytes`);
}
// Output:
//   icon-a1b2c3d4.png - 4096 bytes
//   data-e5f6g7h8.json - 256 bytes
//   template-i9j0k1l2.html - 1024 bytes
```

Each item in `Bun.embeddedFiles` is a `Blob` with a `name` property:

```ts theme={"theme":{"light":"github-light","dark":"dracula"}}
embeddedFiles: ReadonlyArray<Blob>;
```

This is useful for dynamically serving all embedded assets using `static` routes:

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import './public/favicon.ico' with { type: 'file' };
import './public/logo.png' with { type: 'file' };
import './public/styles.css' with { type: 'file' };
import { embeddedFiles, serve } from 'bun';

// Build static routes from all embedded files
const staticRoutes: Record<string, Blob> = {};
for (const blob of embeddedFiles) {
  // Remove hash from filename: "icon-a1b2c3d4.png" -> "icon.png"
  const name = blob.name.replace(/-[a-f0-9]+\./, '.');
  staticRoutes[`/${name}`] = blob;
}

serve({
  static: staticRoutes,
  fetch(req) {
    return new Response('Not found', { status: 404 });
  },
});
```

<Note>
  `Bun.embeddedFiles` excludes bundled source code (`.ts`, `.js`, etc.) to help protect your application's source.
</Note>

#### Content hash

By default, embedded files have a content hash appended to their name. This is useful for situations where you want to serve the file from a URL or CDN and have fewer cache invalidation issues. But sometimes, this is unexpected and you might want the original name instead:

To disable the content hash, configure asset naming:

<Tabs>
  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile --asset-naming="[name].[ext]" ./index.ts
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./index.ts"],
      compile: {
        outfile: "./myapp",
      },
      naming: {
        asset: "[name].[ext]",
      },
    });
    ```
  </Tab>
</Tabs>

---

## Minification

To trim down the size of the executable, enable minification:

<Tabs>
  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile --minify ./index.ts --outfile myapp
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./index.ts"],
      compile: {
        outfile: "./myapp",
      },
      minify: true, // Enable all minification
    });

    // Or granular control:
    await Bun.build({
      entrypoints: ["./index.ts"],
      compile: {
        outfile: "./myapp",
      },
      minify: {
        whitespace: true,
        syntax: true,
        identifiers: true,
      },
    });
    ```

  </Tab>
</Tabs>

This uses Bun's minifier to reduce the code size. Overall though, Bun's binary is still way too big and we need to make it smaller.

---

## Windows-specific flags

When compiling a standalone executable on Windows, there are platform-specific options to customize metadata on the generated `.exe` file:

<Tabs>
  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    # Custom icon
    bun build --compile --windows-icon=path/to/icon.ico ./app.ts --outfile myapp

    # Hide console window (for GUI apps)
    bun build --compile --windows-hide-console ./app.ts --outfile myapp
    ```

  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./app.ts"],
      compile: {
        outfile: "./myapp",
        windows: {
          icon: "./path/to/icon.ico",
          hideConsole: true,
          // Additional Windows metadata:
          title: "My Application",
          publisher: "My Company",
          version: "1.0.0",
          description: "A standalone Windows application",
          copyright: "Copyright 2024",
        },
      },
    });
    ```
  </Tab>
</Tabs>

Available Windows options:

- `icon` - Path to `.ico` file for the executable icon
- `hideConsole` - Disable the background terminal (for GUI apps)
- `title` - Application title in file properties
- `publisher` - Publisher name in file properties
- `version` - Version string in file properties
- `description` - Description in file properties
- `copyright` - Copyright notice in file properties

<Warning>These flags currently cannot be used when cross-compiling because they depend on Windows APIs.</Warning>

---

## Code signing on macOS

To codesign a standalone executable on macOS (which fixes Gatekeeper warnings), use the `codesign` command.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
codesign --deep --force -vvvv --sign "XXXXXXXXXX" ./myapp
```

We recommend including an `entitlements.plist` file with JIT permissions.

```xml icon="xml" title="info.plist" theme={"theme":{"light":"github-light","dark":"dracula"}}
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-executable-page-protection</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
```

To codesign with JIT support, pass the `--entitlements` flag to `codesign`.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
codesign --deep --force -vvvv --sign "XXXXXXXXXX" --entitlements entitlements.plist ./myapp
```

After codesigning, verify the executable:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
codesign -vvv --verify ./myapp
./myapp: valid on disk
./myapp: satisfies its Designated Requirement
```

<Warning>Codesign support requires Bun v1.2.4 or newer.</Warning>

---

## Code splitting

Standalone executables support code splitting. Use `--compile` with `--splitting` to create an executable that loads code-split chunks at runtime.

<Tabs>
  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build --compile --splitting ./src/entry.ts --outdir ./build
    ```
  </Tab>

  <Tab title="JavaScript">
    ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./src/entry.ts"],
      compile: true,
      splitting: true,
      outdir: "./build",
    });
    ```
  </Tab>
</Tabs>

<CodeGroup>
  ```ts src/entry.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  console.log("Entrypoint loaded");
  const lazy = await import("./lazy.ts");
  lazy.hello();
  ```

```ts src/lazy.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export function hello() {
  console.log('Lazy module loaded');
}
```

</CodeGroup>

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
./build/entry
```

```txt theme={"theme":{"light":"github-light","dark":"dracula"}}
Entrypoint loaded
Lazy module loaded
```

---

## Using plugins

Plugins work with standalone executables, allowing you to transform files during the build process:

```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import type { BunPlugin } from 'bun';

const envPlugin: BunPlugin = {
  name: 'env-loader',
  setup(build) {
    build.onLoad({ filter: /\.env\.json$/ }, async (args) => {
      // Transform .env.json files into validated config objects
      const env = await Bun.file(args.path).json();

      return {
        contents: `export default ${JSON.stringify(env)};`,
        loader: 'js',
      };
    });
  },
};

await Bun.build({
  entrypoints: ['./cli.ts'],
  compile: {
    outfile: './mycli',
  },
  plugins: [envPlugin],
});
```

Example use case - embedding environment config at build time:

```ts cli.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import config from './config.env.json';

console.log(`Running in ${config.environment} mode`);
console.log(`API endpoint: ${config.apiUrl}`);
```

Plugins can perform any transformation: compile YAML/TOML configs, inline SQL queries, generate type-safe API clients, or preprocess templates. Refer to the [plugin documentation](/bundler/plugins) for more details.

---

## Unsupported CLI arguments

Currently, the `--compile` flag can only accept a single entrypoint at a time and does not support the following flags:

- `--outdir` — use `outfile` instead (except when using with `--splitting`).
- `--public-path`
- `--target=node` or `--target=browser`
- `--no-bundle` - we always bundle everything into the executable.

---

## API reference

The `compile` option in `Bun.build()` accepts three forms:

```ts title="types" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
interface BuildConfig {
  entrypoints: string[];
  compile: boolean | Bun.Build.Target | CompileBuildOptions;
  // ... other BuildConfig options (minify, sourcemap, define, plugins, etc.)
}

interface CompileBuildOptions {
  target?: Bun.Build.Target; // Cross-compilation target
  outfile?: string; // Output executable path
  execArgv?: string[]; // Runtime arguments (process.execArgv)
  autoloadTsconfig?: boolean; // Load tsconfig.json (default: false)
  autoloadPackageJson?: boolean; // Load package.json (default: false)
  autoloadDotenv?: boolean; // Load .env files (default: true)
  autoloadBunfig?: boolean; // Load bunfig.toml (default: true)
  windows?: {
    icon?: string; // Path to .ico file
    hideConsole?: boolean; // Hide console window
    title?: string; // Application title
    publisher?: string; // Publisher name
    version?: string; // Version string
    description?: string; // Description
    copyright?: string; // Copyright notice
  };
}
```

Usage forms:

```ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Simple boolean - compile for current platform (uses entrypoint name as output)
compile: true

// Target string - cross-compile (uses entrypoint name as output)
compile: "bun-linux-x64"

// Full options object - specify outfile and other options
compile: {
  target: "bun-linux-x64",
  outfile: "./myapp",
}
```

### Supported targets

```ts title="Bun.Build.Target" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
type Target =
  | 'bun-darwin-x64'
  | 'bun-darwin-x64-baseline'
  | 'bun-darwin-arm64'
  | 'bun-linux-x64'
  | 'bun-linux-x64-baseline'
  | 'bun-linux-x64-modern'
  | 'bun-linux-arm64'
  | 'bun-linux-x64-musl'
  | 'bun-linux-arm64-musl'
  | 'bun-windows-x64'
  | 'bun-windows-x64-baseline'
  | 'bun-windows-x64-modern';
```

### Complete example

```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import type { BunPlugin } from 'bun';

const myPlugin: BunPlugin = {
  name: 'my-plugin',
  setup(build) {
    // Plugin implementation
  },
};

const result = await Bun.build({
  entrypoints: ['./src/cli.ts'],
  compile: {
    target: 'bun-linux-x64',
    outfile: './dist/mycli',
    execArgv: ['--smol'],
    autoloadDotenv: false,
    autoloadBunfig: false,
  },
  minify: true,
  sourcemap: 'linked',
  bytecode: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    VERSION: JSON.stringify('1.0.0'),
  },
  plugins: [myPlugin],
});

if (result.success) {
  console.log('Build successful:', result.outputs[0].path);
}
```
