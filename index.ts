/* eslint-disable no-await-in-loop */
import { GeneralTrace, TraceType } from '@voiceflow/general-types';
import { AxiosResponse } from 'axios';
import { Context, Telegraf } from 'telegraf';

import DialogManagerApi from './dialog-manager-api';
import DialogManagerBody from './types';

require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN!);

const response = async (ctx: Context, VFctx: AxiosResponse<GeneralTrace[]>) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const trace of Object.values(VFctx)) {
    if (trace.type === TraceType.SPEAK && trace.payload.src !== null && trace.payload.src !== undefined) {
      console.log(JSON.stringify(trace.payload));
      await ctx.replyWithAudio(trace.payload.src!);
      continue;
    }
    if (trace.type === TraceType.SPEAK) {
      await ctx.reply(trace.payload.message);
      continue;
    }
    if (trace.type === TraceType.VISUAL && trace.payload.visualType === 'image') {
      await ctx.replyWithPhoto(trace.payload.image!);
      continue;
    }
  }
};

const getClient = async (ctx: Context) => {
  return DialogManagerApi.getInstance(
    process.env.VOICEFLOW_RUNTIME_ENDPOINT!,
    process.env.VOICEFLOW_API_KEY!,
    process.env.VOICEFLOW_VERSION_ID!,
    ctx.message!.from.id.toString()
  );
};

bot.start(async (ctx) => {
  const client = await getClient(ctx);
  const body: DialogManagerBody = {
    request: {
      type: 'launch',
    },
  };
  const context = await client.doInteraction(body);
  await response(ctx, context);
});

const ANY_WORD_REGEX = new RegExp(/(.+)/i);
bot.hears(ANY_WORD_REGEX, async (ctx) => {
  const client = await getClient(ctx);
  const body: DialogManagerBody = {
    request: {
      type: 'text',
      payload: ctx.message.text,
    },
  };
  const context = await client.doInteraction(body);
  await response(ctx, context);
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
