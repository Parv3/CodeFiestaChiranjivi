# Portable Worker Reputation and Credential Wallet Across Gig Platforms

This repository contains the architecture, specifications, and code for a decentralized worker reputation wallet using W3C Verifiable Credentials and DID-based issuer identification.

For the comprehensive system design, credential schemas, cryptographic workflows, and verification guides, see:
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

---

# Repository Guidelines and Collaboration Rules

Welcome to the CodeFiesta repository. All contributors and team members must follow the rules below to maintain code quality, avoid merge conflicts, and ensure smooth collaboration throughout the hackathon.

## 1. Branching Policy

- Do not push directly to the main branch.
- Every collaborator must create their own dedicated branch for work.
- Recommended branch naming convention:
  - feature/<your-name>-<feature-name>
  - fix/<your-name>-<bug-name>
  - chore/<your-name>-<task-name>
  - Example: feature/parv-auth-module

## 2. Tech Stack Consistency

- The established tech stack and versions must remain consistent across all branches.
- Do not introduce alternative frameworks, libraries, package managers, or language runtimes without explicit team agreement.
- Do not mix different package managers (use the single agreed tool such as npm, pnpm, yarn, or pip).
- Ensure configuration files and dependencies are locked to prevent breaking builds.

## 3. Workflow and Merging

- Pull latest changes: Before starting work, always pull the latest changes from the main branch into your branch.
- Small, frequent commits: Write clear, descriptive commit messages.
- Pull Requests (PRs):
  - Submit a Pull Request targeting the main branch when your feature or fix is ready.
  - Test your branch locally before creating a PR.
  - Request at least one teammate review before merging.
- Resolve conflicts locally: If your branch has conflicts with main, rebase or merge main into your branch and resolve conflicts locally before merging into main.

## 4. Code Standards and Hygiene

- Do not commit sensitive data, including API keys, passwords, tokens, or .env files.
- Ensure the project builds and runs without errors before pushing.
- Keep the codebase clean: remove unused imports, debug logs, and temporary comments before opening a PR.
