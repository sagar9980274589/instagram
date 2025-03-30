import onnxruntime as ort
import numpy as np

class DeepAgingModel:
    def __init__(self):
        try:
            self.model = ort.InferenceSession("app/models/deep_aging_model.onnx")
            print("✅ Deep Aging Model Loaded Successfully!")
        except Exception as e:
            print("❌ Failed to load Deep Aging model:", str(e))

    def transform(self, embeddings):
        input_data = {"input": np.array(embeddings, dtype=np.float32)}
        result = self.model.run(None, input_data)[0]
        return result
