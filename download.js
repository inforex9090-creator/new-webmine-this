const fs = require('fs');
const https = require('https');

const desktopUrl = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1N2E2MDNlNWFjYTMwMWVlNGQ3ZWU0MDBlN2VkEgsSBxDFyfDaiB4YAZIBIwoKcHJvamVjdF9pZBIVQhM3MjYwOTI0MDQyODQ4NTI2Njc2&filename=&opi=89354086";
const mobileUrl = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1N2E2MDlhZGU1MTEwNjM5NGUwYzYwMDU3NTI0EgsSBxDFyfDaiB4YAZIBIwoKcHJvamVjdF9pZBIVQhM3MjYwOTI0MDQyODQ4NTI2Njc2&filename=&opi=89354086";

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  try {
    await download(desktopUrl, 'desktop.html');
    await download(mobileUrl, 'mobile.html');
    console.log("All downloads complete.");
  } catch (error) {
    console.error("Error during download:", error);
  }
}

run();
