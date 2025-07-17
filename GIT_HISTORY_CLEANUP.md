# 🧹 Git History Cleanup Guide

## Critical: Historical Credential Exposure

GitHub's push protection has detected credentials in historical commits that must be removed before pushing.

## 🚨 Detected Credential Locations

### Commit: `3fa11a3fc682681b80d630dc5ef8204c3e5c0f06`
- **File**: `TWILIO_SETUP.md` (lines 10, 32)
- **Type**: Twilio Account String Identifier

### Commit: `398d1ea57761d4ffc6fa0d7a034a4412b632ae18`
- **File**: `.claude/settings.local.json` (lines 14, 16)
- **Type**: Twilio API Key & Account SID

## 🛠 Solution Options

### Option 1: Use GitHub's Allow Secret Feature (TEMPORARY)

**Quick Fix** - Use the GitHub URLs provided in the push error:

```bash
# Allow the secrets temporarily (you can revoke later)
# Visit these URLs and click "Allow secret":
# https://github.com/mitchmort/irl-junto/security/secret-scanning/unblock-secret/2zzOXyTX6v9kNDiXsULiXJnqRxz
# https://github.com/mitchmort/irl-junto/security/secret-scanning/unblock-secret/2zzOY3V8pcCKoJLMsUwLlyiWJqn
# https://github.com/mitchmort/irl-junto/security/secret-scanning/unblock-secret/2zzOY2N0ULEwk9fKd89BsNkLeR5

# Then push again
git push origin dev
```

**⚠️ Important**: This only bypasses the protection temporarily. You should still clean the history.

### Option 2: Clean Git History (RECOMMENDED)

#### Using BFG Repo-Cleaner (Easier)

```bash
# Install BFG Repo-Cleaner
# macOS: brew install bfg
# Or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Create a fresh clone for safety
cd ..
git clone --mirror https://github.com/mitchmort/irl-junto.git irl-junto-cleanup.git
cd irl-junto-cleanup.git

# Remove files with credentials
bfg --delete-files "TWILIO_SETUP.md" .
bfg --delete-files ".claude/settings.local.json" .

# Clean up the repository
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Push the cleaned history (WARNING: This rewrites history!)
git push --force
```

#### Using Git Filter-Branch (More Control)

```bash
# Remove specific files from entire history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch TWILIO_SETUP.md .claude/settings.local.json' \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history!)
git push --force-with-lease origin dev
```

## 🚦 Step-by-Step Execution

### Immediate Steps (Choose One):

1. **Quick Deploy** (Option 1):
   - Use GitHub's "Allow secret" URLs
   - Push your changes
   - **Schedule history cleanup for later**

2. **Secure Cleanup** (Option 2):
   - **Coordinate with team first** (force push affects everyone)
   - Choose BFG or git filter-branch method
   - Execute cleanup
   - Force push cleaned history

## ⚠️ Important Warnings

### Before History Cleanup:

1. **Notify your team** - Force pushing rewrites history for everyone
2. **Backup current state** - Create a backup branch first:
   ```bash
   git branch backup-before-cleanup
   ```
3. **Ensure credentials are rotated** - The exposed credentials must be changed regardless

### After History Cleanup:

1. **Team coordination** - Everyone needs to re-clone or reset their local repos:
   ```bash
   git fetch origin
   git reset --hard origin/dev
   ```

## 🔍 Verification

After cleanup, verify credentials are gone:

```bash
# Search for any remaining credential patterns
git log --all -S "AC6081bf3df3829110a94a6a51e5e4ae3d" --oneline
git log --all -S "SKbc4efa5210be2a90f531717db3f1c0a9" --oneline
git log --all -S "WR51fu6HKwwzOLsntDa01rV4VGO9Kaaz" --oneline

# Should return no results
```

## 📋 Recommended Approach

**For immediate deployment:**
1. Use Option 1 (Allow secrets temporarily)
2. Push your security fixes
3. Schedule Option 2 (History cleanup) for next maintenance window

**For maximum security:**
1. Coordinate with team
2. Use Option 2 (BFG Repo-Cleaner recommended)
3. Force push cleaned history
4. Have team re-clone repositories

## 🔗 Additional Resources

- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Git Filter-Branch Documentation](https://git-scm.com/docs/git-filter-branch)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) 