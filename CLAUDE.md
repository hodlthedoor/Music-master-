# CLAUDE.md - AI Assistant Guide for Music-master-

This document provides guidance for AI assistants working on this codebase.

## Repository Overview

**Repository:** Music-master-
**Status:** New/Initialized Repository
**Primary Domain:** Music Application

This is a newly initialized repository intended for music-related development. The codebase is being established and this document will evolve as the project grows.

## Project Structure (Planned)

```
Music-master-/
├── CLAUDE.md           # AI assistant guidance (this file)
├── README.md           # Project documentation
├── src/                # Source code
│   ├── components/     # UI components
│   ├── services/       # Business logic and API services
│   ├── utils/          # Utility functions
│   ├── models/         # Data models
│   └── audio/          # Audio processing modules
├── tests/              # Test files
├── config/             # Configuration files
├── assets/             # Static assets (icons, images)
└── docs/               # Additional documentation
```

## Development Guidelines

### Getting Started

1. Clone the repository
2. Install dependencies (package manager TBD based on tech stack)
3. Configure environment variables if needed
4. Run the development server

### Code Conventions

- **File Naming:** Use kebab-case for files (e.g., `audio-player.js`)
- **Function Naming:** Use camelCase for functions and variables
- **Class Naming:** Use PascalCase for classes and components
- **Constants:** Use UPPER_SNAKE_CASE for constants

### Git Workflow

- Create feature branches from `main`
- Use descriptive commit messages following conventional commits:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks
- Submit pull requests for code review before merging

### Audio-Specific Considerations

When working with audio in this codebase:

- Handle audio contexts carefully to avoid memory leaks
- Consider browser autoplay policies for audio playback
- Use appropriate audio formats for cross-browser compatibility
- Implement proper error handling for audio loading failures
- Consider accessibility (provide visual feedback for audio state)

## AI Assistant Instructions

### When Working on This Repository

1. **Read First:** Always read relevant files before making changes
2. **Minimal Changes:** Make focused, minimal changes that address the task
3. **Test Awareness:** Consider test implications for any code changes
4. **Security:** Be mindful of potential security issues (especially with file handling, user input)
5. **Performance:** Consider performance implications, especially for audio processing

### Common Tasks

#### Adding New Features
1. Understand existing code patterns first
2. Follow established conventions in the codebase
3. Add appropriate tests for new functionality
4. Update documentation if needed

#### Bug Fixes
1. Reproduce and understand the issue
2. Identify root cause before implementing fix
3. Ensure fix doesn't introduce regressions
4. Add tests to prevent future occurrences

#### Refactoring
1. Ensure tests exist before refactoring
2. Make incremental changes
3. Verify functionality after each change

### Key Files to Review

When starting work on this project, prioritize reviewing:
- `README.md` - Project overview and setup instructions
- `package.json` or equivalent - Dependencies and scripts
- Configuration files - Build and environment setup
- Entry point files - Main application structure

## Dependencies (To Be Defined)

Dependencies will be added as the project develops. This section should be updated to include:
- Core framework/library
- Audio processing libraries
- UI components
- Testing frameworks
- Build tools

## Testing

Testing approach will be established as the project grows. Consider:
- Unit tests for utility functions
- Integration tests for audio processing
- End-to-end tests for user workflows
- Cross-browser testing for audio playback

## Build and Deployment

Build and deployment processes will be documented here as they are established.

## Known Issues and Limitations

This section will track known issues as they are discovered.

---

*This document should be updated as the project evolves. AI assistants should refer to this file for guidance and update it when significant changes are made to the project structure or conventions.*
