import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { fetchAsBuffer } from "./libs/fetch";
import { EXIFManager } from "./libs/EXIFManager";
import { formatMeta } from "./libs/formatMeta";
import { bytesToMegabytes, orThrow } from "./libs/utils";
import { BotError } from "./libs/BotError";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const FILE_SIZE_LIMIT_IN_MB = Number(process.env.FILE_SIZE_LIMIT_IN_MB) || 50;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is required.");
}

const bot = new Telegraf(BOT_TOKEN);

bot.start(async (context) => {
  console.log(`/start ${context.from.id}`);

  await context.reply("Hi. Please send me a document from which you wanna delete sensitive EXIF data.");
});

bot.on("photo", async (context) => {
  context.reply("A document, not a photo, please.");
});

bot.on("document", async (context) => {
  const document = context.message.document;
  const fileID = document.file_id;
  const fileSize = document.file_size ?? 0;
  const fileURL = await context.telegram.getFileLink(fileID);

  console.log(`/document from ${context.from.id}`);

  if (bytesToMegabytes(fileSize) > FILE_SIZE_LIMIT_IN_MB) {
    throw new BotError(`File is too large. Files larger than ${FILE_SIZE_LIMIT_IN_MB} MB are not currently supported.`);
  }

  const fileBuffer = await fetchAsBuffer(fileURL.href);
  const exifManager = new EXIFManager(fileBuffer);
  const meta = await orThrow(
    exifManager.getMeta.bind(exifManager),
    () => new BotError("Image format is not supported.")
  );

  const metaMessage = formatMeta(meta);
  const fileName = document.file_name ?? `unknown.${meta.format}`;

  await exifManager.removeMeta();
  const cleanFileBuffer = await exifManager.getBuffer();

  await context.reply(metaMessage);

  // TODO: context.sendLocation()

  await context.sendDocument({
    source: cleanFileBuffer,
    filename: fileName
  });
});

bot.catch(async (error, context) => {
  console.error(error);

  try {
    if (error instanceof BotError) {
      await context.reply(error.toString());
    } else {
      await context.reply("Something went wrong. Please, try later.");
    }
  } catch (error) {
    console.error(error);
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
