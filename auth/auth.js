const { Router } = require('express');
const passport = require('passport');
const {registerController, updateUser} = require('../controllers/auth');
const User = require('../database/schema/user');
const { hashPassword, comparePassword } = require('../utils/helper');

const router = Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
    console.log('loggedin')
    res.send(200);
});

// Register
router.post('/register', registerController);



router.use((req, res, next)=>{
    if(req.user) next();
    else res.send(401);
});

router.get("/", async (req, res) => {
    try {
        const users = await User.find();// Query to get all users from the database
        res.status(200).send(users); // Send the list of users as the response
    } catch (error) {
        res.status(500).send({ message: "Error fetching users", error: error.message });
    }
});


// view

router.get('/:id', async(req, res) => {
    const { id } = req.params;
    const users = await User.findById(id);// Query to get all users from the database
    res.status(200).send(users); 
});


// Update user information
router.patch('/:id', updateUser);

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user; // Use req.user directly to get the user ID

    try {
        // Find the user by ID
        const user = await User.findById(id);

        // Check if the user exists
        if (!user) {
            return res.status(404).send({ msg: 'User not found' });
        }

        // Check if the user is authorized to delete their own data
        if (user._id.toString() !== userId.toString()) {
            console.log('User ID mismatch:', user._id.toString(), userId.toString());
            return res.status(403).send({ msg: 'You are not authorized to delete this user'});
        }

        // Delete the user
        const deletedUser = await User.findByIdAndDelete(id);

        // Return a success message
        res.status(200).send({ msg: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ msg: 'Error deleting user', error: error.message });
    }
});



module.exports = router;