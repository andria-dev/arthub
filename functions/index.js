// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions')

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin')
admin.initializeApp()

// Used to get profile photo from an email
const gravatar = require('gravatar')
const got = require('got')
const cors = require('cors')({origin: true})

exports.gravatar = functions.https.onRequest((req, res) => {
	cors(req, res, async () => {
		const {email} = req.query
		if (!email) return res.status(422).json('Missing email parameter')

		const profileURL = gravatar.profile_url(email)

		try {
			const {body} = await got.get(profileURL, {responseType: 'json'})
			const photoURL = body.entry[0].thumbnailUrl
			try {
				const response = await got.get(photoURL)
				res
					.status(200)
					.header('Content-Type', 'img/jpeg')
					.header('Content-Length', response.rawBody.length)
					.send(response.rawBody)
			} catch (error) {
					console.log(error)
				res.status(500).end()
			}
		} catch (error) {
			if (error && error.response && error.response.statusCode === 404)
				res.status(404).json('No matching profile photo')
			else res.status(500).end()
		}
	})
})
