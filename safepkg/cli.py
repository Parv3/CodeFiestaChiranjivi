"""Command-line interface for SafePkg.
Wraps pip and npm install commands, runs scans on requirement files,
and functions as a pre-install hook.
"""

import sys
import os
import subprocess
import argparse
from typing import List, Tuple, Optional
from .detector import analyze_package_name, TypoCandidate
from .registry import fetch_metadata, PackageMetadata
from .ui import print_banner, display_warning_card, prompt_student_action
from .hooks import get_hook_script


def extract_package_names(args: List[str]) -> Tuple[List[str], List[str]]:
    """Separates package names from CLI flags/options.
    Returns (package_names, flags).
    """
    packages = []
    flags = []
    skip_next = False

    options_with_value = {
        "-i", "--index-url", "--extra-index-url", "-t", "--target",
        "-r", "--requirement", "-c", "--constraint", "--prefix",
        "--registry"
    }

    for i, arg in enumerate(args):
        if skip_next:
            flags.append(arg)
            skip_next = False
            continue

        if arg in options_with_value:
            flags.append(arg)
            skip_next = True
            continue

        if arg.startswith("-"):
            flags.append(arg)
        else:
            # Strip version specifiers like ==, >=, <=, @version
            clean = arg.split("==")[0].split(">=")[0].split("<=")[0].split("~=")[0].split("@")[0].strip()
            if clean:
                packages.append(clean)

    return packages, flags


def inspect_package(
    pkg: str,
    ecosystem: str,
    interactive: bool = True
) -> Tuple[bool, Optional[str]]:
    """Inspects a single package name for typos and masquerading risks.
    Returns (is_approved, replacement_package_name).
    """
    candidates = analyze_package_name(pkg, ecosystem=ecosystem)
    if not candidates:
        return True, None

    # Found suspicious typo / lookalike
    top_candidate = candidates[0]

    # Fetch live metadata from registry
    suspect_meta = fetch_metadata(pkg, ecosystem=ecosystem)
    intended_meta = fetch_metadata(top_candidate.intended, ecosystem=ecosystem)

    display_warning_card(
        suspect_name=pkg,
        candidate=top_candidate,
        suspect_meta=suspect_meta,
        intended_meta=intended_meta,
        ecosystem=ecosystem
    )

    if not interactive:
        return False, None

    action = prompt_student_action(
        suggested_pkg=top_candidate.intended,
        suspect_pkg=pkg
    )

    if action == "replace":
        return True, top_candidate.intended
    elif action == "proceed":
        return True, None
    else:
        return False, None


def execute_wrapped_command(executable: str, args: List[str]):
    """Execute the underlying system pip or npm command."""
    cmd = [executable] + args
    try:
        res = subprocess.run(cmd)
        sys.exit(res.returncode)
    except FileNotFoundError:
        print(f"\nError: '{executable}' command not found on this system.", file=sys.stderr)
        sys.exit(1)


def run_install_wrapper(ecosystem: str, raw_args: List[str]):
    """Intercepts and verifies a pip or npm install command."""
    # Remove leading 'install' or 'i' if present
    install_verbs = {"install", "i", "add"}
    filtered_args = []
    verb_found = False

    for arg in raw_args:
        if not verb_found and arg in install_verbs:
            verb_found = True
            continue
        filtered_args.append(arg)

    packages, flags = extract_package_names(filtered_args)

    if not packages:
        # User just ran `pip install` without specific packages (e.g. from current directory)
        cmd_args = ["install"] + filtered_args
        execute_wrapped_command(ecosystem, cmd_args)
        return

    replacements = {}
    for pkg in packages:
        approved, replacement = inspect_package(pkg, ecosystem=ecosystem, interactive=True)
        if not approved:
            print(f"\n[SafePkg] Installation canceled to protect your system.\n")
            sys.exit(1)
        if replacement:
            replacements[pkg] = replacement

    # Build final arguments with any replacements applied
    final_args = ["install"]
    for arg in filtered_args:
        # Check if arg matches any replaced package name
        base = arg.split("==")[0].split(">=")[0].split("<=")[0].split("@")[0].strip()
        if base in replacements:
            suffix = arg[len(base):]
            final_args.append(replacements[base] + suffix)
        else:
            final_args.append(arg)

    print(f"\n[SafePkg] Proceeding with installation using: {ecosystem} {' '.join(final_args)}")
    execute_wrapped_command(ecosystem, final_args)


def scan_file(file_path: str):
    """Scan a requirements.txt or package.json for typosquatting risks."""
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.", file=sys.stderr)
        sys.exit(1)

    print_banner()
    print(f"Scanning dependency manifest: {file_path}\n")

    ecosystem = "pip"
    packages = []

    if file_path.endswith(".json"):
        ecosystem = "npm"
        import json
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            deps = data.get("dependencies", {})
            dev_deps = data.get("devDependencies", {})
            packages = list(deps.keys()) + list(dev_deps.keys())
        except Exception as e:
            print(f"Error reading JSON file: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    clean = line.split("==")[0].split(">=")[0].split("<=")[0].split(";")[0].strip()
                    if clean:
                        packages.append(clean)

    flagged_count = 0
    for pkg in packages:
        candidates = analyze_package_name(pkg, ecosystem=ecosystem)
        if candidates:
            flagged_count += 1
            top = candidates[0]
            print(f"  [FLAGGED] '{pkg}' -> Likely intended: '{top.intended}' ({top.match_type})")

    if flagged_count == 0:
        print("  All packages appear safe. No typosquatting patterns detected.")
    else:
        print(f"\nFound {flagged_count} suspect packages in {file_path}.")


def main():
    """Main CLI entrypoint."""
    if len(sys.argv) < 2:
        print_banner()
        print("Usage:")
        print("  safepkg pip install <package>")
        print("  safepkg npm install <package>")
        print("  safepkg install <package>")
        print("  safepkg scan <requirements.txt | package.json>")
        print("  safepkg check --package <pkg> --ecosystem <pip|npm>")
        print("  safepkg hook [bash|powershell]")
        sys.exit(0)

    first_arg = sys.argv[1].lower()

    if first_arg == "pip":
        run_install_wrapper("pip", sys.argv[2:])
    elif first_arg == "npm":
        run_install_wrapper("npm", sys.argv[2:])
    elif first_arg == "install":
        # Auto-detect ecosystem
        ecosystem = "npm" if os.path.exists("package.json") else "pip"
        run_install_wrapper(ecosystem, sys.argv[2:])
    elif first_arg == "scan":
        if len(sys.argv) < 3:
            print("Error: Specify a file to scan (e.g., requirements.txt or package.json)")
            sys.exit(1)
        scan_file(sys.argv[2])
    elif first_arg == "check":
        parser = argparse.ArgumentParser(description="Pre-install hook check")
        parser.add_argument("--package", required=True, help="Package name to verify")
        parser.add_argument("--ecosystem", default="pip", choices=["pip", "npm"], help="Ecosystem")
        args = parser.parse_args(sys.argv[2:])
        approved, _ = inspect_package(args.package, ecosystem=args.ecosystem, interactive=False)
        sys.exit(0 if approved else 1)
    elif first_arg == "hook":
        shell = sys.argv[2] if len(sys.argv) > 2 else "bash"
        print(get_hook_script(shell))
    else:
        # Default pass-through if called with install command
        run_install_wrapper("pip", sys.argv[1:])


if __name__ == "__main__":
    main()
