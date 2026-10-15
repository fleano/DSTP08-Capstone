/**
 * Application role IDs.
 *
 * Matches database Role table.
 *
 * @enum {number}
 */
const ROLE = Object.freeze({
  GUEST: -1,
  ADMIN: 0,
  MANAGER: 1,
  STAFF: 2,
  CUSTOMER: 3,
});

module.exports = { ROLE };
