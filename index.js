const express = require('express');

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const app = express();

// Set the path to the ffmpeg binary
ffmpeg.setFfmpegPath("C:\\ffmpeg\\ffmpeg.exe");

app.use(express.json());


// function mergeImageAndVideo(imagePath, videoPath, outputPath, callback) {
//     ffmpeg()
//       .input(imagePath)
//       .loop(5) // Show image for 5 seconds
//       .input(videoPath)
//       .complexFilter([
//         '[0:v]scale=1280:720[image]', // Scale image if necessary
//         '[1:v]scale=1280:720[video]',
//         '[image][video]concat=n=2:v=1:a=0[outv]', // Concatenate image and video
//       ])
//       .outputOptions('-map', '[outv]')
//       .output(outputPath)
//       .on('end', () => callback(null, outputPath))
//       .on('error', (err) => callback(err))
//       .run();
//   }
  
//   // Example usage
//   mergeImageAndVideo(
//     path.join(__dirname, './assets/img.jpg'),
//     path.join(__dirname, './assets/video.mp4'),
//     path.join(__dirname, 'mergedOutput.mp4'),
//     (err, outputPath) => {
//       if (err) {
//         console.error('Error:', err);
//       } else {
//         console.log('Merged video created at:', outputPath);
//       }
//     }
//   );


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





  const createVideo = (imagePath, videoPath, outputPath) => {
    return new Promise((resolve, reject) => {
      // First create a short video from the image
      const tempImageVideo = path.join(__dirname, 'temp_image_video.mp4');
      ffmpeg(imagePath)
        .loop(5) // Display image for 5 seconds
        .fps(30)
        .output(tempImageVideo)
        .on('end', () => {
          // Once image video is created, concatenate with original video
          ffmpeg()
            .input(tempImageVideo)
            .input(videoPath)
            .outputOptions('-c copy') // Use copy codec for faster processing
            .on('end', () => {
              console.log('Combined video created successfully');
              resolve();
            })
            .on('error', (err) => {
              reject(`Error combining videos: ${err.message}`);
            })
            .save(outputPath);
        })
        .on('error', (err) => {
          reject(`Error creating image video: ${err.message}`);
        })
        .run();
    });
  };
  
//   // Usage
//   const imagePath = './assets/img.jpg';
//   const videoPath = './assets/vid.mp4';
//   const outputPath = 'combined_video.mp4';
  
//   createVideo(imagePath, videoPath, outputPath)
//     .then(() => console.log('Video created successfully'))
//     .catch((err) => console.error(err));


  const first = './assets/video1.mp4';
  const second = './assets/video2.mp4';
  const third = 'third_video.mp4';

// ffmpeg({source:first})
//         .input(second)
//         .on('end',()=> console.log("mearge is done"))
//         .on('error',(err)=> console.log(err))
//         .mergeToFile('out.mp4');
// ffmpeg()
//     .input(first)
//     .input(second)
//     .inputOptions(['-f', 'concat', '-safe', '0'])
//     .output('out.mp4')
//     .outputOptions(['-loglevel', 'verbose'])
//     .on('end', () => console.log("Merge is done"))
//     .on('error', (err) => console.log("FFmpeg error:", err))
//     .run();


// ffmpeg()
//     .input(first)
//     .input(second)
//     .output('out1.mp4')
//     .on('end', () => console.log("Merge is done"))
//     .on('error', (err) => console.log("FFmpeg error:", err))
//     .run();

// ffmpeg()
//    .input(first)
//         .input(second)
//         .outputOptions(['-b:v 1000k', '-b:a 128k']) 
//         .on('end',()=> console.log("mearge is done"))
//         .on('error',(err)=> console.log(err))
//         .mergeToFile('out.mp4');




const port = 9000;
app.listen(port,()=>{
   console.log(`listing on port ${port}`)
})
