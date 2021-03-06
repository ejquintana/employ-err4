import passport from 'passport';
import keys from './keys.js';
import Users from '../models/Users.js';

const LinkedinStrategy = require('passport-linkedin-oauth2').Strategy;



passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {	
	Users.findById(id)
		.then((user) => done(null, user));
});


passport.use(new LinkedinStrategy({
	clientID: process.env.CLIENT_ID || keys.linkedIn.clientID,
	clientSecret: process.env.CLIENT_SECRET || keys.linkedIn.clientSecret,
	callbackURL: process.env.CALLBACK_URL || "http://localhost:8080/auth/linkedin/callback",
	}, (accessToken, refreshToken, profile, done) => {
		Users.findOne({linkedInId: profile.id})
			.then((result) => {
			if (result) {
				return done(null, result);
			} else if (result === null) {
				// create a new user in our db 
				new Users({
					linkedInId: profile.id, 
			        displayName: profile.displayName || "J-Wow", 
			        image: profile._json.pictureUrls.values[0] || "https://tinyurl.com/ybgx3yx8", 
			        title: profile._json.headline || "Insert headline here...", 
			        bio: profile._json.summary || "Insert Bio Here...", 
			        email: "", 
			        website: "", 
			        matches: [], 
			        connections: [], 
			        denied: [],
			        type: '',
			        searchable: '',
			        skills: [],
			        desiredSkills: []
				}).save().then((newUser) => {
					return done(null, newUser);
				})
			}
		})		
	})
);

