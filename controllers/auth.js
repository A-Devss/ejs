const User = require('../database/schema/user');
const { hashPassword, comparePassword } = require('../utils/helper');


async function registerController (request, response) {
    const { email, password, password_confirmation } = request.body;
    const userDB = await User.findOne({ email });

    // Check if password and password confirmation match after hashing
    if (password !== password_confirmation) {
        return response.status(403).send({ msg: 'Password does not match' });
    }

    // Hash the password and password confirmation
    const hashed_password = hashPassword(password);
    const hashed_password_confirmation = hashPassword(password_confirmation);

    if (userDB) {
        return response.status(400).send({ msg: 'User already exists!' });
    } else {
        const newUser = await User.create({ email, password: hashed_password, password_confirmation: hashed_password_confirmation });
        return response.status(201).send({ msg: 'User registered successfully' });
    }
};

async function updateUser (req, res) {
    const { id } = req.params;
    const userId = req.user; // Use req.user directly to get the user ID

    const user = await User.findById(id);
    
    // Extract email and password from the request body
    const { email, password, password_confirmation } = req.body;

  

    // Check if password and password confirmation match
    if (password !== password_confirmation) {
        return res.status(403).send({ 
            msg: 'Password mismatch'
        });
    }

    const updatedData = {};

  
    if (email) {
        updatedData.email = email;
    }
    if (password) {
        // Hash the password before updating
        updatedData.password = hashPassword(password);
    }
    if (password_confirmation) {
        // Hash the password before updating
        updatedData.password_confirmation = hashPassword(password_confirmation);
    }

      // Check if the user is authorized to update their own data
    if (user._id.toString() !== userId.toString()) {
        console.log('User ID mismatch:', user._id.toString(), userId.toString());
        return res.status(403).send({ msg: 'You are not authorized to update this user'});
    }

    try {
        // Find the user by ID and update its fields with the updated data
        const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        // Check if the user exists
        if (!updatedUser) {
            return res.status(404).send({ msg: 'User not found' });
        }

        // Return the updated user
        res.status(200).send(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ msg: 'Error updating user', error: error.message });
    }
};

module.exports = { registerController,  updateUser}; // Correct export