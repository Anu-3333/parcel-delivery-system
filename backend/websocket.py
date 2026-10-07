from fastapi import APIRouter, WebSocket, WebSocketDisconnect


router = APIRouter(
    prefix="/ws",
    tags=["WebSocket"]
)


# =====================================================
# CUSTOMERS TRACKING PARCELS
# =====================================================

connected_users = {}


# =====================================================
# PARCEL TRACKING WEBSOCKET
# =====================================================

@router.websocket("/tracking/{parcel_id}")
async def tracking_websocket(
    websocket: WebSocket,
    parcel_id: int
):

    await websocket.accept()

    if parcel_id not in connected_users:
        connected_users[parcel_id] = []

    connected_users[parcel_id].append(websocket)

    try:

        while True:

            data = await websocket.receive_text()

            # Send received message to all users
            # tracking this parcel
            for connection in connected_users[parcel_id]:

                try:

                    await connection.send_text(data)

                except Exception:

                    pass

    except WebSocketDisconnect:

        if parcel_id in connected_users:

            if websocket in connected_users[parcel_id]:

                connected_users[parcel_id].remove(
                    websocket
                )

            if not connected_users[parcel_id]:

                del connected_users[parcel_id]


# =====================================================
# SEND PARCEL STATUS UPDATE
# =====================================================

async def send_tracking_update(
    parcel_id: int,
    status: str
):

    if parcel_id not in connected_users:
        return

    message = {
        "type": "status",
        "parcel_id": parcel_id,
        "status": status
    }

    for connection in connected_users[parcel_id]:

        try:

            await connection.send_json(
                message
            )

        except Exception:

            pass


# =====================================================
# SEND CAPTAIN LIVE LOCATION
# =====================================================

async def send_captain_location(
    parcel_id: int,
    captain_id: int,
    latitude: float,
    longitude: float
):

    # Check whether customer is tracking
    # this parcel
    if parcel_id not in connected_users:
        return

    message = {
        "type": "captain_location",
        "parcel_id": parcel_id,
        "captain_id": captain_id,
        "latitude": latitude,
        "longitude": longitude
    }

    # Send location to customers tracking
    # this parcel
    for connection in connected_users[parcel_id]:

        try:

            await connection.send_json(
                message
            )

        except Exception:

            pass