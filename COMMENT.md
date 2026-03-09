### External Assistance Used

#### Search & Research Topics
- Server Configuration: Researched adding server folders, FileSystem, and RootPath.
- Frontend Basics: Refreshed .NET Web API and SPA initialization (JS loading/DOM content loaded).
- Styling: Implementation of Google Fonts via CSS.
- I thought about implmenting the search on the server side and looked up some topics
	- recursive I/O is a performance bottleneck, I chose this option for simplicity and ease of implementation, and because it is sufficient for the requirements of the project
	- I haven't put too much tought into solutions but here are some ideas
	- indexed search solution like Lucene or Elasticsearch, more likelt the better option
	- background worker that caches the file tree in memory to keep the API responsive, less likely a good option
- Used Gemini to fix an issue with a bad state when navigating back to a route that had search text

#### Download File Handling Strategies
1. FileResult: Simple, handles metadata well.
2. Fetch and blob: Efficient for large files; requires manual metadata handling.
3. Range requests: Supports partial downloads; complex implementation.
4. Streaming: Low resource usage; requires careful management of resources.
5. Third-party Libraries: Various trade-offs in features and performance.
	- Not applicable for this project

#### Upload File Handling Strategies
1. Multi-part (Form Data): Simple, handles metadata well.
	- I chose this option for simplicity and ease of implementation, and because it is sufficient for the requirements of the project
	- This would not be a good choice for a server with many users
	- This would not be a good choice for very large files
	- This method caches the file to memory and disk before writing and then uses memory and disk to write to the disk
	- This method would fail with very large files because of the memory and disk usage
	- This method would fail if there are netwrok disconnections, no partial upload or resume support
	- The server has a request limit of 30 MB, if I want to support larger files, I would need to increase this limit inside Program.cs to increase the global Kestrel limit
2. Binary Stream: Efficient for large files; requires separate metadata handling.
3. Chunked Upload: High reliability for large files; complex implementation.
4. Writable Streams API: Low resource usage; newer API with limited support.
5. WebSockets: Real-time updates; high resource overhead.
6. Third-party Libraries: Various trade-offs in features and performance.
	- Not applicable for this project


#### Core Implementation Details
- Browser querying and manipulation of the URL for deep linking.
- Browser-based upload, download mechanics using the Web API.
- Calculating file sizes in JavaScript.
- Windows folder and file operations.
- Used Gemini for styling the upload button.
- Used Gemini to make adjustments to the list column styles.


