from pydantic import BaseModel

class ImageResult(BaseModel):
    
    imageId: int
    imageUrl: str
    dugongCount: int
    calfCount: int
    imageClass: str
    createdAt: str