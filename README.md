# File Browser POC

A proof-of-concept file browser application that demonstrates a secure, configurable directory viewer with real-time navigation, filename search, file upload/download, and browser-based deep linking. Built with ASP.NET Core Web API and pure vanilla JavaScript (no frameworks).

## Features
- Browse directories and files (configurable root path)
- Server-side search by filename
- Upload files (multipart/form-data)
- Download files
- Deep linking (`?path=...&search=...`)
- Counts, sizes, breadcrumbs, human-readable formatting
- Vanilla JavaScript SPA (no frameworks)
- Secure path validation (prevents traversal)

## Tech stack
- Backend: ASP.NET Core Web API (.NET 8+)
- Frontend: HTML + CSS (flexbox) + vanilla JavaScript
- No external libraries/frameworks

## How to run
1. Open in Visual Studio 2022+ / VS Code / Rider
2. Update `appsettings.json` to `"FileSystem:RootPath"` to a real folder on your machine
3. Run (F5 or CTRL+F5 or `dotnet run`)
4. Open one of the following URLs in your browser:
- [Home](https://localhost:7146/index.html)
- [Ping](https://localhost:7146/api/files/ping/)
- [Test file storage location](https://localhost:7146/api/files/)
- [Test API](https://localhost:7146/api/files/list)
- [Test API with path](https://localhost:7146/api/files/list?path=pictures/other)
- [Test API with search](https://localhost:7146/api/files/list?search=don)

## Notes
- Upload size limited by default Kestrel (~28 MB) — can be increased in Program.cs
- Search is server-side (filename contains query, case-insensitive)
- Deep linking uses query string + history API

## External assistance
- Used Gemini (AI) for architecture brainstorming, path handling discussion, download and upload strategy comparison, file API, date formatting, and minor UI suggestions
- Web searches for .NET file system APIs, history API patterns, multipart upload docs

Thanks for reviewing!