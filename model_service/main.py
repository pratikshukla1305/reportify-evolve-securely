from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import sys
import numpy as np
import cv2
import time
import requests
import tempfile
from typing import Optional
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms

app = FastAPI(title="Crime Detection API")

# Configure CORS - Critical for web app integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request and response models
class VideoRequest(BaseModel):
    video_url: str
    location: Optional[str] = None

class AnalysisResponse(BaseModel):
    crime_type: str
    confidence: float
    description: str

# Crime descriptions dictionary
crime_descriptions = {
    "abuse": 
        "The detected video may involve abuse-related actions.\n"
        "Abuse can be verbal, emotional, or physical.\n"
        "It often includes intentional harm inflicted on a victim.\n"
        "The victim may display distress or defensive behavior.\n"
        "There might be aggressive body language or shouting.\n"
        "Such scenes usually lack mutual consent or context of play.\n"
        "These actions are violations of basic human rights.\n"
        "It is important to report such behavior to authorities.\n"
        "Detection helps in early intervention and protection.\n"
        "Please verify with human oversight for further action.",
    
    "assault": 
        "Assault involves a physical attack or aggressive encounter.\n"
        "This may include punching, kicking, or pushing actions.\n"
        "The victim may be seen retreating or being overpowered.\n"
        "There is usually a visible conflict or threat present.\n"
        "Such behavior is dangerous and potentially life-threatening.\n"
        "Immediate attention from security or authorities is critical.\n"
        "Assault detection can help prevent further escalation.\n"
        "The video may include violent gestures or weapons.\n"
        "Please proceed with care while reviewing such footage.\n"
        "Confirm with experts before initiating legal steps.",
    
    "arson": 
        "This video likely captures an incident of arson.\n"
        "Arson is the criminal act of intentionally setting fire.\n"
        "You may see flames, smoke, or ignition devices.\n"
        "Often, it targets property like buildings or vehicles.\n"
        "Arson can lead to massive destruction and danger to life.\n"
        "There might be a rapid spread of fire visible.\n"
        "Suspects may appear to flee the scene post-ignition.\n"
        "These cases require immediate fire and law response.\n"
        "Check for signs of accelerants or premeditated setup.\n"
        "This detection must be validated with caution.",
    
    "arrest": 
        "The scene likely depicts a law enforcement arrest.\n"
        "An arrest involves restraining a suspect or individual.\n"
        "You may see officers using handcuffs or other tools.\n"
        "The individual may be cooperating or resisting.\n"
        "It could be in public or private settings.\n"
        "Often, the suspect is guided or pushed into a vehicle.\n"
        "The presence of uniforms or badges may be evident.\n"
        "These scenarios may follow legal procedures.\n"
        "Misidentification is possible — confirm context.\n"
        "Verify with official reports before assuming guilt."
}

# Define CrimeNet model
class CrimeNet(torch.nn.Module):
    def __init__(self, hidden_size=256, num_layers=1, num_classes=4, dropout=0.5):
        super(CrimeNet, self).__init__()
        # ResNet18 feature extraction - we'll load from scripted model instead
        self.cnn = None  # Just a placeholder
        self.lstm = torch.nn.LSTM(
            input_size=512,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        self.dropout = torch.nn.Dropout(dropout)
        self.fc = torch.nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        # This won't be used since we'll load the scripted model
        pass

# Initialize transform for preprocessing
transform = transforms.Compose([
    transforms.Resize((112, 112)),
    transforms.ToTensor()
])

# Initialize model
def load_model():
    try:
        print("Loading crime detection model...")
        model_path = os.path.join(os.path.dirname(__file__), "crime_classifier_scripted.pt")
        if os.path.exists(model_path):
            model = torch.jit.load(model_path, map_location=torch.device('cpu'))
            print(f"Model loaded successfully from {model_path}")
        else:
            print(f"Model file not found at {model_path}, using fallback")
            model = "model_placeholder"
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

model = load_model()
class_names = ['abuse', 'assault', 'arson', 'arrest']

def extract_frames(video_path, max_frames=16):
    """Extract frames from a video file."""
    try:
        print(f"Extracting frames from {video_path}")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file {video_path}")
        
        frames = []
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        step = max(total_frames // max_frames, 1)
        
        for i in range(0, total_frames, step):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            success, frame = cap.read()
            if success:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image = Image.fromarray(frame)
                image = transform(image)
                frames.append(image)
                if len(frames) == max_frames:
                    break
            
        cap.release()
        
        # Pad if not enough frames
        while len(frames) < max_frames:
            if len(frames) > 0:
                frames.append(torch.zeros_like(frames[0]))
            else:
                # If no frames were extracted, create a blank frame
                frames.append(torch.zeros((3, 112, 112)))
                
        return torch.stack(frames)
    except Exception as e:
        print(f"Frame extraction error: {e}")
        return None

def download_video(url, save_path):
    """Download video from URL."""
    try:
        print(f"Downloading video from {url}")
        response = requests.get(url, stream=True, timeout=30)
        if response.status_code != 200:
            print(f"Failed to download video: HTTP {response.status_code}")
            raise ValueError(f"Failed to download video: HTTP {response.status_code}")
            
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=1024*1024):
                if chunk:
                    f.write(chunk)
        
        print(f"Video downloaded successfully to {save_path}")
        return save_path
    except Exception as e:
        print(f"Download error: {e}")
        return None

def analyze_video_with_model(video_path):
    """Analyze video with trained model."""
    try:
        if model is None or model == "model_placeholder":
            raise ValueError("Model not loaded properly")
        
        print("Analyzing frames with model")
        frames = extract_frames(video_path)
        if frames is None:
            raise ValueError("Failed to extract frames")
        
        # Model prediction
        input_tensor = frames.unsqueeze(0)  # Add batch dimension
        
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
            crime_type = class_names[predicted.item()]
            confidence = confidence.item()
        
        description = crime_descriptions.get(crime_type, "No detailed description available.")
        
        print(f"Crime detected: {crime_type} with confidence {confidence:.4f}")
        return {
            "crime_type": crime_type,
            "confidence": confidence,
            "description": description
        }
    except Exception as e:
        print(f"Analysis error: {e}")
        return None

@app.post("/analyze-video", response_model=AnalysisResponse)
async def analyze_video(request: VideoRequest):
    """Analyze a video for crime detection."""
    try:
        video_url = request.video_url
        
        # Create temp directory if it doesn't exist
        os.makedirs("temp", exist_ok=True)
        
        # Generate a unique filename
        timestamp = int(time.time())
        video_path = f"temp/video_{timestamp}.mp4"
        
        print(f"Starting analysis of video: {video_url}")
        print(f"Location context: {request.location}")
        
        # Download the video
        downloaded_path = download_video(video_url, video_path)
        if not downloaded_path:
            raise HTTPException(status_code=400, detail="Failed to download video")
            
        # Analyze with model
        result = analyze_video_with_model(downloaded_path)
        if not result:
            raise HTTPException(status_code=500, detail="Model analysis failed")
         
        print(f"Analysis completed successfully: {result}")   
        
        # Clean up
        try:
            os.remove(downloaded_path)
            print(f"Removed temporary file: {downloaded_path}")
        except Exception as clean_error:
            print(f"Warning: Could not remove temp file - {clean_error}")
            
        return result
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "model_loaded": model is not None and model != "model_placeholder"}

# Explicitly handle OPTIONS requests for CORS preflight
@app.options("/analyze-video")
async def options_analyze_video():
    return {}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
