// Helpers that work out what the customer should pay after discounts.
// Discounts are for logged-in members only. Guests and signed-out visitors pay
// the regular price. If isLoggedIn is not passed, discounts apply (default true).

export function hasDiscount(item, isLoggedIn = true) {
    if (!isLoggedIn) return false;
    return (
        item.discountedPrice !== null &&
        item.discountedPrice !== undefined &&
        item.discountedPrice !== "" &&
        Number(item.discountedPrice) < Number(item.price)
    );
}

export function getFinalPrice(item, isLoggedIn = true) {
    return hasDiscount(item, isLoggedIn) ? Number(item.discountedPrice) : Number(item.price);
}

export function getDiscountPercentage(item, isLoggedIn = true) {
    if (!hasDiscount(item, isLoggedIn)) return 0;
    const discount = Number(item.price) - Number(item.discountedPrice);
    return Math.round((discount / Number(item.price)) * 100);
}

// Text for the little badge on the picture
export function getBadgeText(item, isLoggedIn = true) {
    if (hasDiscount(item, isLoggedIn)) {
        return `${getDiscountPercentage(item, isLoggedIn)}% OFF`;
    }
    if (item.featured) {
        return "Featured";
    }
    return "";
}
