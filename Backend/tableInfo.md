**Role**
Defines the role and subsequently the permissions they will have.
Initial rows: Admin, Manager, Staff, Customer

**Account**
Defines the account information each user has. Username is also the user's email address they registered with.
Changes to password, first name, last name and other personal details should also UPDATE this table.

**Sessions**
Stores session tokens and expiry dates. This will be used to validate the user's current authentication with database side.
Certain actions like adding food, adding schedule notes require authentication with a token that has the right to perform that action.
Write to sessions table when starting a session.
Guest users will be given a new temporary account. This account is device-bound (does not persist across devices)
Expired tokens should be periodically removed or removed when the user tries to use a token but it's already expired.

**BanReason** *not used*
If a user is banned, the ban event is logged here for administration purposes.
When a user logs in, the middleware should query BanReason if they exist inside, if they have a ban that is not yet expired, prevent them from logging in and show ban reason as an error message.
A user can be banned for multiple reasons or even permanently (expiryDate == NULL)

**FoodCategory**
Defines the category of a food item. Used for filtering, searching etc.
Initial rows: Other, Drink, Food, Set Meal

**Food**
Defines a food object for use in display in the home page, full menu page, shopping cart page, etc.
Admin (and Manager?) should upload a food image to go with an entry, otherwise a placeholder image is used.
Food object by default starts as (enabled FALSE) and (available FALSE) so that the restaurant manager can plan special offers and events without leaking secrets
Can also be defined with a price and discounted price for events and offers.
enabled - If TRUE, is visible publicly on the menu.
available - If TRUE, item displays normally. If FALSE, item displays as 'SOLD OUT'.

**FoodCart**
Stores food objects (foodID, quantity) that they currently have put into the cart and awaiting checkout.
Each cart is bound to an accountID.
Guest users will be given a new temporary account. This account is device-bound (does not persist across devices)

**OrderHistory**
Stores prior orders that a user has made. This table saves orderID, orderDate and accountID at the moment of FoodCart checkout.
orderID is tied to OrderHistoryItems' orderID.

**OrderHistoryItems**
Stores items that have been ordered before by users (FoodCart checkout), one item for each row. OrderID is used to group up items pertaining to an order.
The price information should be IMMUTABLE at time of adding a row, because food can be discounted, have their prices changed, etc.
So each row's information should have no dependency on price.
Guest users can have an order history but should be removed once their temporary account has expired.

**FoodCoupons**
Stores discount coupons, discount values and accountID that has the right to purchase items at that value.

**Schedule**
Stores dates and textual notes for each date for use with the scheduling/calendar system.
