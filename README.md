# SafePkg: Typosquatting and Masquerading Package Detector

When learning software development, students install dozens of libraries every week following tutorials and guides. A quick slip of the keyboard, such as typing "requets" instead of "requests" or "lodsh" instead of "lodash", can quietly install a malicious lookalike package that exfiltrates environment variables, API keys, or student data.

SafePkg provides a lightweight, dependency-free safety net. It wraps regular pip and npm installation workflows, inspects package names for typos and masquerading patterns, cross-checks official registry metadata, and gives student developers clear side-by-side warnings before any code runs on their machine.

---

## Core Capabilities

- Multi-ecosystem coverage: Works seamlessly with both Python (pip / PyPI) and JavaScript (npm).
- Damerau-Levenshtein edit distance: Catches single-character typos, character transpositions (e.g., "requets"), omissions, and insertions.
- Unicode homoglyph detection: Identifies visual lookalikes where Latin characters are swapped with Cyrillic or Greek equivalents (e.g., Cyrillic 'a' inside package names).
- Keyboard proximity analysis: Accounts for common QWERTY physical slips (e.g., hitting adjacent keys).
- Combosquatting detection: Catches deceptively appended prefixes, suffixes, and separator variations (such as "requests-python" or underscore versus hyphen swaps).
- Registry metadata cross-checking: Queries PyPI and npm registries in real time to compare monthly download counts, package age, and maintainer records.
- Actionable terminal interface: Displays clean side-by-side comparison tables and gives students three clear choices: cancel safely, auto-install the intended package, or proceed at their own risk.
- Zero external dependencies: Uses only Python 3 standard library modules, meaning students do not need to install heavy dependencies just to run their package protector.

---

## Quick Start

You can run SafePkg directly with Python 3.

### 1. Protect pip installations

```bash
python safepkg.py pip install requets
```

If a typo is detected, SafePkg flags the package, queries PyPI, shows a comparison card, and lets you automatically substitute the real package:

```text
You requested to install:  requets
Did you mean:              requests
Threat Category:           Edit Distance (Levenshtein)
Detection Details:         Close edit distance (1) to popular package 'requests'

What would you like to do?
[1] Cancel installation (Safe / Recommended)
[2] Install legitimate package 'requests' instead
[3] Proceed with requested 'requets' anyway (High Risk)
```

Selecting option 2 will safely execute `pip install requests`.

### 2. Protect npm installations

```bash
python safepkg.py npm install expresss
```

SafePkg contacts the npm registry, detects that "expresss" only has a few thousand downloads compared to 500M+ for the real "express" package, and displays the risk summary.

### 3. Scan dependency files

To check an entire project manifest before committing or deploying:

```bash
# Python requirements
python safepkg.py scan requirements.txt

# Node.js dependencies
python safepkg.py scan package.json
```

### 4. Use in CI/CD or pre-commit hooks

Run non-interactive checks that return standard exit codes (0 for safe, 1 for flagged packages):

```bash
python safepkg.py check --package requets --ecosystem pip
```

---

## Shell Integration

You can set up shell wrappers so that every standard `pip install` or `npm install` command automatically runs through SafePkg.

### Bash / Zsh

To view the wrapper script:

```bash
python safepkg.py hook bash
```

Add the following to your `~/.bashrc` or `~/.zshrc`:

```bash
pip() {
    if [ "$1" = "install" ]; then
        python /path/to/safepkg.py pip "$@"
    else
        command pip "$@"
    fi
}

npm() {
    if [ "$1" = "install" ] || [ "$1" = "i" ]; then
        python /path/to/safepkg.py npm "$@"
    else
        command npm "$@"
    fi
}
```

### PowerShell (Windows)

To view the PowerShell profile configuration:

```powershell
python safepkg.py hook powershell
```

Add the functions to your `$PROFILE` to intercept `pip install` and `npm install` calls transparently.

---

## Project Structure

```text
CodeFiesta/
|-- README.md              # Project documentation and guide
|-- safepkg.py             # Top-level executable CLI runner
|-- safepkg/
|   |-- __init__.py        # Package initialization
|   |-- cli.py             # CLI parser, command interception, and dispatch
|   |-- detector.py        # Levenshtein, homoglyphs, keyboard slips, and combosquatting
|   |-- popular_packages.py# Curated top PyPI and npm package reference dataset
|   |-- registry.py        # Live PyPI and npm registry metadata fetcher
|   |-- ui.py              # Terminal warning formatting and interactive prompts
|   \-- hooks.py           # Shell hooks and transparent wrapper scripts
\-- tests/
    |-- test_safepkg.py    # Unit tests for detection, registry, and CLI
    \-- sample_requirements.txt # Sample manifest for verification
```

---

## Running Tests

To run the full unit test suite:

```bash
python -m unittest tests/test_safepkg.py
```

All tests run locally using standard Python libraries.
