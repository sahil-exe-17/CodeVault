"""
GitHub service: fetch files and content from public/private repositories.
"""
import logging
import re
from typing import Optional

import httpx
from github import Github, GithubException

logger = logging.getLogger(__name__)

CODE_EXTENSIONS = {
    ".py", ".java", ".c", ".cpp", ".js", ".ts", ".ipynb",
    ".txt", ".jsx", ".tsx", ".cs", ".go", ".rb", ".rs", ".kt", ".swift",
}


def _parse_repo_url(repo_url: str) -> tuple[str, str]:
    """Extract owner and repo name from a GitHub URL."""
    patterns = [
        r"github\.com[:/]([^/]+)/([^/\s.]+?)(?:\.git)?$",
        r"github\.com/([^/]+)/([^/\s.]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, repo_url)
        if match:
            return match.group(1), match.group(2)
    raise ValueError(f"Cannot parse GitHub repo URL: {repo_url}")


async def get_repo_files(repo_url: str, token: Optional[str] = None) -> dict:
    """
    List all files in a repository and return a tree structure.
    Returns: {owner, repo, default_branch, tree: [{path, type, size, sha}]}
    """
    try:
        owner, repo_name = _parse_repo_url(repo_url)
        g = Github(token) if token else Github()
        repo = g.get_repo(f"{owner}/{repo_name}")

        tree_items = []
        git_tree = repo.get_git_tree(repo.default_branch, recursive=True)
        for item in git_tree.tree:
            tree_items.append(
                {
                    "path": item.path,
                    "type": item.type,  # "blob" | "tree"
                    "size": item.size,
                    "sha": item.sha,
                }
            )

        return {
            "owner": owner,
            "repo": repo_name,
            "default_branch": repo.default_branch,
            "description": repo.description,
            "tree": tree_items,
        }
    except GithubException as e:
        logger.error("GitHub API error: %s", e)
        raise ValueError(f"GitHub error: {e.data.get('message', str(e))}")
    except Exception as e:
        logger.error("get_repo_files error: %s", e)
        raise


async def get_file_content(
    repo_url: str, file_path: str, token: Optional[str] = None
) -> str:
    """Fetch raw content of a file from a GitHub repository."""
    try:
        owner, repo_name = _parse_repo_url(repo_url)
        g = Github(token) if token else Github()
        repo = g.get_repo(f"{owner}/{repo_name}")
        content_file = repo.get_contents(file_path)
        if isinstance(content_file, list):
            raise ValueError(f"'{file_path}' is a directory, not a file.")
        return content_file.decoded_content.decode("utf-8", errors="replace")
    except GithubException as e:
        logger.error("GitHub get_file_content error: %s", e)
        raise ValueError(f"GitHub error: {e.data.get('message', str(e))}")
    except Exception as e:
        logger.error("get_file_content error: %s", e)
        raise


async def filter_code_files(tree: list) -> list:
    """
    Filter tree items to only code/text files with supported extensions.
    Returns list of file paths.
    """
    result = []
    for item in tree:
        if item.get("type") != "blob":
            continue
        path: str = item.get("path", "")
        ext = "." + path.rsplit(".", 1)[-1].lower() if "." in path else ""
        if ext in CODE_EXTENSIONS:
            result.append(item)
    return result
