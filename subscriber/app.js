'use strict'

const express = require('express')
const app = express()
const google = require('googleapis')
const youtube = google.youtube({ version: 'v3', auth: process.env.YT_API_KEY })
const Promise = require('bluebird')
const request = require('request')

app.post('/subscription', function (req, res) {
  const getChannel = Promise.promisify(youtube.channels.list)
  let idLookup = getChannel({ part: 'snippet', id: (req.query['id_or_username']) })
  let usernameLookup = getChannel({ part: 'snippet', forUsername: (req.query['id_or_username']) })
  if(!req.query['slack_channel_id']) return res.status(200).json({ code: 'no_slack_channel', details: 'No Slack channel ID provided' })

  Promise.all([idLookup, usernameLookup]).spread((idChannels, usernameChannels) => {
    let channels = idChannels.items.concat(usernameChannels.items)

    if(channels.length) {
      request.post('https://pubsubhubbub.appspot.com/subscribe', { form: {
        'hub.mode': (req.query.unsubscribe ? 'unsubscribe' : 'subscribe'),
        'hub.callback': `${ process.env.NOTIFIER_SERVICE_URL }/video?slack_channel_id=${ req.query['slack_channel_id'] }`,
        'hub.topic': 'https://www.youtube.com/xml/feeds/videos.xml?channel_id=' + channels[0].id,
        'hub.lease_seconds': '604800'
      } }, (error, pubSubResponse) => {
        if (!error && pubSubResponse.statusCode == 202) {
          res.status(200).json({ code: 'channel_subscribed', details: "Subscribed/unsubscribed succesfully to https://www.youtube.com/channel/" + channels[0].id })      
        } else {
          res.status(500).json({ code: 'subscription_failed', details: "An error occured while connecting to Google's PubSubHubbub Hub", error })
        }
      })
    } else {
      res.status(404).json({ code: 'channel_not_found', details: "Couldn't find a channel with that ID or username" })
    }
  }).catch(error => {
    res.status(500).json({ code: 'subscription_failed', details: "An error occured while connecting to the YouTube API", error })
  })
})

module.exports = app