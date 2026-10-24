def test_register_and_login(client):
    register = client.post("/api/auth/register", json={
        "email": "new@example.com", "full_name": "New User", "password": "GoodPassword123!"
    })
    assert register.status_code == 201
    assert register.json()["role"] == "customer"
    assert "password_hash" not in register.json()

    login = client.post("/api/auth/login", json={"email": "new@example.com", "password": "GoodPassword123!"})
    assert login.status_code == 200
    assert login.json()["token_type"] == "bearer"
    assert login.json()["access_token"]


def test_duplicate_email_is_rejected(client):
    payload = {"email": "same@example.com", "full_name": "Same User", "password": "GoodPassword123!"}
    assert client.post("/api/auth/register", json=payload).status_code == 201
    assert client.post("/api/auth/register", json=payload).status_code == 409


def test_wrong_password_is_rejected(client):
    client.post("/api/auth/register", json={
        "email": "new@example.com", "full_name": "New User", "password": "GoodPassword123!"
    })
    response = client.post("/api/auth/login", json={"email": "new@example.com", "password": "WrongPassword!"})
    assert response.status_code == 401


def test_short_password_is_rejected(client):
    response = client.post("/api/auth/register", json={
        "email": "short@example.com", "full_name": "Short User", "password": "123"
    })
    assert response.status_code == 422
