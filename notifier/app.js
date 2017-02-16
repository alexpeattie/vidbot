'use strict'

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const xml2js = require('xml2js')
const xmlParser = new xml2js.Parser({ explicitArray: false })
const moment = require('moment')
const request = require('request')

app.use(bodyParser.text({ type: 'application/atom+xml' }))

app.get('/video', function (req, res) {
  res.status(200).send(req.query['hub.challenge'])
})

app.post('/video', function (req, res) {
  xmlParser.parseString(req.body, (error, result) => {
    if(error) {
      res.status(422).json({ code: 'xml_parse_error', details: "Something went wrong while parsing the XML", error })      
    } else {
      let vid = result.feed.entry
      let publishUpdateDifference = moment.duration(moment(vid.updated).diff(vid.published)).asSeconds()
      let type = (publishUpdateDifference > 300) ? 'updated' : 'published'

      request.post(`https://beepboophq.com/proxy/${ process.env.BEEPBOOP_ID }/video`, { json: {
        title: vid.title,
        username: vid.author.name,
        id: vid['yt:videoId'],
        slack_channel_id: req.query.slack_channel_id,
        type
      } }, (error, notifyResp) => {
        if (!error && notifyResp.statusCode == 200) {
          res.status(200).json({ code: 'notification_sent', details: 'Successfully sent video notification' })      
        } else {
          res.status(500).json({ code: 'notification_failed', details: 'An error occurred when communicating with the Slack chatbot', error })
        }
      })
    }
  })
})

module.exports = app