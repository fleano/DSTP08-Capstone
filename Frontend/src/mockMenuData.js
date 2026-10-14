// Used if the backend isn't running yet
// category numbers: 1 = Appetizers, 2 = Mains, 3 = Desserts, 4 = Beverages

export const mockCategories = [
    { id: 1, name: "Appetizers" },
    { id: 2, name: "Mains" },
    { id: 3, name: "Desserts" },
    { id: 4, name: "Beverages" }
];

export const mockMenuItems = [
    { id: 1, category: 2, name: "Peking Roasted Duck", description: "Crispy skin sliced with soft steamed buns, scallions, and XO sauce.", price: 28.99 },
    { id: 2, category: 2, name: "Kung Pao Chicken", description: "Spicy stir-fried chicken with peanuts, vegetables and chili peppers.", price: 15.5 },
    { id: 3, category: 1, name: "Xiao Long Bao", description: "Steamed pork dumplings that melt in every bite.", price: 12.0 },
    { id: 4, category: 2, name: "Szechuan Mapo Tofu", description: "Tofu in a spicy douban sauce with minced meat.", price: 13.5 },
    { id: 5, category: 1, name: "Crispy Spring Rolls", description: "Golden rolls filled with vegetables and glass noodles.", price: 6.5 },
    { id: 6, category: 3, name: "Mango Pudding", description: "Silky chilled pudding with fresh mango.", price: 6.0 },
    { id: 7, category: 3, name: "Sesame Balls", description: "Fried glutinous rice balls with sweet red bean paste.", price: 5.5 },
    { id: 8, category: 4, name: "Jasmine Tea", description: "Fragrant hot tea served in a pot.", price: 3.5 },
    { id: 9, category: 4, name: "Lychee Iced Tea", description: "Cold black tea with lychee and a hint of lemon.", price: 4.5 }
];
