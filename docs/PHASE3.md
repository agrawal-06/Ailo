# Phase 3 — Integration & Security

## Verified
- Neon project Ailo and database ailo created.
- occasions schema exists and SELECT queries work using the Neon integration.
- React Native API client is committed in src/api/occasions.js.

## Not yet verified
- Local Express process can connect with DATABASE_URL.
- API GET/POST/DELETE end-to-end.
- Expo app can reach the API from a device.
- User authentication and ownership.
- Production deployment and real calls.

## Next safe implementation
1. Implement authenticated user accounts and add owner_id to occasions.
2. Require verified identity for every occasion API operation.
3. Add per-user row filtering and test unauthorized requests.
4. Configure an HTTPS deployment and secure environment variables.
5. Enable mobile API client and migrate local prototype records.
6. Add scheduling, telephony and voice capabilities.

**Do not publish the current unauthenticated API.**
