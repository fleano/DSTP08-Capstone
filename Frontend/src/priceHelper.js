// This is a helper function that works out what the customer should pay
// after applying discounts

function round(number) {
    return Math.round(number * 100) / 100;
}

export function getFinalPrice(item) {
    return hasDiscount(item) ? Number(item.discountedPrice) : Number(item.price);
}

export function hasDiscount(item) {
    return item.discountedPrice !== null && item.discountedPrice !== undefined && item.discountedPrice < item.price;
}

export function getDiscountPercentage(item) {
    if (!hasDiscount(item)) return 0;
    const discount = item.price - item.discountedPrice;
    return Math.round((discount / item.price) * 100);
}



// This is for the little badge on the picture
export function getBadgeText(item) {
    if (hasDiscount(item)) {
        const pct = getDiscountPercentage(item);
        return `${pct}% OFF`;
    }
    if (item.featured) {
        return "Featured";
    }
    return "";
}