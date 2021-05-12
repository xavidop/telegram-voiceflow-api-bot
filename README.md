![image](/images/landing.png)

<!-- TOC -->

- [Telegram Voiceflow Bot](#telegram-voiceflow-bot)
  - [Prerequisites](#prerequisites)
  - [Architecture](#architecture)
  - [Create own Bot with BotFather](#create-own-bot-with-botfather)
  - [Setting up the Project](#setting-up-the-project)
  - [Write bot’s code](#write-bots-code)
    - [Telegraf setup](#telegraf-setup)
    - [Voiceflow setup](#voiceflow-setup)
  - [Running the Telegram Bot](#running-the-telegram-bot)
  - [How to contribute?](#how-to-contribute)
  - [Resources](#resources)
  - [Conclusion](#conclusion)

<!-- /TOC -->

# Telegram Voiceflow Bot

Telegram is becoming one of the most important messaging applications. Telegram has a lot of useful functionalities. There we can create powerful bots that can help us in our daily routines. Since Telegram Bot has appeared, there were a lot of ways to create bots for this app but none of those ways are focused on conversational design and creating great conversational experiences. This is why Voiceflow becomes the perfect tool for prototyping, design and integrate a chatbot in Telegrams thanks to its [Runtime Client SDK](https://github.com/voiceflow/runtime-client-js). 

## Prerequisites

Here you have the technologies used in this project
1. Telegram account
2. Voiceflow Account
3. VS Code

## Architecture
In this example, we are going to use the Telegraf library for NodeJS projects to interact with our Telegram Bot. Moreover and as We mentioned above, every user interaction with the Telegram bot will be sent to Voiceflow using its Runtime Client SDK.

This is the architecture that is using this example:

![image](/images/architecture.png)

Explained the project, let's start coding!
## Create own Bot with BotFather

First, We should create our own bot with BotFather. BotFather is the one bot to rule them all. We will use it to create new bot accounts and manage your existing bots.

If you open a chat with a BotFather, click on the “Start” button.

We should create a new bot by clicking /newbot command. Next, you should enter any name for the bot. In this example, we named it Voiceflow Bot.

The Telegram setup is completed! Remember to add your Telegram token to your `.env` file in the property `TELEGRAM_TOKEN`

## Setting up the Project

Install and run the project:

1. Clone this repo:
```bash
git clone https://github.com/xavidop/teelgram-voiceflow-bot.git
```

2. Install dependencies:
```bash
yarn install
```

3. Launch project:
```bash
yarn start
```

## Write bot’s code

### Telegraf setup

We can create bot by the following code lines:
```js
const Telegraf = require('telegraf') // import telegram lib

const bot = new Telegraf(process.env.BOT_TOKEN) // get the token from envirenment variable
bot.start((ctx) => ctx.reply('Welcome')) // display Welcome text when we start bot
bot.hears('hi', (ctx) => ctx.reply('Hey there')) // listen and handle when user type hi text
bot.launch() // start
```

### Voiceflow setup

**NOTE:** Before continue, it is important to note that you should have a General Project created on Voiceflow.

Let's create the Voiceflow client to work with Voiceflow's cloud using its Runtime Client SDK:
```js
const getClient = async (ctx: Context) => {
  const senderID = ctx.message.from.id.toString();
  const state = await kvstore.get(senderID);
  return factory.createClient(state);
};
```

The `getclient()` function calls the `createClient` method of the factory object. This is the intialization of that factory object:
```typescript
const factory = new RuntimeClientFactory({
  versionID: process.env.VOICEFLOW_VERSION_ID, // voiceflow project versionID
  apiKey: process.env.VOICEFLOW_API_KEY!, // voiceflow api key
  endpoint: process.env.VOICEFLOW_RUNTIME_ENDPOINT,
});
```

As you can see there are some values that will be added to our `.env` file. Let's explain how to obtain those variables.

1. **VersionID**

To obtain your VersionID you have to go to your Voiceflow Project:

![image](/images/version-id.png)

Then copy the `VERSION_ID` from the URL in your address bar. When you are inside a Voiceflow project, your address bar should have a URL of the form: `https://creator.voiceflow.com/project/{VERSION_ID}/...`

2. **apiKey**
   
To obtain the API Key we have to go to our workspace where we have created our General Project. After this, we have to append to the URL `/api-keys`:

![image](/images/api-key-page.png)

Then we have to click to `Create new API Key` button to create a new one:

![image](/images/api-key-creation.png)

There you have to add a name to the new API Key, for example, `telegram-bot`. Once we have filled it, we can click the `Confirm` button:

![image](/images/api-key-list.png)

Finally, we have to add these variables to our final `.env` file. It should look like this:

```properties
TELEGRAM_TOKEN='<your-telegram-token>'
VOICEFLOW_VERSION_ID='<your-version-id>'
VOICEFLOW_API_KEY='<your-api-key>'
VOICEFLOW_RUNTIME_ENDPOINT='https://general-runtime.voiceflow.com'
```

Everything is ready. Let's continue with our Telegrom bot code. Let's replace the start starndard replay for this one, getting the correct replay from Voiceflow:

```typescript

bot.start(async (ctx) => {
  const client = await getClient(ctx);
  const context = await client.start();
  await response(ctx, context);
});

```

Then we replace the `hi` utterance for a regex like `(.+)`. This means that the bot will hear for everything. All the text recieved we will pass directly to Voiceflow and the we mange the state of the conversation: if it is ended or if it is not ended yet:

```typescript
const ANY_WORD_REGEX = new RegExp(/(.+)/i);
bot.hears(ANY_WORD_REGEX, async (ctx) => {
  const client = await getClient(ctx);
  const context = await client.sendText(ctx.message.text);
  await response(ctx, context);
});
```

The reponse method is in charge of sending the user input in telegram to Voiceflow using its runtime client SDK and process the response:

```typescript
const response = async (ctx: Context, VFctx: VFContext) => {
  const senderID = ctx.message.from.id.toString();
  await kvstore.set(senderID, VFctx.toJSON().state);

  // eslint-disable-next-line no-restricted-syntax
  for (const trace of VFctx.getTrace()) {
    if (trace.type === TraceType.SPEAK) {
      await ctx.reply(trace.payload.message);
    }
    if (trace.type === TraceType.VISUAL && trace.payload.visualType === 'image') {
      await ctx.replyWithPhoto(trace.payload.image);
    }
  }
};
```

As you noticed, there differents types of responses, in the example above we manage the `SPEAK`, `VISUAL` and `AUDIO` responses.

## Running the Telegram Bot

![image](/images/bot.png)

## How to contribute?

1. Fork this repo
2. Clone your fork
3. Code 🤓
4. Test your changes
5. Submit a PR!

## Resources
* [Official Telegraf Documentation](https://www.npmjs.com/package/ask-sdk) - The Official Telegraf Documentation
* [Official Voiceflow's Runtime Client SDK Documentation](https://github.com/voiceflow/runtime-client-js) - Official Voiceflow's Runtime Client SDK Documentation

## Conclusion 

As you can see with just 60 lines of code we have a Telegram bot connected to Voiceflow.

I hope this example project is useful to you.

That's all folks!

Happy coding!