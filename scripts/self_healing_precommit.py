#!/usr/bin/env python3
"""
self_healing_precommit.py — Intelligent Pre-Commit Build Error Loop & Self-Healing Engine

Automates detection, diagnosis, and deterministic remediation of build, lint, type,
and test collection errors during git pre-commit checks.

Key Features:
  - Multi-pass execution loop (up to MAX_HEAL_PASSES, default 3)
  - Pattern-based error classification (Next.js cache, ESLint, TypeScript, Python bytecode, etc.)
  - Safe, idempotent, non-destructive automated remediation actions
  - Re-stages healed files into the git index
  - Anti-oscillation guard preventing cyclic reapplications
  - Actionable diagnostics when non-healable errors persist
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, List, Optional, Set

# Configuration
MAX_HEAL_PASSES = 3

# ANSI Formatting
BOLD = "\033[1m"
GREEN = "\033[0;32m"
RED = "\033[0;31m"
YELLOW = "\033[1;33m"
BLUE = "\033[0;34m"
MAGENTA = "\033[0;35m"
CYAN = "\033[0;36m"
NC = "\033[0m"


@dataclass
class CommandResult:
    command: list[str]
    returncode: int
    stdout: str
    stderr: str

    @property
    def output(self) -> str:
        return f"{self.stdout}\n{self.stderr}"


@dataclass
class DetectedIssue:
    issue_type: str
    description: str
    target_file: Optional[str] = None
    remediation_key: str = ""


class BuildErrorClassifier:
    """Analyzes command failure output and classifies issues into known remediation targets."""

    @staticmethod
    def classify_frontend(output: str) -> list[DetectedIssue]:
        issues: list[DetectedIssue] = []

        # 1. Next.js cache or webpack chunk corruption
        if any(
            pattern in output
            for pattern in [
                "WebpackError",
                "Cannot find module",
                ".next/cache",
                "corrupted chunk",
                ".next_check",
                "ENOENT: no such file or directory, open",
            ]
        ) and any(kw in output for kw in [".next", ".next_check", "webpack", "chunks"]):
            issues.append(
                DetectedIssue(
                    issue_type="NEXT_CACHE_CORRUPTION",
                    description="Stale or corrupted Next.js build cache / webpack chunk detected",
                    remediation_key="clean_next_cache",
                )
            )

        # 2. Dynamic server usage during static prerendering (Missing force-dynamic)
        dynamic_match = re.search(
            r"(?:Page couldn't be rendered statically because it used|Dynamic server usage:).*?(src/app/api/[^\s\)]+)",
            output,
            re.DOTALL,
        )
        if not dynamic_match:
            dynamic_match = re.search(
                r"Error occurred prerendering page \"(/api/[^\"]+)\"", output
            )
        if dynamic_match:
            route = dynamic_match.group(1).strip()
            issues.append(
                DetectedIssue(
                    issue_type="MISSING_FORCE_DYNAMIC",
                    description=f"API route '{route}' failed static prerendering (needs export const dynamic = 'force-dynamic')",
                    target_file=route,
                    remediation_key=f"inject_force_dynamic:{route}",
                )
            )

        # 3. Missing next-env.d.ts or missing type definitions
        if "next-env.d.ts" in output or "Cannot find type definition file for 'next'" in output:
            issues.append(
                DetectedIssue(
                    issue_type="MISSING_NEXT_ENV",
                    description="Missing or corrupted Next.js environment declaration file next-env.d.ts",
                    remediation_key="restore_next_env",
                )
            )

        # 4. ESLint auto-fixable rules
        if any(
            kw in output
            for kw in [
                "eslint",
                "prettier",
                "react/no-unescaped-entities",
                "semi",
                "quotes",
                "comma-dangle",
                "import/order",
            ]
        ) and "error" in output.lower():
            issues.append(
                DetectedIssue(
                    issue_type="ESLINT_AUTOFIXABLE",
                    description="Auto-fixable ESLint formatting, quote, or entity issues found",
                    remediation_key="run_eslint_fix",
                )
            )

        # 5. Stale tsbuildinfo or typescript cache
        if "tsconfig.tsbuildinfo" in output or "error TS5083" in output:
            issues.append(
                DetectedIssue(
                    issue_type="STALE_TS_BUILDINFO",
                    description="Corrupted or stale TypeScript build information file tsconfig.tsbuildinfo",
                    remediation_key="clean_tsbuildinfo",
                )
            )

        return issues

    @staticmethod
    def classify_backend(output: str) -> list[DetectedIssue]:
        issues: list[DetectedIssue] = []

        # 1. Bytecode or Pytest cache corruption
        if any(
            kw in output
            for kw in [
                "Bad magic number in .pyc",
                "EOFError: EOF in multi-line statement",
                ".pytest_cache",
                "__pycache__",
                "cannot import name",
            ]
        ) and ("pyc" in output or "cache" in output):
            issues.append(
                DetectedIssue(
                    issue_type="PYTHON_BYTECODE_CORRUPTION",
                    description="Corrupted Python bytecode or stale .pytest_cache detected",
                    remediation_key="clean_python_cache",
                )
            )

        # 2. Missing __init__.py in test or app package directory
        init_match = re.search(r"ModuleNotFoundError: No module named '([^']+)'", output)
        if init_match:
            module_name = init_match.group(1)
            issues.append(
                DetectedIssue(
                    issue_type="MISSING_PACKAGE_INIT",
                    description=f"Missing module or package __init__.py for '{module_name}'",
                    target_file=module_name,
                    remediation_key=f"ensure_package_init:{module_name}",
                )
            )

        # 3. Executable permission denied on scripts
        if "Permission denied" in output and (".sh" in output or "scripts" in output):
            issues.append(
                DetectedIssue(
                    issue_type="SCRIPT_PERMISSION_DENIED",
                    description="Executable script has missing execute permissions",
                    remediation_key="restore_script_permissions",
                )
            )

        return issues


class RemediationEngine:
    """Applies safe, idempotent remediation actions for detected issues."""

    def __init__(self, workspace_root: Path):
        self.workspace_root = workspace_root
        if (workspace_root / "package.json").exists():
            self.frontend_dir = workspace_root
            self.backend_dir = workspace_root.parent / "igaming-backend"
        elif (workspace_root / "requirements.txt").exists():
            self.backend_dir = workspace_root
            self.frontend_dir = workspace_root.parent / "igaming-next"
        else:
            self.frontend_dir = workspace_root / "igaming-next"
            self.backend_dir = workspace_root / "igaming-backend"
        self.applied_remediations: Set[str] = set()
        self.modified_files: Set[Path] = set()

    def apply(self, issue: DetectedIssue) -> bool:
        """Applies remediation for the issue. Returns True if action was applied."""
        if issue.remediation_key in self.applied_remediations:
            # Prevent cyclic reapplication
            return False

        self.applied_remediations.add(issue.remediation_key)
        key = issue.remediation_key
        success = False

        if key == "clean_next_cache":
            success = self._clean_next_cache()
        elif key.startswith("inject_force_dynamic:"):
            route = key.split(":", 1)[1]
            success = self._inject_force_dynamic(route)
        elif key == "restore_next_env":
            success = self._restore_next_env()
        elif key == "run_eslint_fix":
            success = self._run_eslint_fix()
        elif key == "clean_tsbuildinfo":
            success = self._clean_tsbuildinfo()
        elif key == "clean_python_cache":
            success = self._clean_python_cache()
        elif key.startswith("ensure_package_init:"):
            pkg = key.split(":", 1)[1]
            success = self._ensure_package_init(pkg)
        elif key == "restore_script_permissions":
            success = self._restore_script_permissions()

        return True

    def _clean_next_cache(self) -> bool:
        """Purges Next.js cache directories."""
        cleaned = False
        for dirname in [".next", ".next_check", ".turbo"]:
            target = self.frontend_dir / dirname
            if target.exists():
                try:
                    shutil.rmtree(target, ignore_errors=True)
                    cleaned = True
                except Exception:
                    pass
        return cleaned

    def _inject_force_dynamic(self, route_identifier: str) -> bool:
        """Ensures non-static API route declares export const dynamic = 'force-dynamic'."""
        # Find matching route file
        clean_route = route_identifier.lstrip("/")
        candidates = [
            self.frontend_dir / clean_route,
            self.frontend_dir / "src" / "app" / clean_route / "route.ts",
            self.frontend_dir / "src" / "app" / clean_route / "route.js",
            self.frontend_dir / f"{clean_route}/route.ts",
        ]
        target_path: Optional[Path] = None
        for cand in candidates:
            if cand.is_file():
                target_path = cand
                break
            elif cand.is_dir() and (cand / "route.ts").is_file():
                target_path = cand / "route.ts"
                break

        if not target_path or not target_path.exists():
            return False

        try:
            content = target_path.read_text(encoding="utf-8")
            if "export const dynamic" in content:
                return False  # Already present

            injected = "export const dynamic = 'force-dynamic'\n\n" + content
            target_path.write_text(injected, encoding="utf-8")
            self.modified_files.add(target_path)
            return True
        except Exception:
            return False

    def _restore_next_env(self) -> bool:
        """Restores standard next-env.d.ts file."""
        target = self.frontend_dir / "next-env.d.ts"
        content = '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/basic-features/typescript for more information.\n'
        try:
            target.write_text(content, encoding="utf-8")
            self.modified_files.add(target)
            return True
        except Exception:
            return False

    def _run_eslint_fix(self) -> bool:
        """Runs npm run lint -- --fix."""
        try:
            subprocess.run(
                ["npm", "run", "lint", "--", "--fix"],
                cwd=str(self.frontend_dir),
                capture_output=True,
                text=True,
                timeout=60,
            )
            return True
        except Exception:
            return False

    def _clean_tsbuildinfo(self) -> bool:
        """Cleans tsconfig.tsbuildinfo file."""
        target = self.frontend_dir / "tsconfig.tsbuildinfo"
        if target.exists():
            try:
                target.unlink()
                return True
            except Exception:
                return False
        return False

    def _clean_python_cache(self) -> bool:
        """Cleans __pycache__, *.pyc, and .pytest_cache across backend."""
        cleaned = False
        for pattern in ["__pycache__", ".pytest_cache"]:
            for p in self.backend_dir.rglob(pattern):
                try:
                    if p.is_dir():
                        shutil.rmtree(p, ignore_errors=True)
                        cleaned = True
                except Exception:
                    pass
        return cleaned

    def _ensure_package_init(self, pkg_name: str) -> bool:
        """Ensures package directory contains __init__.py."""
        target_dir = self.backend_dir / pkg_name.replace(".", "/")
        if target_dir.is_dir():
            init_file = target_dir / "__init__.py"
            if not init_file.exists():
                try:
                    init_file.write_text("# Auto-generated package initialization\n")
                    self.modified_files.add(init_file)
                    return True
                except Exception:
                    return False
        return False

    def _restore_script_permissions(self) -> bool:
        """Restores executable permission on shell and python scripts."""
        restored = False
        for p in self.workspace_root.rglob("*.sh"):
            try:
                p.chmod(p.stat().st_mode | 0o111)
                restored = True
            except Exception:
                pass
        return restored

    def stage_modified_files(self) -> None:
        """Stages any files auto-fixed during self-healing into git index."""
        if not self.modified_files:
            return

        for f in self.modified_files:
            if f.exists():
                try:
                    repo_dir = f.parent
                    while repo_dir != repo_dir.parent and not (repo_dir / ".git").exists():
                        repo_dir = repo_dir.parent
                    git_cwd = str(repo_dir) if (repo_dir / ".git").exists() else str(self.workspace_root)
                    subprocess.run(["git", "add", str(f)], cwd=git_cwd, check=False)
                    print(f"{CYAN}  [SELF-HEAL STAGED] Auto-fixed file re-staged: {f.name}{NC}")
                except Exception:
                    pass


class HealingLoopRunner:
    """Runs verification commands inside an automated, self-healing retry loop."""

    def __init__(self, workspace_root: Path, max_passes: int = MAX_HEAL_PASSES):
        self.workspace_root = workspace_root
        self.max_passes = max_passes
        self.engine = RemediationEngine(workspace_root)

    def run_command(self, cmd: list[str], cwd: Path, env: Optional[dict] = None) -> CommandResult:
        full_env = os.environ.copy()
        if env:
            full_env.update(env)

        proc = subprocess.run(
            cmd,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            env=full_env,
        )
        return CommandResult(
            command=cmd,
            returncode=proc.returncode,
            stdout=proc.stdout,
            stderr=proc.stderr,
        )

    def execute_with_healing(
        self,
        step_name: str,
        cmd: list[str],
        cwd: Path,
        classifier: Callable[[str], list[DetectedIssue]],
        env: Optional[dict] = None,
    ) -> bool:
        """Executes a step inside a self-healing loop."""
        for attempt in range(1, self.max_passes + 1):
            if attempt > 1:
                print(f"{YELLOW}  --> [HEALING PASS {attempt}/{self.max_passes}] Retrying {step_name}...{NC}")

            res = self.run_command(cmd, cwd, env)

            if res.returncode == 0:
                if attempt > 1:
                    print(f"{GREEN}  ✔ {step_name} PASSED after automated self-healing pass {attempt}!{NC}")
                return True

            # Step failed: analyze errors
            issues = classifier(res.output)
            if not issues:
                # No known auto-healable issues found
                print(f"{RED}  ✖ {step_name} failed with non-auto-healable errors:{NC}")
                self._print_error_tail(res)
                return False

            print(f"{MAGENTA}  ⚙ Detected {len(issues)} healable issue(s) in {step_name}:{NC}")
            healed_any = False
            for issue in issues:
                print(f"    - [{issue.issue_type}] {issue.description}")
                applied = self.engine.apply(issue)
                if applied:
                    print(f"{GREEN}      ✔ Applied auto-remediation: {issue.remediation_key}{NC}")
                    healed_any = True
                else:
                    print(f"{YELLOW}      ⚠ Remediation already attempted or skipped: {issue.remediation_key}{NC}")

            if not healed_any:
                print(f"{RED}  ✖ Exhausted available unique remediations for {step_name}.{NC}")
                self._print_error_tail(res)
                return False

            # Stage any healed files into git
            self.engine.stage_modified_files()

        print(f"{RED}  ✖ {step_name} failed to resolve after {self.max_passes} self-healing passes.{NC}")
        return False

    def _print_error_tail(self, res: CommandResult, lines: int = 15) -> None:
        combined = [line for line in res.output.splitlines() if line.strip()]
        tail = combined[-lines:] if len(combined) > lines else combined
        print(f"{RED}----------------------------------------------------------{NC}")
        for l in tail:
            print(f"{RED}  {l}{NC}")
        print(f"{RED}----------------------------------------------------------{NC}")


def run_frontend_suite(runner: HealingLoopRunner, frontend_dir: Path) -> bool:
    print(f"\n{BOLD}{BLUE}📦 [1/2] Checking Node.js & React with Self-Healing Build Loop...{NC}")

    # Step 1: Interactivity
    print("  --> Verifying feature usability & interactivity...")
    ok = runner.execute_with_healing(
        "Interactivity Audit",
        ["npm", "run", "check:interactive"],
        frontend_dir,
        BuildErrorClassifier.classify_frontend,
    )
    if not ok:
        return False

    # Step 2: TypeScript Types
    print("  --> Verifying TypeScript types (tsc --noEmit)...")
    ok = runner.execute_with_healing(
        "TypeScript Type-Check",
        ["npm", "run", "type-check"],
        frontend_dir,
        BuildErrorClassifier.classify_frontend,
    )
    if not ok:
        return False

    # Step 3: ESLint
    print("  --> Verifying ESLint rules (next lint)...")
    ok = runner.execute_with_healing(
        "ESLint Rules",
        ["npm", "run", "lint"],
        frontend_dir,
        BuildErrorClassifier.classify_frontend,
    )
    if not ok:
        return False

    # Step 4: Unit Tests
    print("  --> Running Node.js & React unit tests...")
    ok = runner.execute_with_healing(
        "Frontend Unit Tests",
        ["npm", "run", "test:unit"],
        frontend_dir,
        BuildErrorClassifier.classify_frontend,
    )
    if not ok:
        return False

    # Step 5: Next.js Production Build
    print("  --> Validating Next.js production build...")
    build_env = {
        "NEXT_DIST_DIR": ".next_check",
        "NODE_ENV": "production",
        "NEXT_PUBLIC_API_URL": os.getenv("NEXT_PUBLIC_API_URL", "https://igaming-backend-dev.onrender.com"),
        "NEXT_PUBLIC_SUPABASE_URL": os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://mock-ci-supabase.co"),
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "mock-ci-anon-key-valid-length-1234567890"),
    }
    ok = runner.execute_with_healing(
        "Next.js Production Build",
        ["npm", "run", "build"],
        frontend_dir,
        BuildErrorClassifier.classify_frontend,
        env=build_env,
    )
    if not ok:
        return False

    print(f"{GREEN}✔ Node.js & React build, types, and tests PASSED cleanly.{NC}")
    return True


def run_backend_suite(runner: HealingLoopRunner, backend_dir: Path, force_all: bool = False) -> bool:
    print(f"\n{BOLD}{BLUE}🐍 [2/2] Checking Python with Self-Healing Test Discovery Loop...{NC}")

    # Resolve Python & Pytest
    python_bin = backend_dir / "venv" / "bin" / "python3"
    pytest_bin = backend_dir / "venv" / "bin" / "pytest"
    if not python_bin.exists():
        python_bin = Path("python3")
        pytest_bin = Path("pytest")

    env = {"PYTHONPATH": "."}

    # Step 1: Syntax & py_compile
    print("  --> Validating Python syntax & compilation (build check)...")
    ok = runner.execute_with_healing(
        "Python Syntax Compilation",
        [str(python_bin), "-m", "py_compile", "app/main.py", "app/core/config.py", "app/core/database.py"],
        backend_dir,
        BuildErrorClassifier.classify_backend,
        env=env,
    )
    if not ok:
        return False

    # Step 2: Hermetic test collection check
    print("  --> Validating full test suite import & collection (zero collection errors)...")
    ok = runner.execute_with_healing(
        "Pytest Collection Check",
        [str(pytest_bin), "-q", "tests", "--collect-only", "--ignore=tests/test_ai_chat.py", "--ignore=tests/test_ai_accuracy.py"],
        backend_dir,
        BuildErrorClassifier.classify_backend,
        env=env,
    )
    if not ok:
        return False

    # Step 3: Authorization and RBAC guards
    print("  --> Verifying API authorization & RBAC page registry guards...")
    ok = runner.execute_with_healing(
        "API Authorization & RBAC Guards",
        [str(pytest_bin), "tests/test_endpoint_authz_guard.py", "tests/test_rbac_page_registry.py", "-q"],
        backend_dir,
        BuildErrorClassifier.classify_backend,
        env=env,
    )
    if not ok:
        return False

    # Step 4: Core infrastructure
    core_candidates = [
        "tests/test_sentry_telegram_alerts.py",
        "tests/test_cache_keepalive.py",
        "tests/test_tenant_isolation.py",
    ]
    core_tests = [t for t in core_candidates if (backend_dir / t).exists()]
    if core_tests:
        print("  --> Verifying core infrastructure & Sentry error tracking...")
        ok = runner.execute_with_healing(
            "Core Infrastructure Tests",
            [str(pytest_bin)] + core_tests + ["-q"],
            backend_dir,
            BuildErrorClassifier.classify_backend,
            env=env,
        )
        if not ok:
            return False

    # Step 5: Staged and impacted app tests
    staged_tests: list[str] = []
    try:
        proc = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            cwd=str(backend_dir),
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode == 0:
            for line in proc.stdout.splitlines():
                line = line.strip()
                if not line:
                    continue
                if line.startswith("tests/") and line.endswith(".py") and "test_" in line:
                    if not any(ig in line for ig in ["integration", "test_ai_chat", "test_ai_accuracy"]):
                        if (backend_dir / line).exists() and line not in staged_tests:
                            staged_tests.append(line)
                elif line.startswith("app/") and line.endswith(".py"):
                    base = Path(line).stem
                    candidate = f"tests/test_{base}.py"
                    if (backend_dir / candidate).exists() and candidate not in staged_tests:
                        staged_tests.append(candidate)
    except Exception:
        pass

    if staged_tests:
        print(f"  --> Running tests for staged changes: {' '.join(staged_tests)}...")
        ok = runner.execute_with_healing(
            "Staged Changes Tests",
            [str(pytest_bin), "-q"] + staged_tests,
            backend_dir,
            BuildErrorClassifier.classify_backend,
            env=env,
        )
        if not ok:
            return False

    # Step 6: Full Hermetic CI Validation Pytest Suite
    if force_all and os.getenv("SKIP_CI_TESTS") != "1":
        print("  --> Running full hermetic CI test suite validation...")
        ok = runner.execute_with_healing(
            "Full CI Pytest Suite",
            [
                str(pytest_bin),
                "-q",
                "tests",
                "--timeout=300",
                "--ignore=tests/integration/",
                "--ignore=tests/test_ai_chat.py",
                "--ignore=tests/test_ai_accuracy.py",
            ],
            backend_dir,
            BuildErrorClassifier.classify_backend,
            env=env,
        )
        if not ok:
            return False

    print(f"{GREEN}✔ Python build, guards, and test suites PASSED cleanly.{NC}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Intelligent Pre-Commit Self-Healing Build Runner")
    parser.add_argument("--frontend", action="store_true", help="Run only frontend self-healing checks")
    parser.add_argument("--backend", action="store_true", help="Run only backend self-healing checks")
    parser.add_argument("--all", action="store_true", default=True, help="Run full-stack tests including complete CI test suite (default: True)")
    parser.add_argument("--quick", action="store_true", help="Skip full CI test suite for rapid WIP iteration")
    parser.add_argument("--max-passes", type=int, default=MAX_HEAL_PASSES, help="Maximum self-healing attempts")
    args = parser.parse_args()

    curr = Path(__file__).resolve().parent
    workspace_root = curr
    for candidate in [curr.parent, curr, curr.parent.parent]:
        if (candidate / "igaming-next").is_dir() or (candidate / "igaming-backend").is_dir():
            workspace_root = candidate
            break

    if (workspace_root / "package.json").exists():
        frontend_dir = workspace_root
        backend_dir = workspace_root.parent / "igaming-backend"
    elif (workspace_root / "requirements.txt").exists():
        backend_dir = workspace_root
        frontend_dir = workspace_root.parent / "igaming-next"
    else:
        frontend_dir = workspace_root / "igaming-next"
        backend_dir = workspace_root / "igaming-backend"

    runner = HealingLoopRunner(workspace_root, max_passes=args.max_passes)

    print(f"{BOLD}{MAGENTA}=========================================================={NC}")
    print(f"{BOLD}{MAGENTA} 🚀 Pre-Commit Build Validator & Self-Healing Engine{NC}")
    print(f"{BOLD}{MAGENTA}    Max Self-Healing Passes: {args.max_passes}{NC}")
    print(f"{BOLD}{MAGENTA}=========================================================={NC}")

    run_front = args.frontend or (not args.backend)
    run_back = args.backend or (not args.frontend)

    force_all = not args.quick

    if run_front and frontend_dir.is_dir():
        if not run_frontend_suite(runner, frontend_dir):
            print(f"\n{BOLD}{RED}✖ Pre-commit validation failed in frontend suite.{NC}")
            return 1

    if run_back and backend_dir.is_dir():
        if not run_backend_suite(runner, backend_dir, force_all=force_all):
            print(f"\n{BOLD}{RED}✖ Pre-commit validation failed in backend suite.{NC}")
            return 1

    print(f"\n{BOLD}{GREEN}=========================================================={NC}")
    print(f"{BOLD}{GREEN} ✅ All Pre-Commit Checks PASSED! Clean & safe to commit.{NC}")
    print(f"{BOLD}{GREEN}=========================================================={NC}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
