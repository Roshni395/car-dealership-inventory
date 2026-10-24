def create_vehicle(client, token, **overrides):
    payload = {"make": "Toyota", "model": "Corolla", "category": "Sedan", "price": 22000, "quantity": 2}
    payload.update(overrides)
    response = client.post("/api/vehicles", json=payload, headers={"Authorization": f"Bearer {token}"})
    return response


def test_admin_can_create_and_update_vehicle(client, admin_token):
    created = create_vehicle(client, admin_token)
    assert created.status_code == 201
    vehicle_id = created.json()["id"]
    updated = client.put(f"/api/vehicles/{vehicle_id}", json={"price": 21000}, headers={"Authorization": f"Bearer {admin_token}"})
    assert updated.status_code == 200
    assert updated.json()["price"] == 21000


def test_customer_cannot_create_vehicle(client, customer_token):
    response = create_vehicle(client, customer_token)
    assert response.status_code == 403


def test_missing_token_cannot_create_vehicle(client):
    response = client.post("/api/vehicles", json={
        "make": "Toyota", "model": "Corolla", "category": "Sedan", "price": 22000, "quantity": 2
    })
    assert response.status_code == 401


def test_search_filters_by_make_and_price(client, admin_token):
    create_vehicle(client, admin_token, make="Toyota", price=20000)
    create_vehicle(client, admin_token, make="Honda", model="Civic", price=28000)
    response = client.get("/api/vehicles/search?make=toyota&min_price=10000&max_price=25000")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["make"] == "Toyota"


def test_purchase_decreases_stock(client, admin_token, customer_token):
    vehicle = create_vehicle(client, admin_token, quantity=1).json()
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = client.post(f"/api/vehicles/{vehicle['id']}/purchase", headers=headers)
    assert response.status_code == 200
    assert response.json()["vehicle"]["quantity"] == 0


def test_purchase_out_of_stock_returns_conflict(client, admin_token, customer_token):
    vehicle = create_vehicle(client, admin_token, quantity=0).json()
    response = client.post(
        f"/api/vehicles/{vehicle['id']}/purchase",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert response.status_code == 409


def test_admin_can_restock_and_customer_cannot(client, admin_token, customer_token):
    vehicle = create_vehicle(client, admin_token, quantity=0).json()
    endpoint = f"/api/vehicles/{vehicle['id']}/restock"
    assert client.post(endpoint, json={"quantity": 4}, headers={"Authorization": f"Bearer {customer_token}"}).status_code == 403
    response = client.post(endpoint, json={"quantity": 4}, headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert response.json()["quantity"] == 4


def test_delete_is_admin_only(client, admin_token, customer_token):
    vehicle = create_vehicle(client, admin_token).json()
    endpoint = f"/api/vehicles/{vehicle['id']}"
    assert client.delete(endpoint, headers={"Authorization": f"Bearer {customer_token}"}).status_code == 403
    assert client.delete(endpoint, headers={"Authorization": f"Bearer {admin_token}"}).status_code == 204
