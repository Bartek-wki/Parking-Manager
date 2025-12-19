# Price Exceptions API Manual Tests

## Setup Environment Variables

```bash
# Base URL
API_URL="http://localhost:3000/api"

# Resource IDs (Update these after creating resources or fetching from DB)
LOCATION_ID="dc236458-1d55-4796-a3b9-6f92e48b1d1c"
USER_ID="52bbf1a9-abdc-4a53-bb49-bc3586e7a8df"

# Exception ID (Update after creating an exception)
EXCEPTION_ID=""
```

## API Tests

### 1. Get All Pricing Exceptions for Location
**Method:** GET  
**Endpoint:** `/api/locations/{location_id}/pricing`

```bash
curl -X GET "http://localhost:3000/api/locations/dc236458-1d55-4796-a3b9-6f92e48b1d1c/pricing" \
  -H "Content-Type: application/json"
```
*Expected:* Returns array of pricing exceptions for the location (empty array if none exist)

### 2. Create New Pricing Exception
**Method:** POST  
**Endpoint:** `/api/locations/{location_id}/pricing`  
**Dates:** 2026-02-01 to 2026-02-28  
**Change:** +25%

```bash
curl -X POST "http://localhost:3000/api/locations/dc236458-1d55-4796-a3b9-6f92e48b1d1c/pricing" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-02-01",
    "end_date": "2026-02-28",
    "percentage_change": 25,
    "description": "Winter season price increase"
  }'
```
*Action:* Capture the returned `id` and save it as `EXCEPTION_ID`

### 3. Update Pricing Exception
**Method:** PUT  
**Endpoint:** `/api/locations/{location_id}/pricing/{exception_id}`  
**Updated Change:** +35% (increased from 25%)

```bash
curl -X PUT "http://localhost:3000/api/locations/dc236458-1d55-4796-a3b9-6f92e48b1d1c/pricing/66a6ea34-ab16-4368-badf-bb33f2afe5bc" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-02-01",
    "end_date": "2026-02-28",
    "percentage_change": 35,
    "description": "Updated winter season price increase"
  }'
```

### 4. Create Second Pricing Exception (Overlapping Period)
**Method:** POST  
**Endpoint:** `/api/locations/{location_id}/pricing`  
**Dates:** 2026-02-15 to 2026-03-15 (overlaps with first exception)  
**Change:** -10%

```bash
curl -X POST "http://localhost:3000/api/locations/dc236458-1d55-4796-a3b9-6f92e48b1d1c/pricing" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-02-15",
    "end_date": "2026-03-15",
    "percentage_change": -10,
    "description": "Early spring discount"
  }'
```
*Expected:* Should succeed (overlapping periods are allowed)

### 5. Verify All Exceptions
**Method:** GET  
**Endpoint:** `/api/locations/{location_id}/pricing`

```bash
curl -X GET "http://localhost:3000/api/locations/dc236458-1d55-4796-a3b9-6f92e48b1d1c/pricing" \
  -H "Content-Type: application/json"
```
*Expected:* Returns array with both exceptions

### 6. Delete Pricing Exception
**Method:** DELETE  
**Endpoint:** `/api/locations/{location_id}/pricing/{exception_id}`

```bash
curl -X DELETE "http://localhost:3000/api/locations/dc236458-1d55-4796-a3b9-6f92e48b1d1c/pricing/0456956b-eb54-4944-b5ea-d09560493e58" \
  -H "Content-Type: application/json"
```
*Expected:* 204 No Content response

### 7. Verify Exception Deleted
**Method:** GET  
**Endpoint:** `/api/locations/{location_id}/pricing`

```bash
curl -X GET "http://localhost:3000/api/locations/dc236458-1d55-4796-a3b9-6f92e48b1d1c/pricing" \
  -H "Content-Type: application/json"
```
*Expected:* Returns array with remaining exception(s)

## Error Cases

### 8. Invalid Date Format
**Method:** POST  
**Endpoint:** `/api/locations/{location_id}/pricing`

```bash
curl -X POST "http://localhost:3000/api/locations/dc236458-1d55-4796-a3b9-6f92e48b1d1c/pricing" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "invalid-date",
    "end_date": "2026-02-28",
    "percentage_change": 25
  }'
```
*Expected:* 400 Bad Request with validation errors

### 9. End Date Before Start Date
**Method:** POST  
**Endpoint:** `/api/locations/{location_id}/pricing`

```bash
curl -X POST "http://localhost:3000/api/locations/dc236458-1d55-4796-a3b9-6f92e48b1d1c/pricing" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-02-28",
    "end_date": "2026-02-01",
    "percentage_change": 25
  }'
```
*Expected:* 400 Bad Request with validation error

### 10. Percentage Change Out of Range (Too Low)
**Method:** POST  
**Endpoint:** `/api/locations/{location_id}/pricing`

```bash
curl -X POST "http://localhost:3000/api/locations/dc236458-1d55-4796-a3b9-6f92e48b1d1c/pricing" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-02-01",
    "end_date": "2026-02-28",
    "percentage_change": -150
  }'
```
*Expected:* 400 Bad Request with validation error

### 11. Percentage Change Out of Range (Too High)
**Method:** POST  
**Endpoint:** `/api/locations/{location_id}/pricing`

```bash
curl -X POST "http://localhost:3000/api/locations/dc236458-1d55-4796-a3b9-6f92e48b1d1c/pricing" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-02-01",
    "end_date": "2026-02-28",
    "percentage_change": 600
  }'
```
*Expected:* 400 Bad Request with validation error

### 12. Invalid Location ID
**Method:** GET  
**Endpoint:** `/api/locations/{invalid_id}/pricing`

```bash
curl -X GET "http://localhost:3000/api/locations/invalid-uuid/pricing" \
  -H "Content-Type: application/json"
```
*Expected:* 400 Bad Request - Invalid location ID