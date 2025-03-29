const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs = require('fs').promises;

// Configure ffmpeg to use the installed ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const compressVideo = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',         // Video codec
        '-preset medium',       // Compression preset (balance between speed and quality)
        '-crf 23',             // Constant Rate Factor (quality setting, 18-28 is good)
        '-vf scale=-2:480',    // Scale to 480p maintaining aspect ratio
        '-r 30',               // 30 fps
        '-c:a aac',            // Audio codec
        '-b:a 128k',           // Audio bitrate
        '-movflags +faststart' // Enable fast start for web playback
      ])
      .output(outputPath)
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
};

const processUploadedVideo = async (videoPath) => {
  try {
    // Create a compressed version filename
    const ext = path.extname(videoPath);
    const compressedPath = videoPath.replace(ext, `_480p${ext}`);
    
    // Compress the video
    await compressVideo(videoPath, compressedPath);
    
    // Delete the original file
    await fs.unlink(videoPath);
    
    // Rename compressed file to original filename
    await fs.rename(compressedPath, videoPath);
    
    return true;
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
};

module.exports = {
  processUploadedVideo
}; 