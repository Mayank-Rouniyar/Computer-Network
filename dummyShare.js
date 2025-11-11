import http from "http";
import fs from "fs";
import os from "os";
import path from "path";
import archiver from "archiver";
import qrcode from "qrcode-terminal";
import mime from "mime";

// Get local IP
//This thing figure out our computer local IP Address actually the one which router gives to us
function getLocalIP() 
{
  const interfaces = os.networkInterfaces();//This os.networkInterfaces gives a object which contains detail about Network
  for (const name of Object.keys(interfaces)) //This loop actually iterates over all connection types handling if connection is Wifi,Ethernet etc
    {
    for (const iface of interfaces[name]) //In a particular connection type it will go for all types of IP configuration
      {
      if (iface.family === "IPv4" && !iface.internal)
    //We want IPv4 address becuase IPv6 is somehwat messy and generally devices expect IPv4 address only and we disallow
    //internal aadress becuase no one else can do it
        {
        return iface.address;
        }
    }
  }
  return "127.0.0.1";//It always point to my personal computer and is for if all fails
}

// Random port
function randomPort() 
{
  return Math.floor(Math.random() * (65535 - 1024)) + 1024;
}
//We need to use random port because generally some port are in use in Computer so we can't just hardcode it
//We need use Random Port between 65535,1024 because Port below 1024 are in more important work
//TCP is highest PORT in TCP/IP Protocol

// Start server
//This is the function which will actually Create a QR Code for file and folder
function startServer(fpath) 
{
  const localIP = getLocalIP();//This will getIP address using function
  const port = randomPort();//It will generate a random Port
  const tempDir = "temporary_directory";//It will make a folder which will temproray folder where we will store 
  //sharing file

  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
  fs.mkdirSync(tempDir);
  //The above two liner code actually just check whether there is already a folder named "temprory_directory". If it will
  // already have the folder then this code will delete the folder and make a new one
  let targetName = path.basename(fpath).replace(/\s+/g, "_")
  //This code actually removes the unnecassary path name with only real name and also removes weird spaces so that some
  //format issue doesn't occur
  let finalPath = path.join(tempDir, targetName);
  //This actually makes the finalPath so that using this finalPath we can put into temprory_folder
  if (fs.lstatSync(fpath).isDirectory()) 
  //This Check whether the send element is file or folder and we actually make a Zip file if it is a folder
    {
    const zipPath = finalPath + ".zip"//This makes it a Zip file
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

// Run
const fpath = process.argv[2];
if (!fpath) {
  console.error("Usage: node share.js <file_or_folder_path>");
  process.exit(1);
}
startServer(fpath);
