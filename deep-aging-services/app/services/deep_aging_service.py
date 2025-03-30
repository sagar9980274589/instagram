import torch
import torch.nn as nn
import numpy as np

# Define Model Architecture
class DeepAgingModelNN(nn.Module):
    def __init__(self):
        super(DeepAgingModelNN, self).__init__()
        self.upsample = nn.Linear(128, 512)  # ✅ Upsample from 128D → 512D
        self.fc1 = nn.Linear(512, 256)
        self.fc2 = nn.Linear(256, 512)

    def forward(self, x):
        x = torch.relu(self.upsample(x))  # Convert 128D to 512D
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

class DeepAgingModel:
    def __init__(self):
        try:
            model_path = "app/models/deep_aging/SAM/pretrained_models/sam_ffhq_aging.pt"
            
            # Load model checkpoint
            checkpoint = torch.load(model_path, map_location=torch.device('cpu'))
            
            # Extract only the state_dict
            state_dict = checkpoint["state_dict"]

            # Initialize and load model
            self.model = DeepAgingModelNN()
            self.model.load_state_dict(state_dict, strict=False)  # ✅ strict=False ignores missing layers
            self.model.eval()

            print("✅ Deep Aging PyTorch Model Loaded Successfully!")
        except Exception as e:
            print("❌ Failed to load Deep Aging model:", str(e))

    def transform(self, embeddings):
        try:
            # Convert to tensor and add batch dimension
            input_tensor = torch.tensor(embeddings, dtype=torch.float32).unsqueeze(0)

            # Process through model
            with torch.no_grad():
                transformed_embeddings = self.model(input_tensor).squeeze(0).numpy()  # Remove batch dim

            return transformed_embeddings

        except Exception as e:
            print(f"❌ Error in transformation: {e}")
            return None
