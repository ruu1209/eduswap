"""EduSwap - VIT Student Marketplace Backend."""
import os
import re
import uuid
import logging
import asyncio
import random
import string
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import resend
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# -----------------------------------------------------------------------------
# Config
# -----------------------------------------------------------------------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_HOURS = int(os.environ.get("JWT_EXPIRE_HOURS", "168"))
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
ADMIN_NAME = os.environ.get("ADMIN_NAME", "EduSwap Admin")
VIT_EMAIL_DOMAIN = "vitstudent.ac.in"
DEV_MODE = not bool(RESEND_API_KEY)

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="EduSwap API")
api = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("eduswap")

CATEGORIES = ["Notes", "Books", "Food", "Electronics", "Accessories", "Stationery", "Others"]
CONDITIONS = ["New", "Like New", "Good", "Used", "For Parts"]


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_jwt(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def gen_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def is_vit_email(email: str) -> bool:
    return bool(re.match(r"^[A-Za-z0-9._%+-]+@vitstudent\.ac\.in$", email or "", re.I))


def public_user(u: dict) -> dict:
    return {
        "id": u["id"],
        "name": u.get("name"),
        "email": u.get("email"),
        "branch": u.get("branch"),
        "year": u.get("year"),
        "hostel": u.get("hostel"),
        "phone": u.get("phone"),
        "profile_photo": u.get("profile_photo"),
        "role": u.get("role", "user"),
        "is_verified": u.get("is_verified", False),
        "is_banned": u.get("is_banned", False),
        "created_at": u.get("created_at"),
    }


async def send_otp_email(email: str, otp: str) -> None:
    subject = "Your EduSwap Verification Code"
    html = f"""
    <table width='100%' style='font-family:Arial,sans-serif;background:#F9F9F6;padding:24px'>
      <tr><td>
        <table style='max-width:520px;margin:0 auto;background:#fff;border:2px solid #000;border-radius:8px;padding:32px'>
          <tr><td>
            <h1 style='margin:0 0 8px;font-size:28px'>EduSwap</h1>
            <p style='color:#4B5563'>Verified VIT Student Marketplace</p>
            <hr style='border:0;border-top:2px solid #000;margin:16px 0'/>
            <p>Your one-time verification code is:</p>
            <p style='font-size:36px;font-weight:900;letter-spacing:8px;background:#FEF08A;border:2px solid #000;border-radius:6px;padding:16px;text-align:center'>{otp}</p>
            <p style='color:#4B5563;font-size:13px'>This code expires in 10 minutes. Do not share it with anyone.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    """
    if DEV_MODE:
        logger.info(f"[DEV OTP] {email} -> {otp}")
        return
    try:
        await asyncio.to_thread(
            resend.Emails.send,
            {"from": SENDER_EMAIL, "to": [email], "subject": subject, "html": html},
        )
    except Exception as e:
        logger.error(f"Resend failed for {email}: {e}")


async def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
) -> dict:
    if not creds:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(401, "User not found")
    if user.get("is_banned"):
        raise HTTPException(403, "Account has been suspended")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user


# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    branch: Optional[str] = None
    year: Optional[str] = None
    hostel: Optional[str] = None
    phone: Optional[str] = None


class VerifyOtpIn(BaseModel):
    email: EmailStr
    otp: str


class ResendOtpIn(BaseModel):
    email: EmailStr


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    hostel: Optional[str] = None
    phone: Optional[str] = None
    profile_photo: Optional[str] = None  # base64


class ListingIn(BaseModel):
    title: str
    description: str
    price: float = Field(ge=0)
    category: str
    condition: str
    campus_location: str
    images: List[str] = []  # base64


class ReportIn(BaseModel):
    reason: str
    details: Optional[str] = None


class AdminUserPatch(BaseModel):
    is_banned: Optional[bool] = None
    role: Optional[str] = None


# -----------------------------------------------------------------------------
# Auth routes
# -----------------------------------------------------------------------------
@api.post("/auth/register")
async def register(body: RegisterIn):
    if not is_vit_email(body.email):
        raise HTTPException(400, f"Only @{VIT_EMAIL_DOMAIN} emails are allowed")
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    email = body.email.lower()
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing and existing.get("is_verified"):
        raise HTTPException(409, "Email already registered. Please log in.")

    otp = gen_otp()
    otp_expiry = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    user_doc = {
        "id": existing["id"] if existing else str(uuid.uuid4()),
        "email": email,
        "name": body.name,
        "password_hash": hash_password(body.password),
        "branch": body.branch,
        "year": body.year,
        "hostel": body.hostel,
        "phone": body.phone,
        "profile_photo": None,
        "role": "user",
        "is_verified": False,
        "is_banned": False,
        "otp": otp,
        "otp_expiry": otp_expiry,
        "saved_listings": [],
        "created_at": now_utc(),
    }
    await db.users.update_one({"email": email}, {"$set": user_doc}, upsert=True)
    await send_otp_email(email, otp)
    resp = {"message": "OTP sent to your VIT email", "email": email}
    if DEV_MODE:
        resp["dev_otp"] = otp
    return resp


@api.post("/auth/verify-otp")
async def verify_otp(body: VerifyOtpIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(404, "User not found")
    if user.get("is_verified"):
        raise HTTPException(400, "Already verified, please log in")
    if user.get("otp") != body.otp:
        raise HTTPException(400, "Invalid OTP")
    if datetime.fromisoformat(user["otp_expiry"]) < datetime.now(timezone.utc):
        raise HTTPException(400, "OTP expired. Request a new one.")
    await db.users.update_one(
        {"email": email},
        {"$set": {"is_verified": True}, "$unset": {"otp": "", "otp_expiry": ""}},
    )
    user["is_verified"] = True
    token = create_jwt(user["id"])
    return {"token": token, "user": public_user(user)}


@api.post("/auth/resend-otp")
async def resend_otp(body: ResendOtpIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(404, "User not found")
    if user.get("is_verified"):
        raise HTTPException(400, "Already verified")
    otp = gen_otp()
    expiry = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    await db.users.update_one({"email": email}, {"$set": {"otp": otp, "otp_expiry": expiry}})
    await send_otp_email(email, otp)
    resp = {"message": "OTP re-sent"}
    if DEV_MODE:
        resp["dev_otp"] = otp
    return resp


@api.post("/auth/login")
async def login(body: LoginIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid email or password")
    if not user.get("is_verified"):
        raise HTTPException(403, "Please verify your email first")
    if user.get("is_banned"):
        raise HTTPException(403, "Account suspended")
    return {"token": create_jwt(user["id"]), "user": public_user(user)}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


# -----------------------------------------------------------------------------
# Profile
# -----------------------------------------------------------------------------
@api.put("/users/me")
async def update_me(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    fresh = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return public_user(fresh)


@api.get("/users/{user_id}")
async def get_user(user_id: str):
    u = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not u:
        raise HTTPException(404, "User not found")
    safe = public_user(u)
    safe.pop("phone", None)  # hide phone from public view
    return safe


# -----------------------------------------------------------------------------
# Listings
# -----------------------------------------------------------------------------
@api.get("/categories")
async def categories():
    return {"categories": CATEGORIES, "conditions": CONDITIONS}


def _listing_doc_from_db(d: dict) -> dict:
    d.pop("_id", None)
    return d


@api.post("/listings")
async def create_listing(body: ListingIn, user: dict = Depends(get_current_user)):
    if body.category not in CATEGORIES:
        raise HTTPException(400, "Invalid category")
    if body.condition not in CONDITIONS:
        raise HTTPException(400, "Invalid condition")
    doc = {
        "id": str(uuid.uuid4()),
        "title": body.title.strip(),
        "description": body.description.strip(),
        "price": float(body.price),
        "category": body.category,
        "condition": body.condition,
        "campus_location": body.campus_location.strip(),
        "images": body.images[:5],
        "seller_id": user["id"],
        "seller_name": user.get("name"),
        "status": "active",
        "views": 0,
        "save_count": 0,
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    await db.listings.insert_one(doc)
    return _listing_doc_from_db(doc)


@api.get("/listings")
async def list_listings(
    q: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: str = "newest",
    limit: int = Query(50, le=100),
):
    query: dict = {"status": "active"}
    if category and category != "All":
        query["category"] = category
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    if min_price is not None or max_price is not None:
        price_q: dict = {}
        if min_price is not None:
            price_q["$gte"] = float(min_price)
        if max_price is not None:
            price_q["$lte"] = float(max_price)
        query["price"] = price_q
    sort_field = {"newest": ("created_at", -1), "price_asc": ("price", 1), "price_desc": ("price", -1)}
    sf = sort_field.get(sort, ("created_at", -1))
    cur = db.listings.find(query, {"_id": 0}).sort(sf[0], sf[1]).limit(limit)
    return await cur.to_list(limit)


@api.get("/listings/mine")
async def my_listings(user: dict = Depends(get_current_user)):
    cur = db.listings.find({"seller_id": user["id"]}, {"_id": 0}).sort("created_at", -1)
    return await cur.to_list(200)


@api.get("/listings/saved")
async def saved_listings(user: dict = Depends(get_current_user)):
    saved = user.get("saved_listings", [])
    if not saved:
        return []
    cur = db.listings.find({"id": {"$in": saved}, "status": "active"}, {"_id": 0})
    return await cur.to_list(200)


@api.get("/listings/{listing_id}")
async def get_listing(listing_id: str):
    doc = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Listing not found")
    await db.listings.update_one({"id": listing_id}, {"$inc": {"views": 1}})
    return doc


@api.put("/listings/{listing_id}")
async def update_listing(listing_id: str, body: ListingIn, user: dict = Depends(get_current_user)):
    doc = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    if doc["seller_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(403, "Not allowed")
    updates = body.model_dump()
    updates["images"] = updates["images"][:5]
    updates["updated_at"] = now_utc()
    await db.listings.update_one({"id": listing_id}, {"$set": updates})
    fresh = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    return fresh


@api.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str, user: dict = Depends(get_current_user)):
    doc = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    if doc["seller_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(403, "Not allowed")
    await db.listings.delete_one({"id": listing_id})
    return {"message": "Deleted"}


@api.post("/listings/{listing_id}/save")
async def toggle_save(listing_id: str, user: dict = Depends(get_current_user)):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(404, "Not found")
    saved = user.get("saved_listings", []) or []
    if listing_id in saved:
        saved.remove(listing_id)
        await db.listings.update_one({"id": listing_id}, {"$inc": {"save_count": -1}})
        action = "unsaved"
    else:
        saved.append(listing_id)
        await db.listings.update_one({"id": listing_id}, {"$inc": {"save_count": 1}})
        action = "saved"
    await db.users.update_one({"id": user["id"]}, {"$set": {"saved_listings": saved}})
    return {"action": action, "saved": action == "saved"}


@api.get("/listings/{listing_id}/contact")
async def get_seller_contact(listing_id: str, user: dict = Depends(get_current_user)):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(404, "Listing not found")
    seller = await db.users.find_one({"id": listing["seller_id"]}, {"_id": 0})
    if not seller:
        raise HTTPException(404, "Seller not found")
    # Track contact event
    await db.contact_events.insert_one(
        {
            "id": str(uuid.uuid4()),
            "listing_id": listing_id,
            "viewer_id": user["id"],
            "seller_id": seller["id"],
            "created_at": now_utc(),
        }
    )
    return {
        "name": seller.get("name"),
        "email": seller.get("email"),
        "phone": seller.get("phone"),
        "branch": seller.get("branch"),
        "year": seller.get("year"),
        "hostel": seller.get("hostel"),
    }


@api.post("/listings/{listing_id}/report")
async def report_listing(listing_id: str, body: ReportIn, user: dict = Depends(get_current_user)):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(404, "Listing not found")
    doc = {
        "id": str(uuid.uuid4()),
        "listing_id": listing_id,
        "listing_title": listing.get("title"),
        "reporter_id": user["id"],
        "reporter_email": user.get("email"),
        "reason": body.reason,
        "details": body.details,
        "status": "pending",
        "created_at": now_utc(),
    }
    await db.reports.insert_one(doc)
    return {"message": "Report submitted", "id": doc["id"]}


# -----------------------------------------------------------------------------
# Admin
# -----------------------------------------------------------------------------
@api.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    return {
        "users": await db.users.count_documents({}),
        "verified_users": await db.users.count_documents({"is_verified": True}),
        "banned_users": await db.users.count_documents({"is_banned": True}),
        "listings": await db.listings.count_documents({}),
        "active_listings": await db.listings.count_documents({"status": "active"}),
        "pending_reports": await db.reports.count_documents({"status": "pending"}),
    }


@api.get("/admin/users")
async def admin_users(_: dict = Depends(require_admin)):
    cur = db.users.find({}, {"_id": 0, "password_hash": 0, "otp": 0, "otp_expiry": 0}).sort(
        "created_at", -1
    )
    return await cur.to_list(500)


@api.patch("/admin/users/{user_id}")
async def admin_update_user(user_id: str, body: AdminUserPatch, _: dict = Depends(require_admin)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "No fields to update")
    res = await db.users.update_one({"id": user_id}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(404, "User not found")
    return {"message": "Updated"}


@api.get("/admin/reports")
async def admin_reports(_: dict = Depends(require_admin)):
    cur = db.reports.find({}, {"_id": 0}).sort("created_at", -1)
    return await cur.to_list(500)


@api.patch("/admin/reports/{report_id}")
async def admin_resolve_report(report_id: str, action: str, _: dict = Depends(require_admin)):
    if action not in ("resolved", "dismissed"):
        raise HTTPException(400, "Invalid action")
    res = await db.reports.update_one({"id": report_id}, {"$set": {"status": action}})
    if res.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Updated"}


@api.delete("/admin/listings/{listing_id}")
async def admin_delete_listing(listing_id: str, _: dict = Depends(require_admin)):
    res = await db.listings.delete_one({"id": listing_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}


# -----------------------------------------------------------------------------
# Root + setup
# -----------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"app": "EduSwap", "status": "ok", "dev_mode": DEV_MODE}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.listings.create_index("id", unique=True)
    await db.listings.create_index("seller_id")
    await db.listings.create_index("category")
    await db.reports.create_index("id", unique=True)
    # Seed admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()}, {"_id": 0})
    if not existing:
        await db.users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "email": ADMIN_EMAIL.lower(),
                "name": ADMIN_NAME,
                "password_hash": hash_password(ADMIN_PASSWORD),
                "branch": "Admin",
                "year": "-",
                "hostel": None,
                "phone": None,
                "profile_photo": None,
                "role": "admin",
                "is_verified": True,
                "is_banned": False,
                "saved_listings": [],
                "created_at": now_utc(),
            }
        )
        logger.info(f"Seeded admin user: {ADMIN_EMAIL}")
    else:
        # ensure admin role + verified (idempotent)
        await db.users.update_one(
            {"email": ADMIN_EMAIL.lower()},
            {"$set": {"role": "admin", "is_verified": True, "is_banned": False}},
        )
    logger.info(f"EduSwap backend ready. DEV_MODE={DEV_MODE}")


@app.on_event("shutdown")
async def shutdown():
    client.close()
