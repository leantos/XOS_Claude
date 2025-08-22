#!/bin/bash

# Setup script for git hooks
# This configures the repository to use custom hooks from .githooks directory

echo "🔧 Setting up git hooks for XOS_Claude..."

# Configure git to use .githooks directory
git config core.hooksPath .githooks

echo "✅ Git hooks configured successfully!"
echo ""
echo "📚 The following protections are now active:"
echo "   - claude_docs directory is protected from direct edits by non-maintainers"
echo "   - Pre-commit hook will check permissions before allowing commits"
echo ""
echo "💡 To update maintainer list, edit .githooks/pre-commit"
echo "   Update the MAINTAINERS array with actual email addresses"
echo ""
echo "🚀 Repository is ready for team collaboration!"