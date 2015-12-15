module.exports = {

    tableName: 'cart',

    attributes: {

        qty: {
            type: 'int'
        },
        session: {
            type: 'string'
        },
        product: {
            model: 'Product'
        },
        option: {
            type: 'string'
        }
        toJSON: function() {
            var obj = this.toObject();
            delete obj.session;
            return obj;
        }
    }
   
}
