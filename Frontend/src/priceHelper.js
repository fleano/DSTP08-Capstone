// This is a helper function that works out what the customer should pay
// after applying discounts

function round(number) {
    return Math.round(number * 100) / 100;
}

export function getFinalPrice(item) {
    const price = Number(item.price);
    const value = Number(item.discountValue);

    if (item.discountType === "percent" && value > 0 && value < 100) {
        return round(price * (1 - value / 100));
    }

    // A special price only counts if it is lower than the normal price
    if (item.discountType === "fixed" && value > 0 && value < price) {
        return round(value);
    }

    return round(price);
}

export function hasDiscount(item) {
    return getFinalPrice(item) < Number(item.price);
}

// This is for the little badge on the picture
export function getBadgeText(item) {
    if (!hasDiscount(item)) {
        return "";
    }
    if (item.discountType === "percent") {
        return "-" + Number(item.discountValue) + "%";
    }
    return "SPECIAL";
}
