module.exports = {

    tableName: 'orders',

    attributes: {

        status: {
            type: 'int',
            // 0 = canceled, 1 = pending_of_payment, 2 = pending, 3 = shipped, 4 = complete
            enum: [0, 1, 2, 3, 4]
        },
        shippingAddress: {
            type: 'json',
            notEmpty: true
        },
        user: {
            model: 'User'
        },
        products: {
            collection: 'OrderLine',
            via: 'order'
        },
        comments: {
            type: 'string'
            defaultsTo: ''
        },
        amount: {
            type: 'float',
            defaultsTo: 0.0
        },
        tax: {
            type: 'float',
            defaultsTo: 21
        }
    }
}
