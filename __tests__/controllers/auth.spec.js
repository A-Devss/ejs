const { registerController, updateUser } = require('../../controllers/auth');
const User = require('../../database/schema/user');
const { hashPassword } = require('../../utils/helper');
// Mocking response object
const response = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
};

const request = {
    body: {
        email: 'fake_email',
        password: 'fake_password',
        password_confirmation: 'fake_password', // Include password_confirmation
    },
};


jest.mock('../../database/schema/user'); // Mock the User model
jest.mock('../../utils/helper');


it('should send a status code of 400 when user exists', async () => {
    // Mock the findOne method to simulate an existing user
    User.findOne.mockResolvedValue({ email: 'fake_email' });

    await registerController(request, response);

    // Check that the response status was set to 400 and the correct message was sent
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.send).toHaveBeenCalledWith({ msg: 'User already exists!' });
});


describe('updateUser', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: 'userId' },
            user: 'userId',
            body: {
                email: 'new_email@example.com',
                password: 'new_password',
                password_confirmation: 'new_password',
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        User.findById.mockReset();
        User.findByIdAndUpdate.mockReset();
        hashPassword.mockReset();
    });

    it('should return 403 if password and password confirmation do not match', async () => {
        req.body.password_confirmation = 'different_password';

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Password mismatch' });
    });

    it('should return 403 if user is not authorized to update', async () => {
        const mockUser = { _id: 'differentUserId' }; // Mocking a different user ID
        User.findById.mockResolvedValue(mockUser);

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith({ msg: 'You are not authorized to update this user' });
    });

    it('should return 404 if user is not found', async () => {
        User.findById.mockResolvedValue(null);

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ msg: 'User not found' });
    });

    it('should return 200 and the updated user on successful update', async () => {
        const mockUser = { _id: 'userId' };
        const updatedUser = { _id: 'userId', email: 'new_email@example.com', password: 'hashed_password' };

        User.findById.mockResolvedValue(mockUser);
        User.findByIdAndUpdate.mockResolvedValue(updatedUser);
        hashPassword.mockImplementation((password) => `hashed_${password}`);

        await updateUser(req, res);

        expect(User.findById).toHaveBeenCalledWith('userId');
        expect(hashPassword).toHaveBeenCalledWith('new_password');
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith('userId', { email: 'new_email@example.com', password: 'hashed_new_password', password_confirmation: 'hashed_new_password' }, { new: true, runValidators: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(updatedUser);
    });

    it('should return 500 if there is an error during update', async () => {
        const errorMessage = 'Database error';
        User.findById.mockResolvedValue({ _id: 'userId' });
        User.findByIdAndUpdate.mockRejectedValue(new Error(errorMessage));

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Error updating user', error: errorMessage });
    });
});