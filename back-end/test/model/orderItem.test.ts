import { Product } from '../../model/product';
import { OrderItem } from '../../model/orderItem';

const validProductTestData = {
    name: 'T-Shirt',
    price: 30.0,
    stock: 100,
    categories: ['Clothing', 'Men', 'Tops'],
    description: 'A comfortable cotton t-shirt',
    images: 'shirt',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Green'],
    rating: [1, 3, 5],
};

let product: Product;

let orderItem: OrderItem;

beforeEach(() => {
    product = new Product(validProductTestData);
    orderItem = new OrderItem({ product, quantity: 2 });
});

test('given: valid values for order item, when: order item is created, then: order item is created with those values', () => {
    expect(orderItem.getProduct()).toEqual(product);
    expect(orderItem.getQuantity()).toEqual(2);
    expect(orderItem.getProduct().getStock()).toEqual(98);
});

test('given: invalid product, when: order item is created, then: error is thrown.', () => {
    expect(() => new OrderItem({ product: null as any, quantity: 2 })).toThrow(
        'Product cannot be null or undefined.'
    );
});

test('given: invalid quantity, when: order item is created, then: error is thrown.', () => {
    expect(() => new OrderItem({ product, quantity: 0 })).toThrow(
        'Quantity must be greater than zero.'
    );
});

test('given: valid product and quantity, when: getTotalPrice is called, then: correct total price is returned', () => {
    const totalPrice = orderItem.getTotalPrice();
    expect(totalPrice).toEqual(product.getPrice() * 2);
});
