from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints
from typing import Annotated, Literal


NonEmpty = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=120)]
    password: Annotated[str, StringConstraints(min_length=8, max_length=128)]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: Literal["customer", "admin"]
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class VehicleCreate(BaseModel):
    make: NonEmpty
    model: NonEmpty
    category: NonEmpty
    price: float = Field(ge=0, le=100_000_000)
    quantity: int = Field(ge=0, le=1_000_000)


class VehicleUpdate(BaseModel):
    make: NonEmpty | None = None
    model: NonEmpty | None = None
    category: NonEmpty | None = None
    price: float | None = Field(default=None, ge=0, le=100_000_000)
    quantity: int | None = Field(default=None, ge=0, le=1_000_000)


class VehicleResponse(BaseModel):
    id: int
    make: str
    model: str
    category: str
    price: float
    quantity: int
    model_config = ConfigDict(from_attributes=True)


class RestockRequest(BaseModel):
    quantity: int = Field(gt=0, le=1_000_000)


class PurchaseResponse(BaseModel):
    message: str
    vehicle: VehicleResponse
    purchase_id: int
