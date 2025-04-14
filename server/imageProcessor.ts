import * as tf from '@tensorflow/tfjs-node';
import sharp from 'sharp';

// Initialize MobileNet model
let model: tf.GraphModel | null = null;

// Load the pre-trained MobileNet model
export async function initializeModel(): Promise<void> {
  try {
    // Load MobileNet model without the top classification layer
    model = await tf.loadGraphModel(
      'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/feature_vector/2/default/1', 
      { fromTFHub: true }
    );
    
    console.log('TensorFlow.js model loaded successfully');
  } catch (error) {
    console.error('Failed to load TensorFlow.js model:', error);
    throw error;
  }
}

// Process image and extract feature vector
export async function processImage(imageBuffer: Buffer): Promise<{
  width: number;
  height: number;
  featureVector: number[];
  processedImageBuffer: Buffer;
}> {
  try {
    // Ensure model is loaded
    if (!model) {
      throw new Error('Model not initialized. Call initializeModel() first');
    }

    // Process image with sharp
    const metadata = await sharp(imageBuffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image dimensions');
    }

    // Resize image to 224x224 (MobileNet input size) maintaining aspect ratio
    const processedImageBuffer = await sharp(imageBuffer)
      .resize(224, 224, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFormat('jpeg')
      .toBuffer();

    // Convert image to tensor
    const tensor = tf.node.decodeImage(processedImageBuffer, 3);
    
    // Preprocess image for MobileNet
    const expandedTensor = tf.expandDims(tensor, 0);
    const normalizedTensor = tf.div(expandedTensor, 255.0);
    
    // Get feature vector
    const features = model.predict(normalizedTensor) as tf.Tensor;
    
    // Convert to array and clean up tensors
    const featureVector = Array.from(await features.data());
    
    tf.dispose([tensor, expandedTensor, normalizedTensor, features]);

    return {
      width: metadata.width,
      height: metadata.height,
      featureVector,
      processedImageBuffer
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Utility function to convert a base64 string to a Buffer
export function base64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// Utility function to convert a Buffer to a base64 string
export function bufferToBase64(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}
