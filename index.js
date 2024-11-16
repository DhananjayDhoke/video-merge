const express = require('express');

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const app = express();
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
      .complexFilter([
        '[0:v]scale=1280:720[image]', // Scale image if necessary
        '[1:v]scale=1280:720[video]',
        '[image][video]concat=n=2:v=1:a=0[outv]', // Concatenate image and video
      ])
      .audioFilters('volume=0.5')
      .outputOptions('-map', '[outv]')
      .output(tempOutputPath)
      .on('end', () => {
        console.log('First merge completed, starting second merge...');
  
        // Step 2: Merge the result with another video
        ffmpeg()
          .input(tempOutputPath)
          .input(videoPath) // Re-use the original video
          .complexFilter([
            '[0:v]scale=1280:720[tempVideo]', // Scale the temp output if necessary
            '[1:v]scale=1280:720[finalVideo]',
            '[tempVideo][finalVideo]concat=n=2:v=1:a=0[outv]', // Concatenate the two videos
          ])
          .audioFilters('volume=0.5')
          .outputOptions('-map', '[outv]')
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
  
  // Usage
  const imagePath = './assets/img.jpg';
  const videoPath = './assets/vid.mp4';
  const outputPath = 'combined_video.mp4';
  
  createVideo(imagePath, videoPath, outputPath)
    .then(() => console.log('Video created successfully'))
    .catch((err) => console.error(err));


const port = 9000;
app.listen(port,()=>{
   console.log(`listing on port ${port}`)
})