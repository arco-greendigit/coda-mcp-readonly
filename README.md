# Coda MCP Read-Only Server

This project implements a Model Context Protocol (MCP) server that acts as a bridge to interact with the [Coda](https://coda.io/) API. It allows an MCP client (like an AI assistant) to perform actions on Coda pages, such as listing, creating, reading, updating, duplicating, and renaming.

## Acknowledgments

This project is a fork of the original [Coda MCP server](https://github.com/orellazri/coda-mcp).

**Credits to [Orel Lazri](https://github.com/orellazri)** for the original implementation and the foundation of this tool.

## Features

The server exposes the following tools to the MCP client:

- **`coda_list_documents`**: Lists all documents available to the user.
- **`coda_list_pages`**: Lists all pages within the configured Coda document with pagination support.
- **`coda_get_page_content`**: Retrieves the content of a specified page (by ID or name) as markdown.
- **`coda_peek_page`**: Peek into the beginning of a page and return a limited number of lines.
- **`coda_resolve_link`**: Resolve metadata given a browser link to a Coda object.
- **`coda_list_tables`**: List tables in a document.
- **`coda_list_columns`**: List columns in a table.
- **`coda_list_rows`**: List rows in a table with optional filtering and sorting.
- **`coda_get_row`**: Get a single row from a table.

## Usage

Add the MCP server to Cursor/Claude Desktop/etc. like so:

```json
{
  "mcpServers": {
    "coda": {
      "command": "npx",
      "args": ["-y", "coda-mcp@latest"],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

Required environment variables:

- `API_KEY`: Your Coda API key. You can generate one from your Coda account settings.

This MCP server is also available with Docker, like so:

```json
{
  "mcpServers": {
    "coda": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "API_KEY", "reaperberri/coda-mcp:latest"],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

## Local Setup

1.  **Prerequisites:**

    - Node.js
    - pnpm

2.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd coda-mcp
    ```

3.  **Install dependencies:**

    ```bash
    pnpm install
    ```

4.  **Build the project:**
    ```bash
    pnpm build
    ```
    This compiles the TypeScript code to JavaScript in the `dist/` directory.

## Running the Server

The MCP server communicates over standard input/output (stdio). To run it, set the environment variables and run the compiled JavaScript file - `dist/index.js`.
