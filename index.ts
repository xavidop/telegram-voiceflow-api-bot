/* eslint-disable no-await-in-loop */
import RuntimeClientFactory, { Context as VFContext, TraceType } from '@voiceflow/runtime-client-js';
import { Context, Telegraf } from 'telegraf';

import kvstore from './store';

require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN!);

const factory = new RuntimeClientFactory({
  versionID: process.env.VOICEFLOW_VERSION_ID!, // voiceflow project versionID
  apiKey: process.env.VOICEFLOW_API_KEY!, // voiceflow api key
  endpoint: process.env.VOICEFLOW_RUNTIME_ENDPOINT,
});

const response = async (ctx: Context, VFctx: VFContext) => {
  const senderID = ctx.message!.from.id.toString();
  await kvstore.set(senderID, VFctx.toJSON().state);

  // eslint-disable-next-line no-restricted-syntax
  for (const trace of VFctx.getTrace()) {
    if (trace.type === TraceType.SPEAK) {
      await ctx.reply(trace.payload.message);
    }
    if (trace.type === TraceType.VISUAL && trace.payload.visualType === 'image') {
      await ctx.replyWithPhoto(trace.payload.image!);
    }
    if (trace.type === TraceType.AUDIO) {
      console.log(JSON.stringify(trace.payload));
      await ctx.replyWithAudio(trace.payload.src!);
    }
  }
};

const getClient = async (ctx: Context) => {
  const senderID = ctx.message!.from.id.toString();
  const state = await kvstore.get(senderID);
  return factory.createClient(state);
};

bot.start(async (ctx) => {
  const client = await getClient(ctx);
  const context = await client.start();
  await response(ctx, context);
});

const ANY_WORD_REGEX = new RegExp(/(.+)/i);
bot.hears(ANY_WORD_REGEX, async (ctx) => {
  const client = await getClient(ctx);
  const context = await client.sendText(ctx.message.text);
  await response(ctx, context);
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
