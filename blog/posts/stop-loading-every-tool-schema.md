When an AI agent can work inside your tools, it becomes useful. On the AI SaaS platform I work on, users connect apps like Google Sheets, Notion, monday.com, Apollo.io and Canva through MCP connectors, and the agent acts inside them.

The first version had a simple rule: every connected app sends every tool schema to the model. That works for two apps. With 10+ apps it stopped working.

## The problem

Each tool comes with a JSON schema that describes its inputs. Multiply that by dozens of tools per app and the agent was carrying **150K+ tokens of tool definitions** before the user typed a word. That meant:

- slower responses
- higher cost on every request
- worse tool choice, because the model had too many similar options to choose from

## The fix: a connector gateway

Instead of showing the model every tool, the gateway shows it **two small tools**:

```python
@tool
def search_tools(query: str, limit: int = 5) -> list[dict]:
    """Find connector tools by intent. Returns name + one-line summary."""
    return registry.search(query, limit)

@tool
async def call_tool(name: str, args: dict) -> dict:
    """Validate args against the tool's schema, then run it via MCP."""
    spec = registry.get(name)      # full schema loaded only now
    spec.validate(args)
    return await mcp_client.call(spec.server, name, args)
```

The agent first asks "which tool can add a row to a sheet?", gets a short list back, and then calls the one it needs. The full schema is only used at call time, for validation.

## What changed

- The prompt carries a few small schemas instead of every connector's catalogue.
- Adding a new connector no longer makes every request bigger.
- Validation errors are caught at the gateway, where a self-healing retry can reshape the input before the call fails.

## Takeaway

If your agent's tool list grows with every integration, treat tools like a search problem, not a list. Let the model ask for what it needs.

*Questions or want to compare notes? [Get in touch](index.html#contact).*
