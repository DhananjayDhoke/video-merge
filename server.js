const express = require('express');

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs')
const app = express();
const {exec} = require('child_process')

// Set the path to the ffmpeg binary
ffmpeg.setFfmpegPath("C:\\ffmpeg\\ffmpeg.exe");

app.use(express.json());
// working
function mergeImageAndVideo(imagePath, videoPath, tempOutputPath, finalOutputPath, callback) {
    // Step 1: Merge image and initial video
    ffmpeg()
      .input(imagePath)
      .loop(5) // Show image for 5 seconds
     .input(videoPath)
      .complexFilter([
        '[0:v]scale=1280:720[image]', // Scale image if necessary
        '[1:v]scale=1280:720[video]',
        '[image][video]concat=n=2:v=1:a=0[outv]', // Concatenate image and video
      ])
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions('-map', '[outv]')
      .output(tempOutputPath)
      .on('end', () => {
        console.log('First merge completed, starting second merge...');
  
        // Step 2: Merge the result with another video
        ffmpeg()
        .input('./tempOutput.mp4')
        .input('./assets/video2.mp4')
        .complexFilter([
            '[0:v]scale=1280:720[tempVideo]',       // Scale the first video to 1280x720
            '[1:v]scale=1280:720[finalVideo]',      // Scale the second video to 1280x720
            '[0:a][1:a]concat=n=2:v=0:a=1[outa]',   // Concatenate the audio from both videos
            '[tempVideo][finalVideo]concat=n=2:v=1:a=0[outv]' // Concatenate the video
          ])
          .outputOptions([
            '-map', '[outv]',                       // Map the concatenated video stream
            '-map', '[outa]'                        // Map the concatenated audio stream
          ])
          .videoCodec('libx264')
          .audioCodec('aac')
          .output(finalOutputPath)
          .on('end', () => callback(null, finalOutputPath))
          .on('error', (err) => callback(err))
          .run();
      })
      .on('error', (err) => callback(err))
      .run();
  }
  
  // Example usage
  mergeImageAndVideo(
    path.join(__dirname, './assets/img.jpg'),
    path.join(__dirname, './assets/vid.mp4'),
    path.join(__dirname, './tempOutput.mp4'), // Temporary output file
    path.join(__dirname, 'finalOutput.mp4'), // Final output file
    (err, outputPath) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Final merged video created at:', outputPath);
      }
    }
  );



  function mergeImageAndVideo(imagePath, videoPath, tempOutputPath, finalOutputPath, callback) {
    // Step 1: Merge image and initial video
    ffmpeg()
    .input(imagePath)
    .loop(5) // Show image for 5 seconds
    .input(videoPath)
    .input('./assets/audio.mp3') // Add audio input
    .complexFilter([
      '[0:v]scale=1280:720[image]', // Scale image if necessary
      '[1:v]scale=1280:720[video]',
      '[image][video]concat=n=2:v=1:a=0[outv]', // Concatenate image and video
    ])
    .outputOptions([
      '-map', '[outv]', // Map video
      '-map', '2:a',    // Map audio from audio input
      '-c:v', 'libx264', // Set video codec
      '-c:a', 'aac',     // Set audio codec
      '-shortest'        // Stop when the shortest stream ends
    ])
      .output(tempOutputPath)
      .on('end', () => {
        console.log('First merge completed, starting second merge...');
  
        // Step 2: Merge the result with another video
        ffmpeg()
        .input(tempOutputPath)
        .input(videoPath)
        .complexFilter([
            '[0:v]scale=1280:720[tempVideo]',       // Scale the first video to 1280x720
            '[1:v]scale=1280:720[finalVideo]',      // Scale the second video to 1280x720
            '[0:a][1:a]concat=n=2:v=0:a=1[outa]',   // Concatenate the audio from both videos
            '[tempVideo][finalVideo]concat=n=2:v=1:a=0[outv]' // Concatenate the video
          ])
          .outputOptions([
            '-map', '[outv]',                       // Map the concatenated video stream
            '-map', '[outa]'                        // Map the concatenated audio stream
          ])
          .videoCodec('libx264')
          .audioCodec('aac')
          .output(finalOutputPath)
          .on('end', () => callback(null, finalOutputPath))
          .on('error', (err) => callback(err))
          .run();
      })
      .on('error', (err) => callback(err))
      .run();
  }
  
  // Example usage
  mergeImageAndVideo(
    path.join(__dirname, './assets/img.jpg'),
    path.join(__dirname, './assets/video.mp4'),
    path.join(__dirname, './tempOutput.mp4'), // Temporary output file
    path.join(__dirname, 'finalOutput.mp4'), // Final output file
    (err, outputPath) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Final merged video created at:', outputPath);
      }
    }
  );
