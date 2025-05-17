// npx prisma migrate dev
// npx prisma generate
// npx ts-node util/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const calculateTotalAmount = async (
    items: { productId: number; quantity: number }[],
    prisma: PrismaClient
) => {
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
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();

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
            rating: [5, 4, 3, 5, 5],
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
            rating: [3, 3, 3, 5, 5],
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
            rating: [5, 5, 4, 5, 5],
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
            rating: [5, 4, 5, 5, 5],
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
            rating: [5, 4, 3, 5, 2],
        },
    });

    const products = [
        {
            name: '3D Movie Glasses',
            price: 19.99,
            stock: 100,
            categories: ['Accessories', 'Electronics'],
            description: 'Wear these 3D glasses to enjoy your favorite movies in true 3D.',
            images: '3d-glasses',
            sizes: ['One Size'],
            colors: ['Black', 'Red'],
            rating: [5, 4, 4, 5, 5],
        },
        {
            name: 'Coog Sunglasses',
            price: 29.99,
            stock: 75,
            categories: ['Accessories', 'Eyewear'],
            description: 'Stylish Coog sunglasses with UV protection.',
            images: 'coog-glasses',
            sizes: ['One Size'],
            colors: ['Black', 'Tortoise'],
            rating: [4, 4, 5, 3, 4],
        },
        {
            name: 'Heart Print T-Shirt',
            price: 24.99,
            stock: 150,
            categories: ['Clothing', 'Tops'],
            description: 'Soft cotton t-shirt with a cute heart print on the chest.',
            images: 'heart-shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['White', 'Pink', 'Red'],
            rating: [5, 5, 4, 5, 5],
        },
        {
            name: 'Pearl Necklace',
            price: 49.99,
            stock: 40,
            categories: ['Accessories', 'Jewelry'],
            description: 'Elegant pearl necklace for formal occasions.',
            images: 'pearl-necklace',
            sizes: ['One Size'],
            colors: ['White'],
            rating: [5, 5, 5, 4, 5],
        },
        {
            name: 'Sports Shoe',
            price: 59.99,
            stock: 80,
            categories: ['Footwear', 'Sports'],
            description: 'Lightweight sports shoe designed for running and training.',
            images: 'sports-shoe',
            sizes: ['M', 'L', 'XL'],
            colors: ['White', 'Black', 'Blue'],
            rating: [4, 4, 3, 5, 4],
        },
        {
            name: 'Classic Watch Mk II',
            price: 129.99,
            stock: 50,
            categories: ['Accessories', 'Watches'],
            description: 'A refined sequel to our best-selling Classic Watch.',
            images: 'watch2',
            sizes: ['One Size'],
            colors: ['Silver', 'Gold'],
            rating: [5, 5, 4, 5, 5],
        },
        {
            name: 'Stylish Bag',
            price: 34.99,
            stock: 120,
            categories: ['Accessories', 'Bags'],
            description: 'Everyday bag with adjustable strap and multiple pockets.',
            images: 'bag',
            sizes: ['One Size'],
            colors: ['Black', 'Brown'],
            rating: [4, 4, 4, 5, 3],
        },
        {
            name: 'Summer Dress',
            price: 44.99,
            stock: 60,
            categories: ['Clothing', 'Dresses'],
            description: 'Light summer dress with floral pattern.',
            images: 'dress',
            sizes: ['S', 'M', 'L'],
            colors: ['Yellow', 'Blue'],
            rating: [5, 4, 5, 4, 5],
        },
        {
            name: 'Polo Shirt',
            price: 29.99,
            stock: 90,
            categories: ['Clothing', 'Tops'],
            description: 'Classic polo shirt in breathable cotton.',
            images: 'polo',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['White', 'Navy', 'Red'],
            rating: [4, 4, 3, 5, 4],
        },
        {
            name: 'Silver Ring',
            price: 19.99,
            stock: 200,
            categories: ['Accessories', 'Jewelry'],
            description: 'Simple sterling silver ring.',
            images: 'silver-ring',
            sizes: ['S', 'M', 'L'],
            colors: ['Silver'],
            rating: [5, 5, 5, 4, 5],
        },
        {
            name: 'Cozy Sweater',
            price: 39.99,
            stock: 80,
            categories: ['Clothing', 'Outerwear'],
            description: 'Warm sweater for chilly days.',
            images: 'sweater',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Gray', 'Cream'],
            rating: [5, 5, 4, 4, 5],
        },
        {
            name: 'Classic Watch Mk III',
            price: 149.99,
            stock: 40,
            categories: ['Accessories', 'Watches'],
            description: 'The latest in our Classic Watch series with improved features.',
            images: 'watch3',
            sizes: ['One Size'],
            colors: ['Black', 'Rose Gold'],
            rating: [5, 5, 5, 5, 4],
        },
        {
            name: 'Warm Beanie',
            price: 14.99,
            stock: 130,
            categories: ['Accessories', 'Hats'],
            description: 'Knitted beanie to keep you warm in winter.',
            images: 'beanie',
            sizes: ['One Size'],
            colors: ['Black', 'Gray', 'Blue'],
            rating: [4, 4, 4, 5, 4],
        },
        {
            name: 'Leather Gloves',
            price: 24.99,
            stock: 70,
            categories: ['Accessories', 'Gloves'],
            description: 'Genuine leather gloves.',
            images: 'gloves',
            sizes: ['S', 'M', 'L'],
            colors: ['Black', 'Brown'],
            rating: [5, 4, 4, 5, 5],
        },
        {
            name: 'Santa Hat',
            price: 9.99,
            stock: 150,
            categories: ['Accessories', 'Holiday'],
            description: 'Festive Santa hat for holiday parties.',
            images: 'santa-hat',
            sizes: ['One Size'],
            colors: ['Red', 'White'],
            rating: [5, 5, 4, 5, 5],
        },
        {
            name: 'Skibidi Sunglasses',
            price: 21.99,
            stock: 60,
            categories: ['Accessories', 'Eyewear'],
            description: 'Trendy “Skibidi” style sunglasses.',
            images: 'skibidi-sunglasses',
            sizes: ['One Size'],
            colors: ['Black', 'Purple'],
            rating: [4, 3, 4, 5, 4],
        },
        {
            name: 'Swimming Shorts',
            price: 19.99,
            stock: 80,
            categories: ['Clothing', 'Swimwear'],
            description: 'Quick-dry swimming shorts.',
            images: 'swimming-short',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Blue', 'Green'],
            rating: [4, 4, 5, 4, 3],
        },
        {
            name: 'Classic Watch Mk IV',
            price: 179.99,
            stock: 30,
            categories: ['Accessories', 'Watches'],
            description: 'Limited edition watch with premium strap.',
            images: 'watch4',
            sizes: ['One Size'],
            colors: ['Black', 'Gold'],
            rating: [5, 5, 5, 5, 5],
        },
        {
            name: 'Gift Bow',
            price: 4.99,
            stock: 300,
            categories: ['Accessories', 'Gifts'],
            description: 'Decorative gift bow for presents.',
            images: 'bow',
            sizes: ['One Size'],
            colors: ['Red', 'Gold'],
            rating: [5, 5, 4, 5, 5],
        },
        {
            name: 'Woolen Gloves 2.0',
            price: 19.99,
            stock: 60,
            categories: ['Accessories', 'Gloves'],
            description: 'Upgrade to our woolen gloves.',
            images: 'gloves2',
            sizes: ['S', 'M', 'L'],
            colors: ['Gray', 'Black'],
            rating: [4, 4, 4, 4, 4],
        },
        {
            name: 'Kid’s T-Shirt',
            price: 14.99,
            stock: 90,
            categories: ['Kids', 'Tops'],
            description: 'Soft cotton t-shirt for kids.',
            images: 'kid-shirt',
            sizes: ['XS', 'S', 'M'],
            colors: ['Yellow', 'Light Blue'],
            rating: [5, 5, 4, 5, 5],
        },
        {
            name: 'Plain Shirt',
            price: 24.99,
            stock: 110,
            categories: ['Clothing', 'Tops'],
            description: 'Classic plain shirt.',
            images: 'shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['White', 'Blue'],
            rating: [4, 4, 4, 3, 4],
        },
        {
            name: 'Skinny Jeans',
            price: 49.99,
            stock: 70,
            categories: ['Clothing', 'Bottoms'],
            description: 'Slim-fit skinny jeans.',
            images: 'skinny-jeans',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Black', 'Blue'],
            rating: [4, 5, 4, 4, 5],
        },
        {
            name: 'Top Hat',
            price: 39.99,
            stock: 40,
            categories: ['Accessories', 'Hats'],
            description: 'Elegant top hat for formal wear.',
            images: 'top-hat',
            sizes: ['One Size'],
            colors: ['Black'],
            rating: [5, 5, 4, 5, 5],
        },
        {
            name: 'Classic Watch Mk V',
            price: 199.99,
            stock: 20,
            categories: ['Accessories', 'Watches'],
            description: 'Ultimate luxury watch, handcrafted.',
            images: 'watch5',
            sizes: ['One Size'],
            colors: ['Silver', 'Black'],
            rating: [5, 5, 5, 5, 5],
        },
        {
            name: 'Baseball Cap',
            price: 14.99,
            stock: 100,
            categories: ['Accessories', 'Hats'],
            description: 'Adjustable baseball cap.',
            images: 'cap',
            sizes: ['One Size'],
            colors: ['Red', 'Blue', 'Black'],
            rating: [4, 4, 3, 5, 4],
        },
        {
            name: 'Classic Hat',
            price: 24.99,
            stock: 50,
            categories: ['Accessories', 'Hats'],
            description: 'Timeless classic hat.',
            images: 'hat',
            sizes: ['One Size'],
            colors: ['Beige', 'Brown'],
            rating: [4, 4, 4, 4, 4],
        },
        {
            name: 'Kid’s Shoe',
            price: 29.99,
            stock: 80,
            categories: ['Kids', 'Footwear'],
            description: 'Comfortable shoe for kids.',
            images: 'kid-shoe',
            sizes: ['28', '29', '30'],
            colors: ['Blue', 'Red'],
            rating: [5, 4, 5, 4, 5],
        },
        {
            name: 'Shirt Variant 3',
            price: 26.99,
            stock: 90,
            categories: ['Clothing', 'Tops'],
            description: 'Alternate style shirt.',
            images: 'shirt3',
            sizes: ['S', 'M', 'L'],
            colors: ['Green', 'Gray'],
            rating: [4, 4, 4, 3, 4],
        },
        {
            name: 'Summer Skirt',
            price: 34.99,
            stock: 60,
            categories: ['Clothing', 'Bottoms'],
            description: 'Light summer skirt.',
            images: 'skirt',
            sizes: ['S', 'M', 'L'],
            colors: ['Yellow', 'Pink'],
            rating: [5, 5, 4, 5, 5],
        },
        {
            name: 'Ugly Christmas Sweater',
            price: 29.99,
            stock: 70,
            categories: ['Clothing', 'Holiday'],
            description: 'Fun ugly Christmas sweater.',
            images: 'ugly-shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Red', 'Green'],
            rating: [5, 5, 5, 4, 5],
        },
        {
            name: 'Classic Shoe',
            price: 59.99,
            stock: 80,
            categories: ['Footwear', 'Casual'],
            description: 'Everyday classic shoe.',
            images: 'classic-shoe',
            sizes: ['M', 'L', 'XL'],
            colors: ['Brown', 'Black'],
            rating: [4, 4, 3, 5, 4],
        },
        {
            name: 'Hat Variant 2',
            price: 24.99,
            stock: 50,
            categories: ['Accessories', 'Hats'],
            description: 'Stylish hat variant.',
            images: 'hat2',
            sizes: ['One Size'],
            colors: ['Gray', 'Black'],
            rating: [4, 4, 4, 4, 4],
        },
        {
            name: 'Work Shoe',
            price: 69.99,
            stock: 60,
            categories: ['Footwear', 'Work'],
            description: 'Durable work shoe.',
            images: 'work-shoe',
            sizes: ['M', 'L', 'XL'],
            colors: ['Black', 'Brown'],
            rating: [4, 4, 5, 4, 4],
        },
    ];

    for (const p of products) {
        await prisma.product.create({ data: p });
    }

    const johnDoe = await prisma.customer.create({
        data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: await bcrypt.hash('password123', 12),
            role: 'customer',
            wishlist: {},
        },
    });

    const janeSmith = await prisma.customer.create({
        data: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            password: await bcrypt.hash('password456', 12),
            role: 'customer',
            wishlist: {},
        },
    });

    const aliceJohnson = await prisma.customer.create({
        data: {
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@example.com',
            password: await bcrypt.hash('password789', 12),
            role: 'customer',
            wishlist: {},
        },
    });

    const admin = await prisma.customer.create({
        data: {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: await bcrypt.hash('admin123', 12),
            role: 'admin',
            wishlist: {},
        },
    });

    const salesman = await prisma.customer.create({
        data: {
            firstName: 'Salesman',
            lastName: 'User',
            email: 'salesman@example.com',
            password: await bcrypt.hash('salesman123', 12),
            role: 'salesman',
            wishlist: {},
        },
    });

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
    } catch (error) {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    }
})();
