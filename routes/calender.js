const { Router } = require("express");
const { google } = require("googleapis");
const axios = require("axios");
const router = Router();
const User = require("../models/User");
const oauth2client = new google.auth.OAuth2(
  process.env.GCLIENT_ID,
  process.env.GCLIENT_SECRET,
  process.env.CLIENT_URL
);
const getevents = async (token) => {
  try {
    oauth2client.setCredentials({ refresh_token: token });
    const calendar = google.calendar("v3");
    const response = await calendar.events.list({
      auth: oauth2client,
      calendarId: "primary",
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
router.post("/generatetoken", async (req, res, next) => {
  try {
    const { code } = req.body;
    const response = await oauth2client.getToken(code);
    let email = "";
    const resp = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${response.tokens.id_token}`
    );
    email = resp.data.email;
    if (response.tokens.refresh_token) {
      var new_user = new User({
        email: email,
        refreshToken: response.tokens.refresh_token,
      });
      await new_user.save(function (err, result) {
        if (err) {
          console.log(err);
        } else {
          getevents(response.tokens.refresh_token).then((resp) =>
            res.send(resp.data)
          );
        }
      });
    } else {
      User.findOne({
        email,
      }).exec(async (err, user) => {
        if (user) {
          getevents(user.refreshToken).then((resp) => res.send(resp.data));
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
