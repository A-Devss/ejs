const passport = require('passport');
const { Strategy } = require('passport-local');
const User = require('../database/schema/user');
const { comparePassword } = require('../utils/helper');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser( async (id, done) => {
    console.log(id);
    try {
        const user = await User.findById(id);
        if(!user) throw new Error('User not found');
        const userId = user._id; // Extract the user ID
        done(null, userId);
    } catch (error) {
        done(null, error);
    }
});

passport.use(
    new Strategy(
        {
            usernameField: 'email',
        }, async (email, password, done) => {
           try {

                if(!email || !password){
                    done(new Error('Bad Reques. Missing Credentials'), null);
                }
                const userDB = await User.findOne({ email });

                if(!userDB){
                    throw new Error('User not found');
                }
                const isValid = comparePassword(password, userDB.password);
                if(isValid){
                    console.log('Auhenticated successfully');
                    done(null, userDB);
                }else{
                    console.log('Invalid Authenication');
                    done(null, null);
                }
           } catch (error) {
                done(error, null);
           }
        }
  
    ));