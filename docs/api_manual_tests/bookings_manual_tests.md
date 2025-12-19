# Booking API Manual Tests

## Setup Environment Variables

Replace the values below with actual UUIDs from your database.

```bash
# Base URL
API_URL="http://localhost:3000/api"

# Resource IDs (Update these after creating resources or fetching from DB)
LOCATION_ID="dc236458-1d55-4796-a3b9-6f92e48b1d1c"
BOOKING_ID_PERIODIC="a83fed8e-167c-487d-b40c-604bfb972078"
```

## Scenarios

### 1. Create Periodic Booking A (Baseline)
**Dates:** 2026-01-01 to 2026-01-15  
**Type:** periodic

```bash
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "location_id": "'dc236458-1d55-4796-a3b9-6f92e48b1d1c'",
    "spot_id": "'97d3b972-8ee6-474d-869f-0af45f0a199e'",
    "client_id": "'e339809b-3bc0-4d33-aba6-96c030953912'",
    "start_date": "2026-01-01",
    "end_date": "2026-01-15",
    "type": "periodic"
  }'
```
*Action:* Capture the returned `id` and save it as `BOOKING_ID_PERIODIC`.

### 2. Create Permanent Booking B (Baseline)
**Dates:** 2026-02-01 onwards  
**Type:** permanent

```bash
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "location_id": "'dc236458-1d55-4796-a3b9-6f92e48b1d1c'",
    "spot_id": "'97d3b972-8ee6-474d-869f-0af45f0a199e'",
    "client_id": "'ea82bba5-e8bd-475c-a3b3-11a7de88c145'",
    "start_date": "2026-02-01",
    "type": "permanent"
  }'
```
*Action:* Capture the returned `id` and save it as `BOOKING_ID_PERMANENT`.

### 3. Update Periodic Booking - Valid End Date (Extend)
**Action:** Extend Booking A to 2026-01-20.  
**Expected Result:** 200 OK, `success: true`.

```bash
# Replace BOOKING_ID_PERIODIC with actual ID
curl -X PATCH "http://localhost:3000/api/bookings/a83fed8e-167c-487d-b40c-604bfb972078" \
  -H "Content-Type: application/json" \
  -d '{
    "end_date": "2026-01-21"
  }'
```

### 4. Update Periodic Booking - Valid Start Date (Shift)
**Action:** Shift Booking A start to 2026-01-05.  
**Expected Result:** 200 OK, `success: true`.

```bash
curl -X PATCH "http://localhost:3000/api/bookings/a83fed8e-167c-487d-b40c-604bfb972078" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-01-05"
  }'
```

### 5. Update Periodic Booking - Conflict End Date
**Action:** Try to extend Booking A to 2026-02-05 (Overlaps with Permanent Booking B starting 2026-02-01).  
**Expected Result:** 500 Error (or 400 if handled) with message "Spot is already booked for this period".

```bash
curl -X PATCH "http://localhost:3000/api/bookings/a83fed8e-167c-487d-b40c-604bfb972078" \
  -H "Content-Type: application/json" \
  -d '{
    "end_date": "2026-02-05"
  }'
```

### 6. Update Periodic Booking - Conflict Start Date
**Action:** Try to shift Booking B (Permanent) start date to 2026-01-15 (Overlaps with Booking A which ends 2026-01-20).  
**Expected Result:** 500 Error (or 400) with message "Spot is already booked for this period".

```bash
curl -X PATCH "http://localhost:3000/api/bookings/e79e1852-cec1-42c9-b3b4-060326a7ceb9" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-01-15"
  }'
```

### 7. Create Conflict Periodic Booking
**Action:** Try to create a new periodic booking in a busy slot.  
**Dates:** 2026-01-10 to 2026-01-12 (Overlaps with Booking A).  
**Expected Result:** 500 Error (or 400) with message "Spot is already booked for this period".

```bash
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "location_id": "'dc236458-1d55-4796-a3b9-6f92e48b1d1c'",
    "spot_id": "'97d3b972-8ee6-474d-869f-0af45f0a199e'",
    "client_id": "'ea82bba5-e8bd-475c-a3b3-11a7de88c145'",
    "start_date": "2026-01-10",
    "end_date": "2026-01-12",
    "type": "periodic"
  }'
```

### 8. Create Conflict Permanent Booking
**Action:** Try to create a new permanent booking in a busy slot.  
**Dates:** Starts 2026-01-10 (Overlaps with Booking A).  
**Expected Result:** 500 Error (or 400) with message "Spot is already booked for this period".

```bash
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "location_id": "'dc236458-1d55-4796-a3b9-6f92e48b1d1c'",
    "spot_id": "'97d3b972-8ee6-474d-869f-0af45f0a199e'",
    "client_id": "'ea82bba5-e8bd-475c-a3b3-11a7de88c145'",
    "start_date": "2026-01-10",
    "type": "permanent"
  }'
```
