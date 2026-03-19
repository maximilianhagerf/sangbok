# Commit Conventions

Format: `type(scope): description`

## Types

| Type | When to use |
|------|-------------|
| `feat` | New feature (new route, new UI component, new CMS capability) |
| `fix` | Bug fix |
| `style` | Formatting, Biome changes — no logic change |
| `refactor` | Code restructure — no behaviour change |
| `db` | Schema changes, migrations, seed data |
| `chore` | Deps, config, tooling (vite, tsconfig, biome.json) |

## Scopes

`client` · `server` · `db` · `print` · `seed`

## Examples

```
feat(client): add drag-to-reorder sections within song editor
feat(server): add bulk delete endpoint for songs
fix(client): checkbox hidden when selecting mode is active
db: add columns field to songs table
style: run biome format across client and server
chore: add @biomejs/biome and format scripts to root package.json
refactor(server): replace forEach with for loop in reorder transactions
feat(print): render song pages live from database
```

## Rules

- Lowercase, no period at end
- Present tense ("add" not "added")
- Keep under 72 characters
- No ticket numbers needed — this is a personal project
- **One commit per session** — always a single message covering all staged changes, never one commit per file or per change type
