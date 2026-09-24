import json
import logging
from typing import List, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect

from app.websocket.events import WSEvent

logger = logging.getLogger("sla_guardian.websocket")


class ConnectionManager:
    """
    Manages active WebSocket connections and broadcasts real-time operational events.
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, payload: Dict[str, Any]) -> None:
        if not self.active_connections:
            return

        event = WSEvent(event_type=event_type, payload=payload)
        message_json = event.model_dump_json()

        stale_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message_json)
            except Exception as e:
                logger.warning(f"Error sending message to WebSocket client: {e}")
                stale_connections.append(connection)

        for stale in stale_connections:
            self.disconnect(stale)

    def get_active_count(self) -> int:
        return len(self.active_connections)


ws_manager = ConnectionManager()
