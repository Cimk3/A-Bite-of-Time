"""Publish a verified new release using Windows Git Credential Manager in memory.

Never prints or persists credentials. Existing published releases are never changed.
The only resumable state is a draft for this version and this exact commit.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
REPO = "Cimk3/A-Bite-of-Time"


def git(*args, input_text=None):
    result = subprocess.run(["git", "-c", "http.proxy=", "-c", "https.proxy=",
                             "-c", "credential.helper=", "-c", "credential.helper=manager", *args],
                            cwd=ROOT, input=input_text, capture_output=True, text=True, check=False)
    if result.returncode:
        raise RuntimeError("Git operation failed: " + args[0])
    return result.stdout.strip()


def main():
    version = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
    accepted = sys.argv[1:] == ["--accepted-082-candidate"] and version == "0.8.2"
    if sys.argv[1:] and not accepted:
        raise RuntimeError("Unsupported release option")
    tag = "v" + version
    commit = git("rev-parse", "HEAD")
    if git("remote", "get-url", "origin") != f"https://github.com/{REPO}.git":
        raise RuntimeError("Unexpected release remote")
    if git("rev-parse", tag + "^{commit}") != commit:
        raise RuntimeError("Release tag does not match HEAD")
    # Unrelated user files outside the curated source archive may coexist here.
    # Every tracked change and every untracked archive input must be reviewed.
    source_inputs = ["AGENTS.md", "package.json", "package-lock.json", "tsconfig.json",
                     "README.md", "LICENSE", "storage-report.json", "build-report.json",
                     "validation-report.json", "upgrade-report.json",
                     "src", "tools", "tests", "assets", "docs", "previews"]
    if git("status", "--porcelain", "--untracked-files=no") or git(
            "ls-files", "--others", "--exclude-standard", "--", *source_inputs):
        raise RuntimeError("Commit all reviewed release files before publishing")
    if not accepted:
        for name in ["validation-report.json", "archive-report.json"]:
            if json.loads((ROOT / name).read_text(encoding="utf-8"))["status"] != "passed":
                raise RuntimeError("Release verification is incomplete")
    else:
        # The user accepted this specific build. Do not rebuild its artifacts.
        approved = {
            "FoodAndTable_BP-0.8.2.mcpack": "98466034409b2e3a52a81a98a991c3f7152aa6fea8d35f869631081c16a26c1f",
            "FoodAndTable_RP-0.8.2.mcpack": "71c623b4ad2a58c6d15e1bd46dc2f823d7b9ef063232790698e24d594110d9dd",
            "FoodAndTable-0.8.2.mcaddon": "0227e1b111ca2153047836474c880dd23004894c17174d7aaa311a3c77cdd3b1",
            "FoodAndTable-source-0.8.2.zip": "9ba50e0d6007aa8e10fe9f349d0ca6f81ea8696a44d9579d9f92c5a7e3c88f16",
        }
        checksum_file = (ROOT / "dist" / "SHA256SUMS.txt").read_text(encoding="utf-8")
        if checksum_file != "".join(f"{digest}  {name}\n" for name, digest in approved.items()):
            raise RuntimeError("The accepted checksum manifest changed")
        for name, digest in approved.items():
            if hashlib.sha256((ROOT / "dist" / name).read_bytes()).hexdigest() != digest:
                raise RuntimeError("The accepted artifact changed: " + name)
    values = dict(line.split("=", 1) for line in git("credential", "fill",
                  input_text="protocol=https\nhost=github.com\n\n").splitlines() if "=" in line)
    token = values.get("password")
    if not token:
        raise RuntimeError("Git Credential Manager has no GitHub credential")
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

    def api(method, url, payload=None, content_type="application/json"):
        data = payload if isinstance(payload, bytes) else json.dumps(payload).encode() if payload is not None else None
        request = urllib.request.Request(url, data=data, method=method,
                  headers={"Authorization": "Bearer " + token, "Accept": "application/vnd.github+json",
                           "User-Agent": "FoodAndTable-release", "Content-Type": content_type,
                           "X-GitHub-Api-Version": "2022-11-28"})
        try:
            with opener.open(request, timeout=180) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if method == "GET" and error.code == 404:
                return None
            raise RuntimeError(f"GitHub {method} failed with HTTP {error.code}") from None

    base = f"https://api.github.com/repos/{REPO}"
    # Published releases are immutable for this tool; a previous failed draft can resume.
    release = api("GET", base + "/releases/tags/" + tag)
    if release is None:
        drafts = api("GET", base + "/releases?per_page=100")
        release = next((r for r in drafts if r["tag_name"] == tag), None)
    if release is not None and (not release["draft"] or release["target_commitish"] != commit):
        raise RuntimeError("Existing release is not a resumable draft for this exact commit")
    if release is None:
        release = api("POST", base + "/releases", {"tag_name": tag, "target_commitish": commit,
                      "name": "方寸食光 / Food & Table " + version,
                      "body": (ROOT / "docs" / f"RELEASE_v{version}.md").read_text(encoding="utf-8"),
                      "draft": True, "prerelease": False})
    names = [f"FoodAndTable-{version}.mcaddon", f"FoodAndTable_BP-{version}.mcpack",
             f"FoodAndTable_RP-{version}.mcpack", f"FoodAndTable-source-{version}.zip", "SHA256SUMS.txt"]
    expected = {}
    for name in names:
        data = (ROOT / "dist" / name).read_bytes()
        digest = "sha256:" + hashlib.sha256(data).hexdigest()
        expected[name] = digest
        asset = next((a for a in release["assets"] if a["name"] == name), None)
        if asset is None:
            asset = api("POST", release["upload_url"].split("{")[0] + "?" + urllib.parse.urlencode({"name": name}),
                        data, "text/plain" if name.endswith(".txt") else "application/zip")
        if asset.get("state") != "uploaded" or asset.get("digest") != digest:
            raise RuntimeError("Release asset digest/state mismatch: " + name)
        print("Verified uploaded asset:", name)
    checked = api("GET", base + "/releases/" + str(release["id"]))
    if {a["name"]: a.get("digest") for a in checked["assets"]} != expected:
        raise RuntimeError("Unexpected or missing release assets")
    result = api("PATCH", base + "/releases/" + str(release["id"]), {"draft": False})
    if result["draft"]:
        raise RuntimeError("Release remained a draft")
    print("Published:", result["html_url"])


if __name__ == "__main__":
    main()
