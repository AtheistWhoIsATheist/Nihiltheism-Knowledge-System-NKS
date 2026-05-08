---
name: ontology-generator
description: Generate comprehensive ontological knowledge graphs in [[wikilinks]] syntax for InfraNodus visualization. Use when the user requests to create an ontology, extract entities and relationships from text, or generate knowledge graph structures. Handles both topic-based ontology generation and entity extraction from existing text. Output is formatted for direct paste into InfraNodus.com for network visualization and AI-powered gap analysis.
---

# Ontology Generator for InfraNodus

Generate ontological knowledge graphs in InfraNodus format using [[wikilinks]] syntax. Output can be pasted directly into InfraNodus.com to visualize as a network and develop gaps and clusters with AI.

## Input Types

Accept two input types:

1. **Topic**: Generate comprehensive ontology for a given domain
2. **Text**: Extract ontological structure from provided text

## Entity Generation Principles

Generate comprehensive responses with multiple elements. Explore the full variety of entities belonging to the domain of inquiry. Include various types of:

- Entities
- Classes
- Relationships
- Axioms
- Rules

**Critical**: Avoid hierarchical structures with one central idea. First iteration should be comprehensive, long, and cover the widest possible domain. Generate network structures, not trees.

## Output Format

Each entity uses [[wikilink]] syntax. Relations are described in plain text within the same paragraph. Relation codes appear at paragraph end in [squarebrackets].

### Syntax Pattern

```
[[entity1]] relation description [[entity2]] [relationCode]
```

### Formatting Rules

- Each relation = separate paragraph line
- Minimum 8 paragraphs per relationship type
- Each statement MUST have at least 2 entities in [[wikilinks]]
- Each statement MUST have a [relationCode]

## Relation Codes

Use ONLY these relation codes (unless user provides alternatives):

- `[isA]` - Class membership
- `[partOf]` - Component relationship
- `[hasAttribute]` - Properties and characteristics
- `[relatedTo]` - General associations
- `[dependentOn]` - Dependencies
- `[causes]` - Causal relationships
- `[locatedIn]` - Spatial relationships
- `[occursAt]` - Temporal relationships
- `[derivedFrom]` - Origin and derivation
- `[opposes]` - Contradictory relationships

## Output Requirements

1. Output ONLY the ontology
2. Use simple code snippet format for easy copying
3. NO explanations before or after
4. NO descriptions of what was done
5. NO metadata or commentary
6. JUST the ontology in specified format

## InfraNodus Tool Handoff

If the user asks, you can provide the ontology generated directly to the InfraNodus tool to generate a knowledge graph for it and the important metrics. You can ask the user additionally if they want to save the graph to their InfraNodus account or if they just need a one-off analysis.

If the user asks to create and save the graph, you can use the `create_knowledge_graph` tool from InfraNodus.

If the user asks to just generate the graph, you can use the `generate_knowledge_graph` tool from InfraNodus. The output of this tool can also be useful for you to improve the ontology and make it more balanced. You can also use the `cognitive_variability` skill for that.

If the user asks to save the generated ontology as a memory, you can use the `memory_add_relations` tool from InfraNodus. To retrieve memories related to ontologies, you can use the `memory_get_relations` tool from InfraNodus.

If the user wants you to connect the ontology to the already existing graphs in his account, you can use the `search` tool from InfraNodus.

---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup
---

# Finishing a Development Branch

## Overview

Guide completion of development work by presenting clear options and handling chosen workflow.

**Core principle:** Verify tests → Present options → Execute choice → Clean up.

**Announce at start:** "I'm using the finishing-a-development-branch skill to complete this work."

## The Process

### Step 1: Verify Tests

**Before presenting options, verify tests pass:**

```bash
# Run project's test suite
npm test / cargo test / pytest / go test ./...
```

**If tests fail:**
```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed with merge/PR until tests pass.
```

Stop. Don't proceed to Step 2.

**If tests pass:** Continue to Step 2.

### Step 2: Determine Base Branch

```bash
# Try common base branches
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

Or ask: "This branch split from main - is that correct?"

### Step 3: Present Options

Present exactly these 4 options:

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

**Don't add explanation** - keep options concise.

### Step 4: Execute Choice

#### Option 1: Merge Locally

```bash
# Switch to base branch
git checkout <base-branch>

# Pull latest
git pull

# Merge feature branch
git merge <feature-branch>

# Verify tests on merged result
<test command>

# If tests pass
git branch -d <feature-branch>
```

Then: Cleanup worktree (Step 5)

#### Option 2: Push and Create PR

```bash
# Push branch
git push -u origin <feature-branch>

# Create PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

Then: Cleanup worktree (Step 5)

#### Option 3: Keep As-Is

Report: "Keeping branch <name>. Worktree preserved at <path>."

**Don't cleanup worktree.**

#### Option 4: Discard

**Confirm first:**
```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

Wait for exact confirmation.

If confirmed:
```bash
git checkout <base-branch>
git branch -D <feature-branch>
```

Then: Cleanup worktree (Step 5)

### Step 5: Cleanup Worktree

**For Options 1, 2, 4:**

Check if in worktree:
```bash
git worktree list | grep $(git branch --show-current)
```

If yes:
```bash
git worktree remove <worktree-path>
```

**For Option 3:** Keep worktree.

## Quick Reference

| Option | Merge | Push | Keep Worktree | Cleanup Branch |
|--------|-------|------|---------------|----------------|
| 1. Merge locally | ✓ | - | - | ✓ |
| 2. Create PR | - | ✓ | ✓ | - |
| 3. Keep as-is | - | - | ✓ | - |
| 4. Discard | - | - | - | ✓ (force) |

## Common Mistakes

**Skipping test verification**
- **Problem:** Merge broken code, create failing PR
- **Fix:** Always verify tests before offering options

**Open-ended questions**
- **Problem:** "What should I do next?" → ambiguous
- **Fix:** Present exactly 4 structured options

**Automatic worktree cleanup**
- **Problem:** Remove worktree when might need it (Option 2, 3)
- **Fix:** Only cleanup for Options 1 and 4

**No confirmation for discard**
- **Problem:** Accidentally delete work
- **Fix:** Require typed "discard" confirmation

## Red Flags

**Never:**
- Proceed with failing tests
- Merge without verifying tests on result
- Delete work without confirmation
- Force-push without explicit request

**Always:**
- Verify tests before offering options
- Present exactly 4 options
- Get typed confirmation for Option 4
- Clean up worktree for Options 1 & 4 only

## Integration

**Called by:**
- **subagent-driven-development** (Step 7) - After all tasks complete
- **executing-plans** (Step 5) - After all batches complete

**Pairs with:**
- **using-git-worktrees** - Cleans up worktree created by that skill