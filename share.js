import http from "http";
import fs from "fs";
import os from "os";
import path from "path";
import archiver from "archiver";
import qrcode from "qrcode-terminal";
import mime from "mime";

function getLocalIP() 
{
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) 
    {
    for (const iface of interfaces[name]) 
      {
      if (iface.family === "IPv4" && !iface.internal) 
        {
        return iface.address;
        }
    }
  }
  return "127.0.0.1";
}

function randomPort() 
{
  return Math.floor(Math.random() * (65535 - 1024)) + 1024;
}

function startServer(fpath) 
{
  const localIP = getLocalIP();
  const port = randomPort();
  const tempDir = "temporary_directory";

  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
  fs.mkdirSync(tempDir);

  let targetName = path.basename(fpath).replace(/\s+/g, "_");
  let finalPath = path.join(tempDir, targetName);

  if (fs.lstatSync(fpath).isDirectory()) 
    {
    const zipPath = finalPath + ".zip";
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(fpath, false);
    archive.finalize();
    finalPath = zipPath;
    } else 
    {
    fs.copyFileSync(fpath, finalPath);
    }

  const fileName = path.basename(finalPath);

  const server = http.createServer((req, res) => {
    const file = path.join(tempDir, fileName);
    const stat = fs.statSync(file);

    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": mime.getType(file) || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    });

    fs.createReadStream(file).pipe(res);
  });

  server.listen(port, () => {
    const url = `http://${localIP}:${port}/${fileName}`;
    console.log(`\nServer running at ${url}\n`);
    console.log("Scan this QR to download:");
    qrcode.generate(url, { small: true });
  });

  process.on("SIGINT", () => {
    server.close();
    fs.rmSync(tempDir, { recursive: true });
    console.log("\nServer stopped and cleaned up.");
    process.exit();
  });
}

const fpath = process.argv[2];
if (!fpath) {
  console.error("Usage: node share.js <file_or_folder_path>");
  process.exit(1);
}
startServer(fpath);
