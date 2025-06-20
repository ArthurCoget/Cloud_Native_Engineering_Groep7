"use strict";
// npx prisma migrate dev
// npx prisma generate
// npx ts-node util/seed.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const calculateTotalAmount = async (items, prisma) => {
    let totalAmount = 0;
    for (const item of items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
        });
        if (product) {
            totalAmount += product.price * item.quantity;
        }
    }
    return totalAmount;
};
const main = async () => {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.discountCode.deleteMany();
    await prisma.review.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();
    const johnDoe = await prisma.customer.create({
        data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: await bcrypt_1.default.hash('password123', 12),
            role: 'customer',
            wishlist: {},
        },
    });
    const janeSmith = await prisma.customer.create({
        data: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            password: await bcrypt_1.default.hash('password456', 12),
            role: 'customer',
            wishlist: {},
        },
    });
    const aliceJohnson = await prisma.customer.create({
        data: {
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@example.com',
            password: await bcrypt_1.default.hash('password789', 12),
            role: 'customer',
            wishlist: {},
        },
    });
    const admin = await prisma.customer.create({
        data: {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: await bcrypt_1.default.hash('admin123', 12),
            role: 'admin',
            wishlist: {},
        },
    });
    const salesman = await prisma.customer.create({
        data: {
            firstName: 'Salesman',
            lastName: 'User',
            email: 'salesman@example.com',
            password: await bcrypt_1.default.hash('salesman123', 12),
            role: 'salesman',
            wishlist: {},
        },
    });
    const tShirt = await prisma.product.create({
        data: {
            name: 'Basic T-Shirt',
            price: 19.99,
            stock: 100,
            categories: ['Clothing', 'Tops'],
            description: 'A comfortable, everyday t-shirt available in multiple colors.',
            images: 'shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Red', 'Blue', 'Black'],
        },
    });
    const runningShoes = await prisma.product.create({
        data: {
            name: 'Running Shoes',
            price: 79.99,
            stock: 50,
            categories: ['Footwear', 'Sports'],
            description: 'Lightweight and comfortable shoes designed for running.',
            images: 'shoes',
            sizes: ['M', 'L', 'XL'],
            colors: ['White', 'Black'],
        },
    });
    const casualHoodie = await prisma.product.create({
        data: {
            name: 'Casual Hoodie',
            price: 39.99,
            stock: 75,
            categories: ['Clothing', 'Outerwear'],
            description: 'A cozy hoodie perfect for casual wear.',
            images: 'hoodie',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Gray', 'Navy'],
        },
    });
    const classicWatch = await prisma.product.create({
        data: {
            name: 'Classic Watch',
            price: 99.99,
            stock: 30,
            categories: ['Accessories', 'Watches'],
            description: 'A classic watch with a sleek design.',
            images: 'watch',
            sizes: ['M'],
            colors: ['Black', 'Silver'],
        },
    });
    const denimJeans = await prisma.product.create({
        data: {
            name: 'Denim Jeans',
            price: 49.99,
            stock: 60,
            categories: ['Clothing', 'Bottoms'],
            description: 'Classic denim jeans with a comfortable fit.',
            images: 'jeans',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Blue', 'Black'],
        },
    });
    const three_D_glasses = await prisma.product.create({
        data: {
            name: '3D Movie Glasses',
            price: 19.99,
            stock: 100,
            categories: ['Accessories', 'Electronics'],
            description: 'Wear these 3D glasses to enjoy your favorite movies in true 3D.',
            images: '3d-glasses',
            sizes: ['One Size'],
            colors: ['Black', 'Red'],
        },
    });
    const coog_sunglasses = await prisma.product.create({
        data: {
            name: 'Coog Sunglasses',
            price: 29.99,
            stock: 75,
            categories: ['Accessories', 'Eyewear'],
            description: 'Stylish Coog sunglasses with UV protection.',
            images: 'coog-glasses',
            sizes: ['One Size'],
            colors: ['Black', 'Tortoise'],
        },
    });
    const heart_shirt = await prisma.product.create({
        data: {
            name: 'Heart Print T-Shirt',
            price: 24.99,
            stock: 150,
            categories: ['Clothing', 'Tops'],
            description: 'Soft cotton t-shirt with a cute heart print on the chest.',
            images: 'heart-shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['White', 'Pink', 'Red'],
        },
    });
    const pearl_necklace = await prisma.product.create({
        data: {
            name: 'Pearl Necklace',
            price: 49.99,
            stock: 40,
            categories: ['Accessories', 'Jewelry'],
            description: 'Elegant pearl necklace for formal occasions.',
            images: 'pearl-necklace',
            sizes: ['One Size'],
            colors: ['White'],
        },
    });
    const sports_shoe = await prisma.product.create({
        data: {
            name: 'Sports Shoe',
            price: 59.99,
            stock: 80,
            categories: ['Footwear', 'Sports'],
            description: 'Lightweight sports shoe designed for running and training.',
            images: 'sports-shoe',
            sizes: ['M', 'L', 'XL'],
            colors: ['White', 'Black', 'Blue'],
        },
    });
    const classic_watch_mk_ii = await prisma.product.create({
        data: {
            name: 'Classic Watch Mk II',
            price: 129.99,
            stock: 50,
            categories: ['Accessories', 'Watches'],
            description: 'A refined sequel to our best-selling Classic Watch.',
            images: 'watch2',
            sizes: ['One Size'],
            colors: ['Silver', 'Gold'],
        },
    });
    const stylish_bag = await prisma.product.create({
        data: {
            name: 'Stylish Bag',
            price: 34.99,
            stock: 120,
            categories: ['Accessories', 'Bags'],
            description: 'Everyday bag with adjustable strap and multiple pockets.',
            images: 'bag',
            sizes: ['One Size'],
            colors: ['Black', 'Brown'],
        },
    });
    const summer_dress = await prisma.product.create({
        data: {
            name: 'Summer Dress',
            price: 44.99,
            stock: 60,
            categories: ['Clothing', 'Dresses'],
            description: 'Light summer dress with floral pattern.',
            images: 'dress',
            sizes: ['S', 'M', 'L'],
            colors: ['Yellow', 'Blue'],
        },
    });
    const polo_shirt = await prisma.product.create({
        data: {
            name: 'Polo Shirt',
            price: 29.99,
            stock: 90,
            categories: ['Clothing', 'Tops'],
            description: 'Classic polo shirt in breathable cotton.',
            images: 'polo',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['White', 'Navy', 'Red'],
        },
    });
    const silver_ring = await prisma.product.create({
        data: {
            name: 'Silver Ring',
            price: 19.99,
            stock: 200,
            categories: ['Accessories', 'Jewelry'],
            description: 'Simple sterling silver ring.',
            images: 'silver-ring',
            sizes: ['S', 'M', 'L'],
            colors: ['Silver'],
        },
    });
    const cozy_sweater = await prisma.product.create({
        data: {
            name: 'Cozy Sweater',
            price: 39.99,
            stock: 80,
            categories: ['Clothing', 'Outerwear'],
            description: 'Warm sweater for chilly days.',
            images: 'sweater',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Gray', 'Cream'],
        },
    });
    const classic_watch_mk_iii = await prisma.product.create({
        data: {
            name: 'Classic Watch Mk III',
            price: 149.99,
            stock: 40,
            categories: ['Accessories', 'Watches'],
            description: 'The latest in our Classic Watch series with improved features.',
            images: 'watch3',
            sizes: ['One Size'],
            colors: ['Black', 'Rose Gold'],
        },
    });
    const warm_beanie = await prisma.product.create({
        data: {
            name: 'Warm Beanie',
            price: 14.99,
            stock: 130,
            categories: ['Accessories', 'Hats'],
            description: 'Knitted beanie to keep you warm in winter.',
            images: 'beanie',
            sizes: ['One Size'],
            colors: ['Black', 'Gray', 'Blue'],
        },
    });
    const leather_gloves = await prisma.product.create({
        data: {
            name: 'Leather Gloves',
            price: 24.99,
            stock: 70,
            categories: ['Accessories', 'Gloves'],
            description: 'Genuine leather gloves.',
            images: 'gloves',
            sizes: ['S', 'M', 'L'],
            colors: ['Black', 'Brown'],
        },
    });
    const santa_hat = await prisma.product.create({
        data: {
            name: 'Santa Hat',
            price: 9.99,
            stock: 150,
            categories: ['Accessories', 'Holiday'],
            description: 'Festive Santa hat for holiday parties.',
            images: 'santa-hat',
            sizes: ['One Size'],
            colors: ['Red', 'White'],
        },
    });
    const skibidi_sunglasses = await prisma.product.create({
        data: {
            name: 'Skibidi Sunglasses',
            price: 21.99,
            stock: 60,
            categories: ['Accessories', 'Eyewear'],
            description: 'Trendy “Skibidi” style sunglasses.',
            images: 'skibidi-sunglasses',
            sizes: ['One Size'],
            colors: ['Black', 'Purple'],
        },
    });
    const swimming_shorts = await prisma.product.create({
        data: {
            name: 'Swimming Shorts',
            price: 19.99,
            stock: 80,
            categories: ['Clothing', 'Swimwear'],
            description: 'Quick-dry swimming shorts.',
            images: 'swimming-short',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Blue', 'Green'],
        },
    });
    const classic_watch_mk_iv = await prisma.product.create({
        data: {
            name: 'Classic Watch Mk IV',
            price: 179.99,
            stock: 30,
            categories: ['Accessories', 'Watches'],
            description: 'Limited edition watch with premium strap.',
            images: 'watch4',
            sizes: ['One Size'],
            colors: ['Black', 'Gold'],
        },
    });
    const gift_bow = await prisma.product.create({
        data: {
            name: 'Gift Bow',
            price: 4.99,
            stock: 300,
            categories: ['Accessories', 'Gifts'],
            description: 'Decorative gift bow for presents.',
            images: 'bow',
            sizes: ['One Size'],
            colors: ['Red', 'Gold'],
        },
    });
    const woolen_gloves_2_0 = await prisma.product.create({
        data: {
            name: 'Woolen Gloves 2.0',
            price: 19.99,
            stock: 60,
            categories: ['Accessories', 'Gloves'],
            description: 'Upgrade to our woolen gloves.',
            images: 'gloves2',
            sizes: ['S', 'M', 'L'],
            colors: ['Gray', 'Black'],
        },
    });
    const kids_tshirt = await prisma.product.create({
        data: {
            name: 'Kid’s T-Shirt',
            price: 14.99,
            stock: 90,
            categories: ['Kids', 'Tops'],
            description: 'Soft cotton t-shirt for kids.',
            images: 'kid-shirt',
            sizes: ['XS', 'S', 'M'],
            colors: ['Yellow', 'Light Blue'],
        },
    });
    const plain_shirt = await prisma.product.create({
        data: {
            name: 'Plain Shirt',
            price: 24.99,
            stock: 110,
            categories: ['Clothing', 'Tops'],
            description: 'Classic plain shirt.',
            images: 'shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['White', 'Blue'],
        },
    });
    const skinny_jeans = await prisma.product.create({
        data: {
            name: 'Skinny Jeans',
            price: 49.99,
            stock: 70,
            categories: ['Clothing', 'Bottoms'],
            description: 'Slim-fit skinny jeans.',
            images: 'skinny-jeans',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Black', 'Blue'],
        },
    });
    const top_hat = await prisma.product.create({
        data: {
            name: 'Top Hat',
            price: 39.99,
            stock: 40,
            categories: ['Accessories', 'Hats'],
            description: 'Elegant top hat for formal wear.',
            images: 'top-hat',
            sizes: ['One Size'],
            colors: ['Black'],
        },
    });
    const classic_watch_mk_v = await prisma.product.create({
        data: {
            name: 'Classic Watch Mk V',
            price: 199.99,
            stock: 20,
            categories: ['Accessories', 'Watches'],
            description: 'Ultimate luxury watch, handcrafted.',
            images: 'watch5',
            sizes: ['One Size'],
            colors: ['Silver', 'Black'],
        },
    });
    const baseball_cap = await prisma.product.create({
        data: {
            name: 'Baseball Cap',
            price: 14.99,
            stock: 100,
            categories: ['Accessories', 'Hats'],
            description: 'Adjustable baseball cap.',
            images: 'cap',
            sizes: ['One Size'],
            colors: ['Red', 'Blue', 'Black'],
        },
    });
    const classic_hat = await prisma.product.create({
        data: {
            name: 'Classic Hat',
            price: 24.99,
            stock: 50,
            categories: ['Accessories', 'Hats'],
            description: 'Timeless classic hat.',
            images: 'hat',
            sizes: ['One Size'],
            colors: ['Beige', 'Brown'],
        },
    });
    const kid_shoe = await prisma.product.create({
        data: {
            name: 'Kid’s Shoe',
            price: 29.99,
            stock: 80,
            categories: ['Kids', 'Footwear'],
            description: 'Comfortable shoe for kids.',
            images: 'kid-shoe',
            sizes: ['28', '29', '30'],
            colors: ['Blue', 'Red'],
        },
    });
    const shirt_variant_3 = await prisma.product.create({
        data: {
            name: 'Shirt Variant 3',
            price: 26.99,
            stock: 90,
            categories: ['Clothing', 'Tops'],
            description: 'Alternate style shirt.',
            images: 'shirt3',
            sizes: ['S', 'M', 'L'],
            colors: ['Green', 'Gray'],
        },
    });
    const summer_skirt = await prisma.product.create({
        data: {
            name: 'Summer Skirt',
            price: 34.99,
            stock: 60,
            categories: ['Clothing', 'Bottoms'],
            description: 'Light summer skirt.',
            images: 'skirt',
            sizes: ['S', 'M', 'L'],
            colors: ['Yellow', 'Pink'],
        },
    });
    const ugly_christmas_sweater = await prisma.product.create({
        data: {
            name: 'Ugly Christmas Sweater',
            price: 29.99,
            stock: 70,
            categories: ['Clothing', 'Holiday'],
            description: 'Fun ugly Christmas sweater.',
            images: 'ugly-shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Red', 'Green'],
        },
    });
    const classic_shoe = await prisma.product.create({
        data: {
            name: 'Classic Shoe',
            price: 59.99,
            stock: 80,
            categories: ['Footwear', 'Casual'],
            description: 'Everyday classic shoe.',
            images: 'classic-shoe',
            sizes: ['M', 'L', 'XL'],
            colors: ['Brown', 'Black'],
        },
    });
    const hat_variant_2 = await prisma.product.create({
        data: {
            name: 'Hat Variant 2',
            price: 24.99,
            stock: 50,
            categories: ['Accessories', 'Hats'],
            description: 'Stylish hat variant.',
            images: 'hat2',
            sizes: ['One Size'],
            colors: ['Gray', 'Black'],
        },
    });
    const work_shoe = await prisma.product.create({
        data: {
            name: 'Work Shoe',
            price: 69.99,
            stock: 60,
            categories: ['Footwear', 'Work'],
            description: 'Durable work shoe.',
            images: 'work-shoe',
            sizes: ['M', 'L', 'XL'],
            colors: ['Black', 'Brown'],
        },
    });
    const reviewsToSeed = [
        {
            productId: denimJeans.id,
            customerId: johnDoe.id,
            rating: 4,
            comment: 'Great sunglasses!',
        },
        {
            productId: tShirt.id,
            customerId: janeSmith.id,
            rating: 4,
            comment: 'Stylish and comfortable.',
        },
        {
            productId: denimJeans.id,
            customerId: janeSmith.id,
            rating: 5,
            comment: 'Absolutely love this hat!',
        },
        {
            productId: classic_hat.id,
            customerId: janeSmith.id,
            rating: 5,
            comment: 'Absolutely love this hat!',
        },
        {
            productId: kid_shoe.id,
            customerId: janeSmith.id,
            rating: 5,
            comment: 'Perfect fit for my child.',
        },
        {
            productId: runningShoes.id,
            customerId: aliceJohnson.id,
            rating: 3,
            comment: 'Good quality but a bit expensive.',
        },
        {
            productId: casualHoodie.id,
            customerId: johnDoe.id,
            rating: 5,
            comment: 'Very warm and cozy.',
        },
        {
            productId: classicWatch.id,
            customerId: aliceJohnson.id,
            rating: 4,
            comment: 'Nice watch, but the strap could be better.',
        },
        {
            productId: three_D_glasses.id,
            customerId: johnDoe.id,
            rating: 2,
            comment: 'Not very comfortable.',
        },
        {
            productId: coog_sunglasses.id,
            customerId: johnDoe.id,
            rating: 5,
            comment: 'Stylish and comfortable.',
        },
        {
            productId: heart_shirt.id,
            customerId: aliceJohnson.id,
            rating: 4,
            comment: 'Cute design, but the fabric is a bit thin.',
        },
        {
            productId: pearl_necklace.id,
            customerId: johnDoe.id,
            rating: 5,
            comment: 'Beautiful necklace, very elegant.',
        },
        {
            productId: sports_shoe.id,
            customerId: aliceJohnson.id,
            rating: 3,
            comment: 'Good for running, but not very stylish.',
        },
        {
            productId: classicWatch.id,
            customerId: johnDoe.id,
            rating: 4,
            comment: 'Great watch, but a bit heavy.',
        },
        {
            productId: stylish_bag.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Perfect for everyday use.',
        },
        {
            productId: summer_dress.id,
            customerId: johnDoe.id,
            rating: 4,
            comment: 'Lovely dress, but the size runs small.',
        },
        {
            productId: polo_shirt.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Very comfortable and fits well.',
        },
        {
            productId: silver_ring.id,
            customerId: johnDoe.id,
            rating: 4,
            comment: 'Nice ring, but the size was a bit off.',
        },
        {
            productId: cozy_sweater.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Warm and stylish.',
        },
        {
            productId: warm_beanie.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Keeps me warm in winter.',
        },
        {
            productId: leather_gloves.id,
            customerId: johnDoe.id,
            rating: 3,
            comment: 'Good quality but a bit tight.',
        },
        {
            productId: santa_hat.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Perfect for the holidays!',
        },
        {
            productId: skibidi_sunglasses.id,
            customerId: johnDoe.id,
            rating: 4,
            comment: 'Stylish and trendy.',
        },
        {
            productId: swimming_shorts.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Great for the beach.',
        },
        {
            productId: classic_watch_mk_ii.id,
            customerId: johnDoe.id,
            rating: 4,
            comment: 'Nice watch, but a bit expensive.',
        },
        {
            productId: gift_bow.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Perfect for wrapping gifts.',
        },
        {
            productId: woolen_gloves_2_0.id,
            customerId: johnDoe.id,
            rating: 4,
            comment: 'Warm and cozy.',
        },
        {
            productId: kids_tshirt.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Cute design for kids.',
        },
        {
            productId: plain_shirt.id,
            customerId: johnDoe.id,
            rating: 4,
            comment: 'Good quality shirt.',
        },
        {
            productId: skinny_jeans.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Fits perfectly!',
        },
        {
            productId: top_hat.id,
            customerId: johnDoe.id,
            rating: 3,
            comment: 'Stylish but not very comfortable.',
        },
        {
            productId: baseball_cap.id,
            customerId: johnDoe.id,
            rating: 4,
            comment: 'Great for sunny days.',
        },
        {
            productId: classic_hat.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Stylish and elegant.',
        },
        {
            productId: hat_variant_2.id,
            customerId: johnDoe.id,
            rating: 4,
            comment: 'Good quality but a bit tight.',
        },
        {
            productId: work_shoe.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Perfect for work.',
        },
        {
            productId: classic_watch_mk_iii.id,
            customerId: johnDoe.id,
            rating: 4,
            comment: 'Great watch, but the strap could be better.',
        },
        {
            productId: classic_watch_mk_iv.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Beautiful watch, very elegant.',
        },
        {
            productId: classic_watch_mk_v.id,
            customerId: johnDoe.id,
            rating: 5,
            comment: 'Luxury watch, worth the price.',
        },
        {
            productId: classic_watch_mk_v.id,
            customerId: aliceJohnson.id,
            rating: 5,
            comment: 'Luxury watch, worth the price.',
        },
    ];
    for (const r of reviewsToSeed) {
        await prisma.review.create({
            data: {
                productId: r.productId,
                customerId: r.customerId,
                rating: r.rating,
                comment: r.comment,
            },
        });
    }
    const tenPercentOff = await prisma.discountCode.create({
        data: {
            code: 'SAVE10P',
            type: 'percentage',
            value: 10,
            expirationDate: new Date('2026-12-30'),
            isActive: true,
        },
    });
    const twentyPercentOff = await prisma.discountCode.create({
        data: {
            code: 'SAVE20P',
            type: 'percentage',
            value: 20,
            expirationDate: new Date('2027-11-29'),
            isActive: true,
        },
    });
    const inactivePercentOff = await prisma.discountCode.create({
        data: {
            code: 'INACTIVEP',
            type: 'percentage',
            value: 20,
            expirationDate: new Date('2028-10-28'),
            isActive: false,
        },
    });
    const thirtyFixedOff = await prisma.discountCode.create({
        data: {
            code: 'SAVE30F',
            type: 'fixed',
            value: 30,
            expirationDate: new Date('2029-9-27'),
            isActive: true,
        },
    });
    const fiftyFixedOff = await prisma.discountCode.create({
        data: {
            code: 'SAVE50F',
            type: 'fixed',
            value: 50,
            expirationDate: new Date('2030-8-26'),
            isActive: true,
        },
    });
    const inactiveFixedOff = await prisma.discountCode.create({
        data: {
            code: 'INACTIVEF',
            type: 'fixed',
            value: 50,
            expirationDate: new Date('2031-7-25'),
            isActive: false,
        },
    });
    const cartJohn = await prisma.cart.create({
        data: {
            customer: {
                connect: { id: johnDoe.id },
            },
            cartItems: {},
            discountCodes: {},
        },
    });
    const cartJaneSmith = await prisma.cart.create({
        data: {
            customer: {
                connect: { id: janeSmith.id },
            },
            cartItems: {},
            discountCodes: {},
        },
    });
    const cartAliceJohnson = await prisma.cart.create({
        data: {
            customer: {
                connect: { id: aliceJohnson.id },
            },
            cartItems: {},
            discountCodes: {},
        },
    });
    const cartAdmin = await prisma.cart.create({
        data: {
            customer: {
                connect: { id: admin.id },
            },
            cartItems: {},
        },
    });
    const cartSalesman = await prisma.cart.create({
        data: {
            customer: {
                connect: { id: salesman.id },
            },
            cartItems: {},
        },
    });
    // const orderJohn = await prisma.order.create({
    //     data: {
    //         customer: {
    //             connect: { id: johnDoe.id },
    //         },
    //         items: {
    //             create: [
    //                 {
    //                     product: {
    //                         connect: { id: tShirt.id },
    //                     },
    //                     quantity: 2,
    //                 },
    //                 {
    //                     product: {
    //                         connect: { id: runningShoes.id },
    //                     },
    //                     quantity: 1,
    //                 },
    //             ],
    //         },
    //         date: new Date(),
    //         payment: {
    //             create: {
    //                 amount: 2 * 19.99 + 1 * 79.99,
    //                 date: new Date(),
    //                 paymentStatus: 'unpaid',
    //             },
    //         },
    //     },
    // });
    // const orderAlice = await prisma.order.create({
    //     data: {
    //         customer: {
    //             connect: { id: aliceJohnson.id },
    //         },
    //         items: {
    //             create: [
    //                 {
    //                     product: {
    //                         connect: { id: denimJeans.id },
    //                     },
    //                     quantity: 3,
    //                 },
    //                 {
    //                     product: {
    //                         connect: { id: runningShoes.id },
    //                     },
    //                     quantity: 1,
    //                 },
    //             ],
    //         },
    //         date: new Date(),
    //         payment: {
    //             create: {
    //                 amount: 3 * 49.99 + 1 * 79.99,
    //                 date: new Date(),
    //                 paymentStatus: 'unpaid',
    //             },
    //         },
    //     },
    // });
    const johnOrderItems = [
        { productId: tShirt.id, quantity: 2 },
        { productId: runningShoes.id, quantity: 1 },
    ];
    // Calculate total for John's order
    const johnTotalAmount = await calculateTotalAmount(johnOrderItems, prisma);
    const orderJohn = await prisma.order.create({
        data: {
            customer: {
                connect: { id: johnDoe.id },
            },
            items: {
                create: johnOrderItems.map((item) => ({
                    product: {
                        connect: { id: item.productId },
                    },
                    quantity: item.quantity,
                })),
            },
            date: new Date(),
            payment: {
                create: {
                    amount: johnTotalAmount,
                    date: new Date(),
                    paymentStatus: 'unpaid',
                },
            },
        },
    });
    // Order items for Alice
    const aliceOrderItems = [
        { productId: denimJeans.id, quantity: 3 },
        { productId: runningShoes.id, quantity: 1 },
    ];
    // Calculate total for Alice's order
    const aliceTotalAmount = await calculateTotalAmount(aliceOrderItems, prisma);
    const orderAlice = await prisma.order.create({
        data: {
            customer: {
                connect: { id: aliceJohnson.id },
            },
            items: {
                create: aliceOrderItems.map((item) => ({
                    product: {
                        connect: { id: item.productId },
                    },
                    quantity: item.quantity,
                })),
            },
            date: new Date(),
            payment: {
                create: {
                    amount: aliceTotalAmount,
                    date: new Date(),
                    paymentStatus: 'unpaid',
                },
            },
        },
    });
};
(async () => {
    try {
        await main();
        await prisma.$disconnect();
    }
    catch (error) {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    }
})();
//# sourceMappingURL=seed.js.map