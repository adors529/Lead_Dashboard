# Smart Leads Dashboard — API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require `Authorization: Bearer <token>` header.  
All responses follow the structure:
```json
{
  "success": true | false,
  "message": "string",
  "data": { ... },       // present on success
  "meta": { ... },       // present on list endpoints
  "errors": [ ... ]      // present on validation failure
}
```

---

## Auth Endpoints

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "name": "string (2-50 chars, required)",
  "email": "string (valid email, required)",
  "password": "string (min 6 chars, required)",
  "role": "admin | sales (optional, default: sales)"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "jwt_token_here",
    "user": { "id": "...", "name": "...", "email": "...", "role": "sales" }
  }
}
```

**Errors:** 400 (validation), 409 (email already exists), 500

---

### POST /auth/login
Authenticate a user.

**Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": { "id": "...", "name": "...", "email": "...", "role": "admin" }
  }
}
```

**Errors:** 400 (validation), 401 (invalid credentials), 500

---

### GET /auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": { "_id": "...", "name": "...", "email": "...", "role": "..." }
}
```

**Errors:** 401 (no/invalid token), 404, 500

---

## Leads Endpoints

All leads routes require authentication.

---

### GET /leads
Get paginated leads with optional filters.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
| Param    | Type   | Description                              |
|----------|--------|------------------------------------------|
| `status` | string | Filter: `New`, `Contacted`, `Qualified`, `Lost` |
| `source` | string | Filter: `Website`, `Instagram`, `Referral` |
| `search` | string | Search by name or email (case-insensitive) |
| `sort`   | string | `latest` (default) or `oldest`           |
| `page`   | number | Page number (default: 1)                  |
| `limit`  | number | Records per page (default: 10, max: 50)   |

> Note: Sales users only see their own leads. Admins see all leads.

**Response 200:**
```json
{
  "success": true,
  "message": "Leads fetched successfully",
  "data": [ { "_id": "...", "name": "...", "email": "...", "phone": "...", "status": "New", "source": "Website", "notes": "...", "createdBy": { "name": "...", "email": "..." }, "createdAt": "...", "updatedAt": "..." } ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### GET /leads/:id
Get a single lead by ID.

**Response 200:** Returns the lead object.

**Errors:** 401, 403 (sales accessing other's lead), 404, 500

---

### POST /leads
Create a new lead.

**Body:**
```json
{
  "name": "string (2-100 chars, required)",
  "email": "string (valid email, required)",
  "phone": "string (optional)",
  "status": "New | Contacted | Qualified | Lost (optional, default: New)",
  "source": "Website | Instagram | Referral (required)",
  "notes": "string (max 500 chars, optional)"
}
```

**Response 201:** Returns the created lead.

**Errors:** 400 (validation), 401, 500

---

### PUT /leads/:id
Update an existing lead. All fields optional.

**Body:** Same shape as POST, all fields optional.

**Response 200:** Returns the updated lead.

**Errors:** 400 (validation), 401, 403, 404, 500

---

### DELETE /leads/:id
Delete a lead. **Admin only.**

**Response 200:**
```json
{ "success": true, "message": "Lead deleted successfully" }
```

**Errors:** 401, 403 (non-admin), 404, 500

---

### GET /leads/stats
Get aggregate counts across all leads.

**Response 200:**
```json
{
  "success": true,
  "message": "Stats fetched",
  "data": {
    "total": 42,
    "byStatus": { "New": 10, "Contacted": 15, "Qualified": 12, "Lost": 5 },
    "bySource": { "Website": 20, "Instagram": 12, "Referral": 10 }
  }
}
```

---

### GET /leads/export/csv
Export all visible leads as a CSV file.

**Response:** `text/csv` file download (`leads.csv`)

---

## Role-Based Access

| Action           | Admin | Sales               |
|------------------|-------|---------------------|
| View all leads   | ✅    | ❌ (own leads only) |
| Create lead      | ✅    | ✅                  |
| Edit own lead    | ✅    | ✅                  |
| Edit any lead    | ✅    | ❌                  |
| Delete lead      | ✅    | ❌                  |
| Export CSV       | ✅    | ✅ (own leads only) |
| View stats       | ✅    | ✅ (own leads only) |
