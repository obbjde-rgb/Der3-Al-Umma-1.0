# Security Specification for "Der' Al-Ummah" (Shield of the Ummah)

## Data Invariants
1. A **DoubtResponse** must have a valid `authorId` matching the creator's UID.
2. Only users with the `scholar` or `admin` role can set the status of a `DoubtResponse` to `published`.
3. Users cannot modify their own `role` or `reputation` in the `users` collection.
4. **CourseEnrollment** records must always belong to the `request.auth.uid`.
5. **FundingCampaign** and **LegalCase** writes are restricted to `admin` role only.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: User A trying to create a `DoubtResponse` with `authorId` of User B.
2. **Privilege Escalation**: User trying to update their own `role` to `admin`.
3. **Status Shortcut**: Ambassador trying to set a response status directly to `published` without scholar review.
4. **Unauthorized Read**: Anonymous user trying to read `users/{userId}/private` data (if we had private subcollections).
5. **Resource Poisoning**: Sending a 1MB string for `doubt` title.
6. **Orphaned Write**: Creating a `CourseEnrollment` with a non-existent `courseId` (exists check).
7. **Cross-User Leak**: User A trying to update User B's `CourseEnrollment`.
8. **Invalid Enum**: Setting `threatLevel` to "extreme" (not in enum).
9. **Timestamp Spoofing**: Sending a manual `createdAt` string instead of `serverTimestamp()`.
10. **Ghost Field Injection**: Adding `isVerified: true` to a campaign update.
11. **Malicious ID**: Using `../../../etc/passwd` as a document ID.
12. **PII Scraping**: Trying to list the entire `users` collection as a standard user.

## Test Runner (firestore.rules.test.ts placeholder)
(I will implement the rules and validation logic next).
