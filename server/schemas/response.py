from pydantic import BaseModel

class ImageResult(BaseModel):
    
    imageId: int
    imageUrl: str
    dugongCount: int
    motherCalfCount: int
    imageClass: str
    createdAt: str