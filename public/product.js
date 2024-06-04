const { Router } = require('express');
const Product = require('../database/schema/product');
const User = require('../database/schema/user');
const router = Router();

router.get("/", async (request, response) =>{
    try {
        const products = await Product.find();// Query to get all product from the database
        if (products.length === 0) {
            return response.status(404).send({ message: "No products available" });
        }
        response.status(200).send(products); // Send the list of product as the response
    } catch (error) {
        response.status(500).send({ message: "Error fetching users", error: error.message });
    }
});

// get product by id
router.get('/:id', async (request, response) => {
    const { id } = request.params;

    try {
        const productDB = await Product.findById(id);
     
        response.status(200).send(productDB);
    } catch (error) {
        console.error('Error finding product:', error);
        response.status(500).send({ msg: 'Error finding product', error: error.message });
    }
});

// Authentication
router.use((req, res, next)=>{
    if(req.user) next();
    else res.send(401);
});


// Create a new product in the database
router.post('/', async (request, response) => { // Changed route to avoid conflict
    const { product_name, product_description, product_price, product_tag } = request.body;
    const product_owner_id = request.user;
    try {
        // Check if the product already exists
        const prodDB = await Product.findOne({ product_name });

        if (prodDB) {
            return response.status(400).send({ msg: 'Product already exists!' });
        } else {
            // Create a new product
            const newProduct = new Product({
                product_name,
                product_description,
                product_price,
                product_tag,
                product_owner_id
            });

            // Save the product to the database
            await newProduct.save();

            // Send a success response
            return response.status(201).send({ msg: 'Product added successfully', product: newProduct });
        }
    } catch (error) {
        console.error('Error creating product:', error);
        return response.status(500).send({ msg: 'Error creating product', error: error.message });
    }
});

// UPDATE

// Update product information
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user;
    const { product_name, product_description, product_price, product_tag } = req.body;

    try {
        // Find the product by ID
        const product = await Product.findById(id);

        // Check if the product exists
        if (!product) {
            return res.status(404).send({ msg: 'Product not found' });
        }

        // Check if the user is authorized to update the product
        if (product.product_owner_id.toString() !== userId.toString()) {
            console.log('User ID mismatch:', product.product_owner_id.toString(), userId.toString());
            return res.status(403).send({ msg: 'You are not authorized to update this product' });
        }

        // Define the updated data
        const updatedData = {
            product_name,
            product_description,
            product_price,
            product_tag
        };

        // Find the product by ID and update its fields with the updated data
        const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        // Check if the product exists
        if (!updatedProduct) {
            return res.status(404).send({ msg: 'Product not found' });
        }
   
        // Return the updated product
        res.status(200).send(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send({ msg: 'Error updating product', error: error.message });
    }
});


// DELETE

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user; // Use req.user directly to get the user ID

    try {
        // Find the product by ID
        const product = await Product.findById(id);

        // Check if the product exists
        if (!product) {
            return res.status(404).send({ msg: 'Product not found' });
        }

        // Check if the user is authorized to delete the product
        if (product.product_owner_id.toString() !== userId.toString()) {
            console.log('User ID mismatch:', product.product_owner_id.toString(), userId.toString());
            return res.status(403).send({ msg: 'You are not authorized to delete this product' });
        }

        // Delete the product
        await Product.findByIdAndDelete(id);

        // Return a success message
        res.status(200).send({ msg: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send({ msg: 'Error deleting product', error: error.message });
    }
});


module.exports = router;