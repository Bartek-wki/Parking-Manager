# REST API Plan

## 1. Resources

| Resource | DB Table | Description |
| :--- | :--- | :--- |
| **Locations** | `locations` | Parking lots managed by the owner. |
| **Spots** | `spots` | Individual parking spaces within a location. |
| **Clients** | `clients` | Customers who rent spots. |
| **Bookings** | `bookings` | Reservations linking clients to spots. |
| **Pricing** | `price_exceptions` | Dynamic pricing rules per location. |
| **Payment History** | `payment_history` | Audit trail of payment status changes. |
| **Email Logs** | `email_logs` | System logs for sent notifications. |

---

## 2. Endpoints

### 2.1. Locations

**1. List Locations**
- **Method:** `GET`
- **URL:** `/locations`
- **Description:** Returns a list of all parking locations owned by the user.
- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "name": "Parking A",
      "daily_rate": 50.00,
      "monthly_rate": 1200.00
    }
  ]
  ```

**2. Create Location**
- **Method:** `POST`
- **URL:** `/locations`
- **Description:** Creates a new parking location (US-004).
- **Body:**
  ```json
  {
    "name": "Parking B",
    "daily_rate": 45.00,
    "monthly_rate": 1100.00
  }
  ```
- **Success:** `201 Created`

**3. Update Location**
- **Method:** `PUT`
- **URL:** `/locations/:id`
- **Description:** Updates location details and default rates.
- **Body:** `{ "name": "...", "daily_rate": 55.00 }`
- **Success:** `200 OK`

### 2.2. Spots

**1. List Spots**
- **Method:** `GET`
- **URL:** `/locations/:location_id/spots`
- **Description:** Lists all spots for a specific location (US-010).
- **Query Params:**
  - `active_only=true` (optional) - Filter out inactive spots.
- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "spot_number": "P-101",
      "is_active": true
    }
  ]
  ```

**2. Create Spot**
- **Method:** `POST`
- **URL:** `/locations/:location_id/spots`
- **Body:** `{ "spot_number": "P-102" }`
- **Success:** `201 Created`

**3. Update Spot**
- **Method:** `PATCH`
- **URL:** `/spots/:id`
- **Description:** Rename spot or change active status (US-011).
- **Body:** `{ "is_active": false }`
- **Success:** `200 OK`

### 2.3. Clients

**1. List Clients**
- **Method:** `GET`
- **URL:** `/clients`
- **Description:** Lists all clients belonging to the owner (US-020).
- **Query Params:**
  - `search=StartOfName` (optional)
- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+48123456789"
    }
  ]
  ```

**2. Create Client**
- **Method:** `POST`
- **URL:** `/clients`
- **Body:**
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "123456789"
  }
  ```
- **Success:** `201 Created`

**3. Update Client**
- **Method:** `PUT`
- **URL:** `/clients/:id`
- **Description:** Updates an existing client details (US-021).
- **Body:**
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "123456789"
  }
  ```
- **Success:** `200 OK`
- **Errors:**
  - `404 Not Found` (client does not exist / not accessible)
  - `422 Unprocessable Entity` (validation error; see Error Contract 4.2)

### 2.4. Bookings

**1. List Bookings (Calendar Data)**
- **Method:** `GET`
- **URL:** `/bookings`
- **Description:** Fetches bookings for the calendar view (US-040).
- **Query Params:**
  - `location_id` (required) - Context context.
  - `start_date` (required) - Start of month view.
  - `end_date` (required) - End of month view.
- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "spot_id": "uuid",
      "client_id": "uuid",
      "start_date": "2023-10-01",
      "end_date": "2023-10-05",
      "status": "aktywna",
      "payment_status": "nieoplacone"
    }
  ]
  ```

**2. Calculate Cost & Availability (Preview)**
- **Method:** `POST`
- **URL:** `/bookings/preview`
- **Description:** Calculates cost based on rates/exceptions and checks availability *before* creation (US-051, US-096).
- **Body:**
  ```json
  {
    "location_id": "uuid",
    "spot_id": "uuid",
    "start_date": "2023-10-01",
    "end_date": "2023-10-05",
    "type": "periodic"
  }
  ```
- **Response:**
  ```json
  {
    "available": true,
    "total_cost": 150.00,
    "calculation_details": [
      { "date": "2023-10-01", "rate": 50.00, "exception": null },
      { "date": "2023-10-02", "rate": 50.00, "exception": "+10% Weekend" }
    ]
  }
  ```
- **Errors:** `409 Conflict` (if spot occupied).

**3. Create Booking**
- **Method:** `POST`
- **URL:** `/bookings`
- **Description:** Creates a booking. Fails if dates overlap (US-030, US-031).
- **Body:**
  ```json
  {
    "client_id": "uuid",
    "spot_id": "uuid",
    "location_id": "uuid",
    "start_date": "2023-10-01",
    "end_date": "2023-10-05", // Optional for permanent
    "type": "periodic"
  }
  ```
- **Success:** `201 Created`

**4. Get Booking Details**
- **Method:** `GET`
- **URL:** `/bookings/:id`
- **Description:** Detailed view including client info and current status (US-035).

**5. Update Booking**
- **Method:** `PATCH`
- **URL:** `/bookings/:id`
- **Description:** Handles editing dates, changing payment status (US-060), or ending reservation (US-034).
- **Body:**
  ```json
  {
    "payment_status": "oplacone",
    // OR
    "status": "zakonczona",
    "end_date": "2023-10-02" // Early termination
  }
  ```
- **Success:** `200 OK`

### 2.5. Pricing Exceptions

**1. List Exceptions**
- **Method:** `GET`
- **URL:** `/locations/:location_id/pricing`
- **Description:** Returns a list of pricing exceptions for a specific location.
- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "start_date": "2023-12-24",
      "end_date": "2023-12-26",
      "percentage_change": 50.00,
      "description": "Christmas Surcharge"
    }
  ]
  ```

**2. Create Exception**
- **Method:** `POST`
- **URL:** `/locations/:location_id/pricing`
- **Description:** Adds a temporary price change (US-050).
- **Body:**
  ```json
  {
    "start_date": "2023-12-24",
    "end_date": "2023-12-26",
    "percentage_change": 50.00,
    "description": "Christmas Surcharge"
  }
  ```
- **Success:** `201 Created`

**3. Update Exception**
- **Method:** `PUT`
- **URL:** `/locations/:location_id/pricing/:id`
- **Description:** Updates an existing exception. Allows changing dates (including early termination), percentage, or description.
- **Body:**
  ```json
  {
    "start_date": "2023-12-24",
    "end_date": "2023-12-25", // Changed end date
    "percentage_change": 40.00,
    "description": "Updated Surcharge"
  }
  ```
- **Success:** `200 OK`

**4. Delete Exception**
- **Method:** `DELETE`
- **URL:** `/locations/:location_id/pricing/:id`
- **Description:** Permanently removes a pricing exception.
- **Success:** `204 No Content`

### 2.6. Logs & History

**1. Payment History**
- **Method:** `GET`
- **URL:** `/bookings/:id/history`
- **Description:** Returns audit trail of payment status changes (US-061).

**2. Email Logs**
- **Method:** `GET`
- **URL:** `/logs/emails`
- **Description:** System-wide logs for sent notifications (US-071, US-072).
- **Query Params:**
  - `location_id`
  - `status` (sent/failed)

---

## 3. Authentication & Authorization

### Mechanism
- **Supabase Auth (JWT):** All requests must include the `Authorization: Bearer <token>` header.
- **RLS (Row Level Security):** The database enforces isolation. The API relies on the `auth.uid()` from the token matching the `user_id` column in every table.

### Headers
- `apikey`: Supabase Anon Key (public).
- `Authorization`: User's Access Token.

---

## 4. Validation & Business Logic

### 4.1. Validation Rules
- **Dates:** `end_date` must be >= `start_date` (DB Check).
- **Rates:** `daily_rate` and `monthly_rate` must be >= 0.
- **Email:** Regex validation on Client email (DB Check).
- **Booking Overlap:**
  - Database `GiST` index prevents inserting overlapping ranges for the same `spot_id`.
  - API returns `409 Conflict` if this constraint is violated.

### 4.2. Error Contract (HTTP status codes & payloads)
This section defines the **minimum** error contract expected by the UI layer.

#### Validation errors (422)
- **Status:** `422 Unprocessable Entity`
- **When:** invalid request body / domain validation that can be mapped to a field (including uniqueness constraints).
- **Payload:**
  ```json
  {
    "errors": [
      { "path": ["field_name"], "message": "Human readable message", "code": "custom" }
    ]
  }
  ```

**Examples:**
- Duplicate spot number on `POST /locations/:location_id/spots`:
  - `422` with `errors[0].path = ["spot_number"]`
- Invalid pricing date range (`end_date < start_date`) on `POST/PUT /locations/:location_id/pricing...`:
  - `422` with paths `["start_date"]` / `["end_date"]`

#### Domain conflicts (409)
- **Status:** `409 Conflict`
- **When:** domain constraint conflict that is not a simple field validation.
- **Payload (minimum):**
  ```json
  { "error": "Human readable message" }
  ```

**Examples:**
- Booking overlap (already defined above): `409`
- Pricing exceptions overlap (if the system prevents overlapping ranges): `409`

### 4.3. Business Logic Implementation
- **Cost Calculation:**
  - Implemented via a dedicated endpoint (`/bookings/preview`) or Edge Function.
  - Logic: Iterates through each day of the range, checks for active `price_exceptions` (last created wins), applies % change to base `daily_rate`.
  - Permanent reservations use `monthly_rate` (flat fee, no exceptions apply).
- **Status Updates:**
  - Cron jobs (Supabase Edge Functions + pg_cron) run daily to:
    1.  Mark overdue unpaid reservations.
    2.  Send email reminders (-3 days, overdue).
- **Immutable Context:**
  - `user_id` is never passed in the body; it is injected automatically by Supabase based on the JWT.
  - `location_id` in `spots` and `bookings` ensures context isolation (US-097).

