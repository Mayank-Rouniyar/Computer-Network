File Share Server (Local Network QR Sharing)

This Node.js script allows you to instantly share any file or folder over your local Wi-Fi network using a simple HTTP server and a QR code. It automatically compresses folders into a ZIP file, hosts them temporarily, and provides a scannable QR code for download from any device connected to the same network.

🚀 Features

Share files or folders across devices on the same Wi-Fi network.

Automatically zips directories before sharing.

Generates a QR code for easy mobile access.

Cleans up all temporary files on exit.

Works entirely offline within your LAN (no external servers required).

🧩 How It Works

Detects your local IP address using your network interface (Wi-Fi or Ethernet).

Picks a random available port for the HTTP server.

Copies or compresses the target file/folder into a temporary directory.

Starts an HTTP server to host the file.

Displays a QR code containing the download URL.

Automatically deletes temporary files when stopped.

🛠️ Technologies Used

Node.js Built-ins: http, fs, os, path

External Packages:

archiver — for zipping folders.

mime — for serving files with correct MIME types.

qrcode-terminal — for generating QR codes in the terminal.

📦 Installation

Make sure you have Node.js (v14 or higher) installed.

# Clone this repository
git clone https://github.com/Mayank-Rouniyar/Computer-Network

# Navigate to the project folder
cd fileshare-server

# Install dependencies
npm install

▶️ Usage

To share a file or folder, run:

node share.js <file_or_folder_path>


Example:

node share.js "C:\Users\Mayank\Desktop\example.png"


Once the server starts, the terminal will show:

A local URL (e.g., http://192.168.1.5:8080/example.png)

A QR code — scan it from your mobile or another device connected to the same Wi-Fi to start the download.

🧹 Cleanup & Exit

Press Ctrl + C in the terminal to:

Stop the server

Delete the temporary directory created for file sharing

Exit cleanly

📁 Project Structure
.
├── share.js          # Main script file
├── package.json      # Dependencies and metadata
└── README.md         # Project documentation

⚙️ Example Workflow

Run node share.js myFolder

The script zips myFolder into a temporary directory.

The HTTP server starts and displays a QR code.

Another device on the same Wi-Fi scans the QR code and downloads the ZIP.

When you press Ctrl + C, the temporary directory and server are cleaned up.

🧠 Key Concepts

Local IP Detection: Finds the IPv4 address of your machine so that other devices can reach it within the same LAN.

Dynamic Port Selection: Chooses a random available port to avoid conflicts.

Temporary Directory: Used to safely host files without affecting the originals.

📜 License

This project is licensed under the MIT License — feel free to modify and distribute it.