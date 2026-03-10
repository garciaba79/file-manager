## Requirements
- Ensure your solution builds in Visual Studio (any version 2022 or newer is acceptable), Rider, VS Code, or command line SDK tools
- Web API that allows Browse and Search Files & Folders and returns JSON
- Deep linkable URL pattern
- SPA (Single Page App using JavaScript)
- Upload/download files from the browser
- Show file and folder counts and sizes for the current view
- Build the UI using vanilla JavaScript or TypeScript

## Bonus
- Any cool stuff you want to show :)
- Entire component contained in a dialog widget, with a trigger element (button, etc)
- Delete, move, copy files and folders
- Performance - performance is highly value

## Tasks
- add server side home directory should be configurable via variable
- create web service API that allows users to query the contents of a directory on the web server
- create a single page web app that can be used to search and browse folders and files
- the application should be deep-linkable (the state of the UI should be kept in the URL)
- UI work should be done client side via JavaScript that renders HTML

## Notes
- document any web search or AI use

## Run the project
- Open the project in Visual Studio 2022 or newer
- Set the project as the startup project
- Press Ctrol + F5 to run the project
- [Home](https://localhost:7146/index.html)
- [Ping](https://localhost:7146/api/files/ping/)
- [Test file storage location](https://localhost:7146/api/files/)
- [Test API](https://localhost:7146/api/files/list)
- [Test API with path](https://localhost:7146/api/files/list?path=pictures/other)
- [Test API with search](https://localhost:7146/api/files/list?search=don)
- [Test API with invalid path](https://localhost:7146/api/files/list?path=../)

## Todo

- [x] review and run the project
- [x] look into how to add a folder to the server to add and download folders and files
- [x] create folder for testing files and folders
- [x] plan and design API endpoints I need (browse directory, search file and folders, return JSON, data and JSON structure)
- [x] create skeleton API endpoints
- [x] implement the API endpoints

- [x] refactor and improve
- [x] make any changes to meet requirements

---

- [x] review html page
- [x] add JavaScript
- [x] plan how I want to add my JavaScript code
- [x] plan the page UI, controls, layout, etc. for rough implementation

- [x] implement the page layout
- [x] implement the controls
- [x] wire up the page to the APIs
- [x] test the app

- [x] refactor and improve
- [x] make any changes to meet requirements

---

- [x] look into the browser API for deep link
- [x] look into how to add deep link, URL and queries so the user can restore their state
- [x] implement deep link feature
- [x] refactor and improve
- [x] make any changes to meet requirements

---

- [x] add summary, counts, sizes and meta data
- [x] refactor and improve
- [x] make any changes to meet requirements

---

- [x] look into the browser API for downloading files
- [x] implement API endpoints for download
- [x] implement UI side code for download
- [x] test the download
- [x] look into the browser API for uploading files
- [x] implement API endpoints for upload
- [x] implement UI side code for upload
- [x] test the upload

- [x] refactor and improve
- [x] make any changes to meet requirements
- [x] test the app

---

- [x] add search feature
- [x] review and improve state managemeent - requirement is to use the URL, maybe remove the state var and create helper functions
- [x] review and improve UI feedback, loader and error handling
- [x] review performance and security
- [ ] bonus - add delete, move, copy, dialog widget

## Other, improvements, cleanup, final testing

- [x] when I hit the back button the app doesn't clear the list and duplicates items, fix this
- [x] when I try to go forward the app doesn't restore the state, fix this
- [x] when I navigate to folders and then click on the root breadcrumb the route doesn't update correctly, fix this
- [ ] add tooltip to name and location columns and display the full text
- [ ] I don't like the way the loadData() function updates the state, look into improving that, maybe I can create a helper function that updates the URL and state together
- [x] the app calls the loadData() function to start, create an init function
- [ ] I don't like how I register events, I would like to improve that code, but it's sufficent for this project
- [ ] If I complete delete, move, copy, rename features I need to make sure the app updates the UI and state correctly after those operations
- [ ] It would be too costly to calculate the folder sizes on the server, I can create a separate API endpoint that calculates the folder size and call it from the client in the background
- [ ] Add sort to the list columns
- [ ] I normally write the functions as pure functions, clean up functions and ensure they are pure
- [ ] I normally organize my code on the server and client side, I have them in one file for this project, for example, helpers, DTOs, functions, API endpoints, constants, etc.
- [ ] The API has some duplicated code, I can create helper functions or a service to reduce the duplicated code
- [ ] I intentionally left the server logging enabled, but I can disable it or remove it from the code
- [ ] I intentionally left the console logging in the client code, but I can remove it from the code
- [ ] I can add Jest tests for the client side code, but I won't for this project
- [ ] The server side can be tested with unit tests, but I won't add them for this project
- [x] review the code and remove any unnecessary code, comments, or logging
- [x] clean up logging
- [x] final app testing


## Known Issues & Security Considerations
- The server has a max size of about 28.6 megabytes, I can set the server to download larger files, but I won't for this project

* **Upload Limits**: Server-side file size is currently capped at **~28.6 MB** (default `maxAllowedContentLength`).
* **Network Limits**: The app does not currently handle **Request-URI Too Long** errors which can occur with excessively long search strings.
* **Search Hardening**: Currently uses `SearchOption.AllDirectories`.
* *Risk:* Potential **Denial of Service (DoS)** via resource exhaustion if searching very deep/large directory structures.
* *Mitigation:* Implement search timeouts and depth limits.

* **File Upload Security**: No validation is currently performed on uploaded binaries.
* *Production Mitigations:* Disable execution permissions on the storage folder, implement **MIME type** validation, and use file extension **whitelisting** (e.g., .jpg, .pdf).
* *Metadata*: Scan for "Metadata Bombs" (files that look small but expand to consume massive memory during processing).

* **XSS Prevention**: The UI currently renders file and folder names directly into the DOM using `innerHTML`.
* *Risk:* **Cross-Site Scripting (XSS)** if a file is named with malicious `<script>` tags.
* *Fix:* Switch to `.textContent` or implement HTML encoding for all user-provided strings.
* Normally I would use a framework like React, Vue, AngularJS that escapes strings by default, or I would have used document.createTextNode
* For this 20-hour vanilla JS prototype, I prioritized core functionality and path security, which I consider the highest risk.

* **Access Control**: The app lacks **Authentication and Authorization**.
* *Production Requirement:* Implement a login system with **Role-Based Access Control (RBAC)** to ensure users can only see their designated "Jail" folders.

* **Performance**: The app loads full directory listings at once.
* *Production Requirement:* Implement **Pagination** or **Virtual Scrolling** for folders containing thousands of items to reduce memory pressure on the browser.

## Tests

- These tests will only work with my test folders and files.
- Your tests will be similar but with folders and files you create.

#### Test 1

- Open a new browser tab
- Copy and paste one url at a time so the page loads each route
- [Search Sky](https://localhost:7146/index.html?path=pictures&search=sky)
- [Search Done](https://localhost:7146/index.html?search=done)
- [Search Sea](https://localhost:7146/index.html?path=pictures%2Fother&search=sea)
- Manually navigate to pictures using the bread crumb bar
- Test back and forward navigation


#### Test 1 results

- The url should have the path and search term for the three urls
- If the url has search text, they do, then the search textbox should have the search text
- The page should display the correct path search text (the path, the search text)
- The page should display the correct folders and files
- When you click on the breadcrumb the page should navigate to pictures
- The page should display the correct path search text (the path, no search text)
- The page should display the correct folders and files

#### Test 2
- Start at home page, type "don" in the search box
- The page should display the correct path search text (the path, the search text)
- Rapidly delete "don", the page updates
- The page should display the correct path search text (the path, no search text)
- Navigate back and forward, the page should rotate home, don and home

#### Test 3
- Test folder navigation, click on the pictures folder, then click on the other folder
- Test downloads, click on file and ensure it downloads, click on another file and ensure it downloads
- Test uploads, click on the upload button, select a small file and ensure it uploads, click on the upload button again, select a file larger than 28.6 MB and ensure it fails with an error message

## Must-Have Requirements Checklist
- [x] 1. Builds in VS 2022+
- [x] 2. Web API browse returns JSON
- [x] 3. Web API search returns JSON
- [x] 4. Deep linkable (URL holds state)
- [x] 5. Vanilla JS SPA (no frameworks)
- [x] 6. Browser file upload
- [x] 7. Browser file download
- [x] 8. Shows counts + sizes for current view
- [x] 9. Client side UI rendering via JS
- [x] 10. Configurable root directory
- [x] 11. Assistance documented
