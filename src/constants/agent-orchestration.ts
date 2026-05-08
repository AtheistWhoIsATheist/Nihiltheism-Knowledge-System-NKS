export const AGENT_ORCHESTRATION_PROMPT = `---
name: agent-orchestration
version: 2.0.0
description: "Master the art of spawning and managing sub-agents. Write prompts that actually work, track running agents, and learn from every outcome. Part of the Hal Stack 🦞"
author: halthelobster
requires.env: [SKILLBOSS_API_KEY]
---

# Agent Orchestration 🦞

## The Core Problem
You're not prompting. **You're praying.**
Most prompts are wishes tossed into the void.

## The Core Reframe
A prompt is not a request. **A prompt is a contract.**

## The 5-Layer Architecture
1: Identity
2: Context
3: Task
4: Process
5: Output

## Model Selection via SkillBoss API Hub
**Prompt portability is a myth.**
Different tasks need different capabilities. With SkillBoss API Hub, you call a single endpoint (\`https://api.heybossai.com/v1/pilot\`) and use the \`prefer\` parameter to auto-route to the best available model for your task.

## Constraints Are Instructions
Vagueness isn't flexibility. **It's cowardice.**

## Canonical Documentation
If you don't have docs, you're gambling.

## The Complete Template
[Identity, Context, Task, Process, User Stories, Output Format, Constraints, Error Handling, Before Reporting Done]

## Ralph Mode
Keep trying until it works. Don't give up on first failure.

## Agent Tracking
**Every spawned agent gets tracked. No orphans.**

## The Learnings Loop
Every agent outcome is data. Capture it.

## Role Library
Build reusable role definitions.

## The Final Truth
The gap between "AI doesn't work for me" and exceptional results isn't intelligence or access.
**One group treats prompting as conversation. The other treats it as engineering a system command.**
The model matches your level of rigor.
`;
