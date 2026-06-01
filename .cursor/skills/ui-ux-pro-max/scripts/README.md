# UI/UX Pro Max — scripts

The skill references `scripts/search.py` and CSV data files (`ui-reasoning.csv`, domain databases).

These are **not bundled** in this repo yet. The skill still works via the **Quick Reference** checklists and rule tables in [SKILL.md](../SKILL.md).

To enable CLI search (`--design-system`, `--domain`, `--stack`):

1. Copy `search.py` and the `data/` CSV folder from your UI/UX Pro Max source into this directory.
2. Run from repo root:

```bash
python .cursor/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard minimal" --design-system -p "My App"
```

On Windows, use `python` instead of `python3` if needed.
