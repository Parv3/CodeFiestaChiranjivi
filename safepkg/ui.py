"""Terminal UI for warnings, package comparisons, and student prompts.
Uses clean ANSI formatting without external dependencies.
"""

import sys
import os
from typing import Optional
from .registry import PackageMetadata
from .detector import TypoCandidate

# ANSI Color codes
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
CYAN = "\033[96m"
WHITE = "\033[97m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"

# Disable colors if running in dumb terminal or NO_COLOR is set
if os.environ.get("NO_COLOR") or not sys.stdout.isatty():
    RED = GREEN = YELLOW = BLUE = MAGENTA = CYAN = WHITE = BOLD = DIM = RESET = ""


def print_banner():
    """Print tool banner."""
    print(f"{CYAN}{BOLD}SafePkg{RESET} {DIM}v1.0 - Package Security & Typosquatting Guard{RESET}\n")


def format_row(label: str, val1: str, val2: str, width: int = 24) -> str:
    """Format a 3-column table row."""
    return f"  {label:<{width}} | {val1:<{width}} | {val2:<{width}}"


def display_warning_card(
    suspect_name: str,
    candidate: TypoCandidate,
    suspect_meta: Optional[PackageMetadata],
    intended_meta: Optional[PackageMetadata],
    ecosystem: str
):
    """Render a comprehensive warning card and side-by-side comparison table."""
    border = "=" * 74
    divider = "-" * 74

    print(f"\n{RED}{BOLD}{border}{RESET}")
    print(f"{RED}{BOLD}  SECURITY WARNING: POTENTIAL TYPOSQUATTING / MASQUERADING DETECTED{RESET}")
    print(f"{RED}{BOLD}{border}{RESET}")

    print(f"\n  You requested to install:  {YELLOW}{BOLD}{suspect_name}{RESET}")
    print(f"  Did you mean:              {GREEN}{BOLD}{candidate.intended}{RESET}")
    print(f"  Threat Category:           {MAGENTA}{candidate.match_type}{RESET}")
    print(f"  Detection Details:         {candidate.details}")

    print(f"\n{CYAN}{BOLD}  SIDE-BY-SIDE REGISTRY METRIC COMPARISON ({ecosystem.upper()}):{RESET}")
    print(f"{DIM}{divider}{RESET}")
    print(format_row(f"{BOLD}Metric{RESET}", f"{YELLOW}{BOLD}Entered: {suspect_name}{RESET}", f"{GREEN}{BOLD}Intended: {candidate.intended}{RESET}"))
    print(f"{DIM}{divider}{RESET}")

    # Exists / Status
    s_status = f"{RED}Not Found (404){RESET}" if (suspect_meta and not suspect_meta.exists) else f"{YELLOW}Registered{RESET}"
    i_status = f"{GREEN}Official / Registered{RESET}" if (intended_meta and intended_meta.exists) else "Registered"
    print(format_row("Registry Status", s_status, i_status))

    # Downloads
    s_dl = suspect_meta.downloads_human if suspect_meta else "N/A"
    i_dl = intended_meta.downloads_human if intended_meta else "N/A"
    print(format_row("Monthly Downloads", f"{RED}{s_dl}{RESET}", f"{GREEN}{BOLD}{i_dl}{RESET}"))

    # Age
    s_age = suspect_meta.age_human if suspect_meta else "N/A"
    i_age = intended_meta.age_human if intended_meta else "N/A"
    print(format_row("Package Age", s_age, f"{GREEN}{i_age}{RESET}"))

    # Author
    s_auth = (suspect_meta.author[:22] if suspect_meta and suspect_meta.author else "Unknown")
    i_auth = (intended_meta.author[:22] if intended_meta and intended_meta.author else "Community / Verified")
    print(format_row("Publisher / Author", s_auth, i_auth))

    print(f"{DIM}{divider}{RESET}")

    # Explanatory tip for students
    print(f"\n  {YELLOW}{BOLD}Why is this dangerous?{RESET}")
    print(f"  Threat actors commonly upload malicious lookalike packages mimicking popular")
    print(f"  libraries. These masquerading packages often execute hidden scripts during install")
    print(f"  to steal passwords, API tokens, or personal files.\n")


def prompt_student_action(suggested_pkg: str, suspect_pkg: str) -> str:
    """Prompt the user for their choice.
    Returns: 'abort', 'replace', or 'proceed'
    """
    if not sys.stdin.isatty():
        # Non-interactive mode (e.g. CI or automated pipe)
        return "abort"

    print(f"  {BOLD}What would you like to do?{RESET}")
    print(f"  [{GREEN}{BOLD}1{RESET}] {BOLD}Cancel installation (Safe / Recommended){RESET}")
    print(f"  [{CYAN}{BOLD}2{RESET}] Install legitimate package '{GREEN}{BOLD}{suggested_pkg}{RESET}' instead")
    print(f"  [{RED}3{RESET}] Proceed with requested '{YELLOW}{suspect_pkg}{RESET}' anyway (High Risk)")

    try:
        choice = input(f"\n  Select option [1/2/3] (default 1): ").strip()
    except (EOFError, KeyboardInterrupt):
        print("\n")
        return "abort"

    if choice == "2":
        return "replace"
    elif choice == "3":
        return "proceed"
    return "abort"
