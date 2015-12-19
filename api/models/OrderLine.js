module.exports = {

    attributes: {

        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        slug: {
            type: 'string',
            unique: true
        },
        price: {
            type: 'float'
        },
        shipping: {
            type: 'float'
        },
        option: {
            'type': 'string'
        },
        quantity: {
            type: 'int'
        },
        images: { type: 'array'},
        productId: {
            type: 'string'
        },
        order: {
            model: 'Order'
        }
    }
};
