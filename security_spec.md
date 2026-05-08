# Security Specification for AI Interview

## Data Invariants
1. A user can only read/write their own profile data.
2. Interviews must have a valid `userId` matching the authenticated user.
3. Resume analyses must belong to the user who uploaded them.
4. Timestamps (`createdAt`) must be set by the server.
5. Scores must be numbers between 0 and 100.
6. Admin-only roles cannot be set by standard users.

## The Dirty Dozen Payloads (Potential Attacks)
1. **Identity Theft**: Update `userId` to another user's UID to orphan a record.
2. **Privilege Escalation**: Attempt to update `role` to `ADMIN` on profile creation.
3. **Data Pollution**: Inject a 2MB string into `feedback`.
4. **ID Poisoning**: Use a document ID like `../../secrets` to exploit path vulnerabilities.
5. **Timestamp Spoofing**: Provide a future `createdAt` from the client.
6. **Negative Scoring**: Set `atsScore` to `-50`.
7. **Type Mismatch**: Send an array instead of a string for `position`.
8. **Shadow Field Injection**: Add `isVerified: true` to a user profile.
9. **Relational Bypass**: Access an interview record without being the owner.
10. **State Skipping**: Manually setting status to `completed` without going through the interview process logic.
11. **PII Leak**: Querying for all user emails globally.
12. **Denial of Wallet**: Repeatedly writing tiny documents to blow up read/write costs.

## Test Runner (Logic Overview)
The `firestore.rules` will be verified against these payloads using `isValid[Entity]` helpers and `affectedKeys().hasOnly()` gates.
