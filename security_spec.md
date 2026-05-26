# Security Specification: AtendePro - Sono Show Móveis

This specification defines the strict security invariants and threat vectors for the application's Firestore database.

## 1. Data Invariants

1. **Authentication Boundary:** Zero read or write operations are permitted for unauthenticated sessions. We strictly require `request.auth.uid != null`.
2. **Schema & Sizing Enforcement:** All written strings must have size limits to avoid "Denial of Wallet" resource exhaustion.
3. **Role-Based Read/Write Enforcement:**
   - **Supervisors** hold unrestricted access to all endpoints.
   - **Managers** can read `/quotes` within their own `branchId` and read all branches/users. They cannot delete files or modify other users' roles.
   - **Salespersons** can read/write their own `/quotes`. They can read `/branches` and other `/users`. They cannot access `/auditLogs` or change `/companies`.
4. **Audit Logs Immutability:** `/auditLogs` can only be appended to during transaction batches (`create`), never updated or deleted by normal users.
5. **System Field Immutability:** Fields like `createdAt` of any record cannot be modified during updates.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads represent attacks against our database. The final security rules must deny all of them.

### Attack Vector 1: Identity Spoofing (Modifying `createdBy` to impersonate someone else)
* **Target Collection:** `/quotes/malicious_quote_1`
* **Payload:**
  ```json
  {
    "id": "malicious_quote_1",
    "clientName": "John Doe",
    "clientPhone": "21999999999",
    "productInterest": "Sofa",
    "value": 1500,
    "category": "price_high",
    "returnDate": "2026-06-01T12:00:00Z",
    "status": "pending",
    "createdBy": "victim_user_id_xyz",
    "branchId": "b1",
    "createdAt": "2026-05-26T12:00:00Z"
  }
  ```
  * *Reason for Rejection:* `createdBy` must match the authenticated user (`request.auth.uid`).

### Attack Vector 2: Self-Assigned Role Privilege Escalation
* **Target Collection:** `/users/my_hacked_user`
* **Payload:**
  ```json
  {
    "id": "my_hacked_user",
    "name": "Attacker",
    "role": "supervisor",
    "phone": "21999999999",
    "createdAt": "2026-05-26T12:00:00Z"
  }
  ```
  * *Reason for Rejection:* Non-supervisors are forbidden from assigning or upgrading their own roles.

### Attack Vector 3: Resource Poisoning via Unbounded String Length
* **Target Collection:** `/branches/huge_branch_id`
* **Payload:**
  ```json
  {
    "id": "huge_branch_id",
    "name": "A brand new branch with name that spans over 100000 characters just to spam the DB and cause storage exhaustion attacks ... [truncated for size]",
    "createdAt": "2026-05-26T12:00:00Z"
  }
  ```
  * *Reason for Rejection:* Sizing gates (`name.size() <= 100`) must fail strings exceeding thresholds.

### Attack Vector 4: Illegal Temporal Manipulation
* **Target Collection:** `/quotes/retroactive_quote`
* **Payload:**
  ```json
  {
    "id": "retroactive_quote",
    "clientName": "Joe Bloggs",
    "clientPhone": "21999990101",
    "productInterest": "Bed",
    "value": 2500,
    "category": "card_turning",
    "returnDate": "2026-06-01T12:00:00Z",
    "status": "pending",
    "createdBy": "attacker_uid",
    "branchId": "b1",
    "createdAt": "2010-01-01T00:00:00Z"
  }
  ```
  * *Reason for Rejection:* `createdAt` must exactly match the virtual server clock timestamp (`request.time`).

### Attack Vector 5: Audit Log Deletion/Tampering
* **Target Collection:** `/auditLogs/security_log_1`
* **Payload:** (Delete Operation)
  * *Reason for Rejection:* Audit logs are immutable write-only streams once generated. `allow delete, update: if false`.

### Attack Vector 6: Branch Cross-Pollination (Salesperson writing a quote for a branch they do not belong to)
* **Target Collection:** `/quotes/cross_branch_quote`
* **Payload:**
  ```json
  {
    "id": "cross_branch_quote",
    "clientName": "Alice Cooper",
    "clientPhone": "21999991234",
    "productInterest": "Wardrobe",
    "value": 1200,
    "category": "researching",
    "returnDate": "2026-06-01T12:00:00Z",
    "status": "pending",
    "createdBy": "salesperson_uid",
    "branchId": "b2_other_branch",
    "createdAt": "2026-05-26T12:00:00Z"
  }
  ```
  * *Reason for Rejection:* User must belong to the branch specified or have high roles (Supervisor/Manager matching the branch).

### Attack Vector 7: Shadow Update Ghost Fields
* **Target Collection:** `/quotes/active_quote`
* **Payload:**
  ```json
  {
    "id": "active_quote",
    "status": "won",
    "hacked_field_xyz": "ghost_data_to_bypass_schema"
  }
  ```
  * *Reason for Rejection:* `affectedKeys().hasOnly(...)` should block updates with unapproved/extra keys.

### Attack Vector 8: Unauthorized Client-Side SaaS Settings Modification
* **Target Collection:** `/companies/c1`
* **Payload:**
  ```json
  {
    "maxUsers": 999999,
    "plan": "Enterprise FREE Hack Edition"
  }
  ```
  * *Reason for Rejection:* Only supervisors can update SaaS subscription states.

### Attack Vector 9: PII Blanket Harvest (Listing all user records without a secure query constraint)
* **Operation:** `list` /users
  * *Reason for Rejection:* If non-supervisors can list everything, it facilitates scraping of emails/phones. The list rule must filter profiles or have explicit access guards.

### Attack Vector 10: Status Bypass in Completed State
* **Target Collection:** `/quotes/completed_quote`
* **Payload:** (Trying to revert terminal state `"won"` back to `"pending"`)
  * *Reason for Rejection:* Transition locks block updates to a document whose status is already a terminal value like `"won"` or `"lost"`.

### Attack Vector 11: Id Poisoning with Junk Characters
* **Target Collection:** `/quotes/$$$___MALICIOUS___$$$`
  * *Reason for Rejection:* Only ids satisfying `^[a-zA-Z0-9_\-]+$` and `<= 128` size are allowed.

### Attack Vector 12: Anonymous Write Bypass
* **Target Collection:** `/quotes/test_quote_anon`
  * *Reason for Rejection:* Unauthenticated or unverified users cannot modify database records without a fully verified email claim context.

---

## 3. Test Runner Definition: firestore.rules.test.ts

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

// The test runner validates that each of the 12 scenarios above is indeed blocked with PERMISSION_DENIED.
```
