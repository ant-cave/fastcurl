# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 ant-cave <antmmmmm@outlook.com>
# https://github.com/ant-cave

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Any
import httpx
import time

app = FastAPI(title="fastcurl API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProxyRequest(BaseModel):
    url: str
    method: str = "GET"
    headers: dict = {}
    body: Optional[Any] = None
    body_type: str = "json"

@app.post("/api/proxy")
async def proxy(req: ProxyRequest):
    start = time.time()
    async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
        kwargs = {
            "url": req.url,
            "headers": req.headers,
        }
        if req.method.upper() in ("POST", "PUT", "PATCH") and req.body is not None:
            if req.body_type == "json":
                kwargs["json"] = req.body
            elif req.body_type == "form":
                kwargs["data"] = req.body
            else:
                kwargs["content"] = str(req.body)

        try:
            resp = await client.request(req.method.upper(), **kwargs)
            elapsed = round((time.time() - start) * 1000)
            resp_headers = dict(resp.headers)
            return {
                "status_code": resp.status_code,
                "headers": resp_headers,
                "body": resp.text,
                "elapsed_ms": elapsed,
            }
        except Exception as e:
            return {
                "status_code": 0,
                "headers": {},
                "body": str(e),
                "elapsed_ms": 0,
            }
