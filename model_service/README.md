
# Crime Detection Model Service

This service provides a FastAPI interface to your trained crime detection model. It allows the main application to analyze video evidence without modifying the frontend code.

## Setup

1. Install the dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Add your model files to this directory
   - Add your model weights
   - Update the `load_model()` function in `main.py` to load your specific model

3. Run the service:
   ```
   python main.py
   ```

The service will be available at http://localhost:8000

## API Endpoints

- **POST /analyze-video**: Analyze a video for crime detection
  - Request body: `{ "video_url": "https://example.com/video.mp4" }`
  - Response: `{ "crime_type": "assault", "confidence": 0.92, "description": "..." }`

- **GET /health**: Health check
  - Response: `{ "status": "healthy", "model_loaded": true }`

## Integration with Main Application

The Supabase Edge Function will automatically try to connect to this service when analyzing videos. If this service is not running, it will fall back to the built-in analysis logic.

## Customization

Edit the `analyze_video_with_model()` function in `main.py` to implement your specific model's inference logic. The current implementation has placeholder code that you should replace with your actual model inference code.
