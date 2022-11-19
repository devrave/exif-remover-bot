import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { fetchAsBuffer } from "./libs/fetch";
import { EXIFRemover } from "./libs/EXIFRemover";
import { formatMeta } from "./libs/MetaFormatter";
import { bytesToMegabytes } from "./libs/utils";
import { BotError } from "./libs/BotError";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const FILE_SIZE_LIMIT_IN_MB = Number(process.env.FILE_SIZE_LIMIT_IN_MB) || 50;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is required.");
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply("Hi. Please send me a document from which you wanna delete sensitive EXIF data."));

bot.on("photo", async (context) => {
  context.reply("A document, not a photo, please.");
});

bot.on("document", async (context) => {
  const document = context.message.document;
  const fileID = document.file_id;
  const fileSize = document.file_size ?? 0;
  const fileURL = await context.telegram.getFileLink(fileID);

  if (bytesToMegabytes(fileSize) > FILE_SIZE_LIMIT_IN_MB) {
    throw new BotError(`File is too large. Files larger than ${FILE_SIZE_LIMIT_IN_MB} MB are not currently supported.`);
  }

  const fileBuffer = await fetchAsBuffer(fileURL.href);
  const exifRemover = new EXIFRemover(fileBuffer);
  const meta = await exifRemover.getMeta();

  const metaMessage = formatMeta(meta);
  const fileName = document.file_name ?? `unknown.${meta.format}`;

  await exifRemover.removeMeta();
  const cleanFileBuffer = await exifRemover.getBuffer();

  await context.reply(metaMessage);

  // TODO: context.sendLocation()

  await context.sendDocument({
    source: cleanFileBuffer,
    filename: fileName
  });
});

bot.catch(async (error, context) => {
  console.error(error);

  if (error instanceof BotError) {
    await context.reply(error.toString());
  } else {
    await context.reply("Something went wrong. Please, try later.");
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
