using Microsoft.AspNetCore.Mvc;
using System.Linq;


namespace TestProject.Controllers {

    [ApiController]
    [Route("api/files")]
    public class FilesController : ControllerBase {

        private readonly ILogger<FilesController> _logger;
        private readonly string _rootPath;

        public class FileItem
        {
            public string Name { get; set; } = "";
            public string Type { get; set; } = "file";      // file, directory
            public long? Size { get; set; }
            public DateTime LastModified { get; set; }
            public string? Extension { get; set; }
            public string? Path { get; set; }               // relative path from the root, this is for download and other operations such as search
        }

        public class FolderItem
        {
            public string CurrentPath { get; set; } = "";
            public string? ParentPath { get; set; }
            public List<FileItem> Items { get; set; } = new List<FileItem>();
            public int FileCount { get; set; }
            public int FolderCount { get; set; }
            public long TotalSizeBytes { get; set; }
        }

        public FilesController(ILogger<FilesController> logger, IConfiguration configuration) {
            _logger = logger;
            _rootPath = configuration["FileSystem:RootPath"]
                ?? throw new InvalidOperationException("FileSystem:RootPath is missing in configuration.");
        }

        [HttpGet("ping")]
        public IActionResult Ping() => Ok("pong");

        [HttpGet]
        public IActionResult Get() {
            // WARNING, remove this, it returns the root path, which is a security risk
            // I will leave it here for testing and a part of my submission
            return Ok("home"); // "home" | _rootPath
        }

        [HttpGet("list")]
        public IActionResult List([FromQuery] string? path = null, [FromQuery] string? search = null)
        {
            try
            {
                var safePath = Path.GetFullPath(Path.Combine(_rootPath, path ?? ""));   // this normalizes the path and prevents directory traversal, it will throw if the path is invalid
                var rootPath = Path.GetFullPath(_rootPath);                             // this is the normalized root path for comparison

                if (!safePath.StartsWith(rootPath, StringComparison.OrdinalIgnoreCase)) // this checks if the safePath is still within the root directory, preventing directory traversal attacks
                    return BadRequest("Invalid path");

                FolderItem result;
                if (!string.IsNullOrWhiteSpace(search))
                {
                    result = PerformSearch(safePath, rootPath, path, search);
                }
                else
                {
                    if (!Directory.Exists(safePath)) return NotFound();
                    result = GetDirectoryListing(safePath, rootPath, path ?? "");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "List failed for path: {Path} {Search}", path, search);
                return StatusCode(500);
            }
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromQuery] string? path = null)
        {
            try
            {
                if (file == null || file.Length == 0) return BadRequest("No file selected.");

                var safeFolder = Path.GetFullPath(Path.Combine(_rootPath, path ?? ""));
                var fullPath = Path.GetFullPath(_rootPath);

                if (!safeFolder.StartsWith(fullPath, StringComparison.OrdinalIgnoreCase))
                    return BadRequest("Invalid path.");

                var safeFileName = Path.GetFileName(file.FileName);                     // make sure the file name is safe
                var fullFilePath = Path.Combine(safeFolder, safeFileName);              // combine folder path with the original filename

                // this will check if the file exists and provide a graceful message
                // this can be handled numerous ways, rename options in UI, rename on server
                if (System.IO.File.Exists(fullFilePath))
                {
                    return Conflict("A file with this name already exists in this folder.");
                }

                using (var stream = new FileStream(fullFilePath, FileMode.CreateNew))   // CreateNew | Create - I chose create new to make sure not to overwrite existing files
                {
                    await file.CopyToAsync(stream);                                     // write to disk using Async Streaming, keeps server responsive and efficient, especially for large files
                }

                return Ok(new { message = "File uploaded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Upload failed for: {path}", path);
                return StatusCode(500, "Internal server error during upload.");
            }
        }

        [HttpGet("download")]
        public ActionResult<string> Download([FromQuery] string path) {
            try
            {
                if (string.IsNullOrEmpty(path)) return BadRequest("Invalid path");

                var safePath = Path.GetFullPath(Path.Combine(_rootPath, path));
                var rootFull = Path.GetFullPath(_rootPath);

                if (!safePath.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase))
                    return BadRequest("Invalid path");

                // this will check if the file exists and provide a graceful message
                if (!System.IO.File.Exists(safePath))
                    return NotFound("File not found");

                var fileBytes = System.IO.File.ReadAllBytes(safePath);
                var fileName = Path.GetFileName(safePath);

                // This is a generic binary stream content type that tells the browser to download the file rather than trying to display it
                // "application/octet-stream" forces a download dialog in the browser
                FileContentResult fileContentResult = File(fileBytes, "application/octet-stream", fileName);

                return fileContentResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Download failed for: {path}", path);
                return StatusCode(500);
            }
        }

        [HttpPost("folder")]
        public IActionResult AddFolder([FromQuery] string path, [FromBody] string folderName) {
            // todo, this will add a folder
            return Ok();
        }

        [HttpGet("search")]
        public IActionResult Search([FromQuery] string path, [FromBody] string folderName)
        {
            // todo, this will search for a folder or file
            return Ok();
        }

        [HttpPatch("move")]
        public IActionResult Raname([FromQuery] string path, [FromBody] string folderName)
        {
            // todo, this will rename or move a foler or file
            return Ok();
        }

        [HttpPost("copy")]
        public IActionResult Copy([FromQuery] string path, [FromBody] string folderName)
        {
            // todo, this will copy a folder or file
            return Ok();
        }

        [HttpDelete("delete")]
        public IActionResult Delete([FromQuery] string path, [FromQuery] bool recursive = false)
        {
            // todo, this will delete a folder or file
            return Ok();
        }



        private FolderItem GetDirectoryListing(string safePath, string rootPath, string path)
        {
            DirectoryInfo folderInfo = new DirectoryInfo(safePath);                     // get the directory info for the requested path

            List<FileItem> files = folderInfo.GetFileSystemInfos()                      // get all files and directories in the requested path
                .Select(info => new FileItem
                {
                    Name = info is FileInfo nameInfo ? Path.GetFileNameWithoutExtension(nameInfo.Name) : info.Name,
                    Type = info is DirectoryInfo ? "directory" : "file",
                    Size = info is FileInfo sizeInfo ? sizeInfo.Length : null,
                    LastModified = info.LastWriteTimeUtc,
                    Extension = info is FileInfo extensionInfo ? extensionInfo.Extension.TrimStart('.').ToLower() : null,
                    Path = Path.GetRelativePath(rootPath, info.FullName).Replace('\\', '/')
                })
                .OrderBy(i => i.Type == "directory" ? 0 : 1)                            // order directories first, then files
                .ThenBy(i => i.Name)
                .ToList();

            FolderItem folderItem = new FolderItem {
                CurrentPath = path ?? "",
                ParentPath = string.IsNullOrEmpty(path) ? null : Path.GetDirectoryName(path)?.Replace('\\', '/'),
                Items = files,
                FileCount = files.Count(i => i.Type == "file"),
                FolderCount = files.Count(i => i.Type == "directory"),
                TotalSizeBytes = files.Where(i => i.Size.HasValue).Sum(i => i.Size ?? 0L),
            };

            return folderItem;
        }

        private FolderItem PerformSearch(string safePath, string rootPath, string path, string searchText)
        {
            var query = $"*{searchText}*";                                              // the search pattern is *term* (it's case insensitive by default on Windows)

            // this will search all subdirectories for files and folders matching the search pattern
            // it returns a flat list of results with their relative paths for context
            // this allows for a simple search experience without needing to navigate through folders first
            List<FileItem> searchResults = new DirectoryInfo(safePath)
                .EnumerateFileSystemInfos(query, SearchOption.AllDirectories)
                .Select(info => new FileItem
                {
                    Name = info is FileInfo nameInfo ? Path.GetFileNameWithoutExtension(nameInfo.Name) : info.Name,
                    Type = info is DirectoryInfo ? "directory" : "file",
                    Size = info is FileInfo sizeInfo ? sizeInfo.Length : null,
                    LastModified = info.LastWriteTimeUtc,
                    Extension = info is FileInfo extensionInfo ? extensionInfo.Extension.TrimStart('.').ToLower() : null,
                    Path = Path.GetRelativePath(rootPath, info.FullName).Replace('\\', '/')
                })
                .OrderBy(i => i.Type == "directory" ? 0 : 1)                            // order directories first, then files
                .ThenBy(i => i.Name)
                .ToList();

            FolderItem folderItem = new FolderItem {
                CurrentPath = Path.GetRelativePath(rootPath, safePath).Replace('\\', '/'),
                ParentPath = string.IsNullOrEmpty(path) ? null : Path.GetDirectoryName(path)?.Replace('\\', '/'),
                Items = searchResults,
                FileCount = searchResults.Count(i => i.Type == "file"),
                FolderCount = searchResults.Count(i => i.Type == "directory"),
                TotalSizeBytes = searchResults.Where(i => i.Size.HasValue).Sum(i => i.Size ?? 0L)
            };

            return folderItem;
        }



    }
}
