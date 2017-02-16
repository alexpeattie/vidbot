# Vidbot
###### A mashup of Slack RTM, YouTube and Google PubSubHubbub

<p align="center"><img width="643" src="https://cloud.githubusercontent.com/assets/636814/23024800/96ebcafa-f453-11e6-86ba-fd501b4b2b82.png"></p>

Vidbot connects YouTube push notifications with your Slack team using a combination of the [YouTube Push Notifications API](https://developers.google.com/youtube/v3/guides/push_notifications), the [YouTube Data API v3](https://developers.google.com/youtube/v3/) and the [Slack Real Time Messaging API](https://api.slack.com/rtm). Subscriptions are managed by sending text commands to Vidbot on Slack.

<p align="center"><img width="500" src="https://cloud.githubusercontent.com/assets/636814/23025295/66be1e3a-f455-11e6-9faa-74fdabfebf8b.png"></p>

## Contents

  * [Installation](#installation)
    * [Installing the subscriber and notifier microservices](#installing-the-subscriber-and-notifier microservices)
    * [Installing the Slack chatbot](#installing-the-slack-chatbot)
    * [Configuring the microservices](#configuring-the-microservices)
  * [Usage](#usage)
  * [Dependencies](#dependencies)
  * [License](#license)
  * [Author](#author)

## Installation

#### Installing the subscriber and notifier microservices

First, we need to install the subscriber and notifier microservices. Follow the steps in **both** the `subscriber/` and `notifier/` directories.

##### 1. Install the npm dependencies

```
npm install
```

##### 2. Deploy to AWS Lambda with [Claudia.js](https://claudiajs.com/)

Ensure your AWS credentials are stored in `~/.aws/credentials` (see [here](https://aws.amazon.com/blogs/security/a-new-and-standardized-way-to-manage-credentials-in-the-aws-sdks/) for more info).

Deploy to Lambda by running:

```
claudia create --handler lambda.handler --deploy-proxy-api --region us-east-1
```

(You can customise the region as needed.)

You should see an output like this:

```json
{
  "FunctionName": "slackyoutube-subscriber",
  "FunctionArn": "arn:aws:lambda:us-east-1:930066526813:function:slackyoutube-subscriber:2",
  "Runtime": "nodejs4.3",
  "Role": "arn:aws:iam::930066526813:role/slackyoutube-subscriber-executor",
  "Handler": "lambda.handler",
  "CodeSize": 3654028,
  "Description": "YouTube Slack subscriber microservice",
  "Timeout": 10,
  "MemorySize": 128,
  "LastModified": "2017-02-15T19:27:16.459+0000",
  "CodeSha256": "IB/7cWA0aIOHx0mkpXfFwK7/0iqoElpF47k4Ls/1gHU=",
  "Version": "2",
  "VpcConfig": {
    "SubnetIds": [],
    "SecurityGroupIds": [],
    "VpcId": null
  },
  "KMSKeyArn": null,
  "url": "https://ot3nt0vg0h.execute-api.us-east-1.amazonaws.com/latest"
}
```

Make a note of the `url` above.

#### Installing the Slack chatbot

You can host the chatbot on any platform that supports Node + websockets, but BeepBoop is pre-configured to work "out of the box".

##### 1. Signup to BeebBoop

At https://beepboophq.com/. The free plan works fine :grin:!

##### 2. Push the `slackbot/` directory to a separate repository

BeebBoop needs the root directory of the chatbot to be its own repository. You can grab just the chatbot part of the app here: https://github.com/alexpeattie/slackyoutube-slackbot

##### 3. Install the bot

Create a New Project on BeebBoop and follow the prompts.

<p align="center"><img width="500" src="https://cloud.githubusercontent.com/assets/636814/23025956/87a93cb8-f457-11e6-9f04-adb6499aef7c.png"></p>

##### 4. Configure the bot

Set the `SUBSCRIBER_SERVICE_URL` config variable to the `url` value you took from Claudia.js's output above when deploying the subscriber microservice.

#### Configuring the microservices

Lastly, you'll need to add the following environment variables to the microservices on Lamdba. Add environment variables from *Functions* → *your-function* → *Code*.

###### Subscriber microservice

- `YT_API_KEY` - API key to access the YouTube Data API v3
- `NOTIFIER_SERVICE_URL` - The URL of your notifier microservice

###### Subscriber microservice

- `BEEPBOOP_ID` - The project ID of your BeebBoop project (shown in pink below)

<p align="center"><img width="500" src="https://cloud.githubusercontent.com/assets/636814/23026508/5e800c70-f459-11e6-8961-6c117deb318b.png"></p>

## Usage

You can ask the bot to setup a subscription by saying:

> @vidbot subscribe to zoella280390

"zoella280390" can be replaced with any YouTube username or channel UID (e.g. UCWRV5AVOlKJR1Flvgt310Cw). Vanity URLs currently aren't supported. Notifications will be sent to the channel from which you ping @vidbot.

You can unsubscribe by saying:

> @vidbot unsubscribe from zoella280390

## Dependencies

The project makes use of the following dependencies:

- [Botkit](https://github.com/howdyai/botkit) - used to build the Slack chatbot
- [Express.js](https://github.com/expressjs/express) - to provide the HTTP interfaces for the services
- [Claudia.js](https://github.com/claudiajs/claudia) - for easy deployment to Lambda
- [aws-serverless-express](https://github.com/awslabs/aws-serverless-express) - to expose the Express endpoints to Lambda
- [Docker](https://github.com/docker/docker) - for packaging the chatbot for deployment to BeepBoop
- [Google APIs Node.js Client](https://github.com/google/google-api-nodejs-client) - for connecting to the YouTube Data API
- [Bluebird](https://github.com/petkaantonov/bluebird) - for "promisifying" Google API calls
- [request](https://github.com/request/request) - for passing requests between services, and setting up PubSubHubbub subscriptions
- [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) and [body-parser](https://github.com/expressjs/body-parser) - to parse the the XML feed updates (from push notifications)
- [moment](https://github.com/moment/moment) - to calculate the difference between published time and updated time (used to decide if the change is a new or updated video)

## License

Nitlink is released under the MIT license. (See [License.md](./License.md))

## Author

Alex Peattie / [alexpeattie.com](https://alexpeattie.com/) / [@alexpeattie](https://twitter.com/alexpeattie) 