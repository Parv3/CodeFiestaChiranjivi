"""Pre-install hook and shell alias helpers for transparent protection.
Supports bash, zsh, and PowerShell environments.
"""

BASH_ZSH_HOOK = """# SafePkg transparent wrapper for pip and npm
# Add these lines to your ~/.bashrc or ~/.zshrc

pip() {
    if [ "$1" = "install" ]; then
        python -m safepkg pip "$@"
    else
        command pip "$@"
    fi
}

npm() {
    if [ "$1" = "install" ] || [ "$1" = "i" ]; then
        python -m safepkg npm "$@"
    else
        command npm "$@"
    fi
}
"""

POWERSHELL_HOOK = """# SafePkg transparent wrapper for pip and npm
# Add these lines to your PowerShell profile ($PROFILE)

function pip {
    if ($args[0] -eq 'install') {
        python -m safepkg pip @args
    } else {
        $realPip = (Get-Command -CommandType Application pip -ErrorAction SilentlyContinue | Select-Object -First 1).Source
        if ($realPip) { & $realPip @args } else { Write-Error "pip command not found" }
    }
}

function npm {
    if ($args[0] -eq 'install' -or $args[0] -eq 'i') {
        python -m safepkg npm @args
    } else {
        $realNpm = (Get-Command -CommandType Application npm -ErrorAction SilentlyContinue | Select-Object -First 1).Source
        if ($realNpm) { & $realNpm @args } else { Write-Error "npm command not found" }
    }
}
"""


def get_hook_script(shell_type: str = "bash") -> str:
    """Return hook instructions or script for the specified shell."""
    shell = shell_type.lower()
    if "power" in shell or "pwsh" in shell:
        return POWERSHELL_HOOK
    return BASH_ZSH_HOOK
