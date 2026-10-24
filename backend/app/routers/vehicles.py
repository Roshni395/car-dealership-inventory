from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models import Purchase, User, Vehicle
from app.schemas import PurchaseResponse, RestockRequest, VehicleCreate, VehicleResponse, VehicleUpdate

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


@router.get("", response_model=list[VehicleResponse])
def list_vehicles(
    available_only: bool = True,
    db: Session = Depends(get_db),
):
    stmt = select(Vehicle)
    if available_only:
        stmt = stmt.where(Vehicle.quantity > 0)
    return list(db.scalars(stmt.order_by(Vehicle.make, Vehicle.model)).all())


@router.get("/search", response_model=list[VehicleResponse])
def search_vehicles(
    make: str | None = None,
    model: str | None = None,
    category: str | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    available_only: bool = True,
    db: Session = Depends(get_db),
):
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=422, detail="min_price cannot exceed max_price")
    stmt = select(Vehicle)
    if make and make.strip():
        stmt = stmt.where(Vehicle.make.ilike(f"%{make.strip()}%"))
    if model and model.strip():
        stmt = stmt.where(Vehicle.model.ilike(f"%{model.strip()}%"))
    if category and category.strip():
        stmt = stmt.where(Vehicle.category.ilike(f"%{category.strip()}%"))
    if min_price is not None:
        stmt = stmt.where(Vehicle.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Vehicle.price <= max_price)
    if available_only:
        stmt = stmt.where(Vehicle.quantity > 0)
    return list(db.scalars(stmt.order_by(Vehicle.make, Vehicle.model)).all())


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(vehicle, key, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()


@router.post("/{vehicle_id}/purchase", response_model=PurchaseResponse)
def purchase_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # The conditional UPDATE is atomic and prevents two concurrent requests
    # from decrementing a zero-stock item. It works on SQLite and PostgreSQL.
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    result = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.quantity > 0).update(
        {Vehicle.quantity: Vehicle.quantity - 1}, synchronize_session=False
    )
    if result != 1:
        db.rollback()
        raise HTTPException(status_code=409, detail="Vehicle is out of stock")
    purchase = Purchase(user_id=user.id, vehicle_id=vehicle.id, quantity=1, unit_price=vehicle.price)
    db.add(purchase)
    db.commit()
    db.refresh(vehicle)
    db.refresh(purchase)
    return {"message": "Vehicle purchased successfully", "vehicle": vehicle, "purchase_id": purchase.id}


@router.post("/{vehicle_id}/restock", response_model=VehicleResponse)
def restock_vehicle(
    vehicle_id: int,
    payload: RestockRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    vehicle.quantity += payload.quantity
    db.commit()
    db.refresh(vehicle)
    return vehicle
