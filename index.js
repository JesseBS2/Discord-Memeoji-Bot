const Discord = require("discord.js");
const Config = require("./config.json");
const colors = require("colors");
const fs = require("fs");
const { APIMessage, Structures } = require("discord.js");


var bot = new Discord.Client();
var memes = require("./memeages.json");
var emojis = require("./emojimages.json");

bot.login(fs.readFileSync("./token.txt", "utf8").toString());

bot.on("ready", () => {
  console.log("Memeoji Bot V2".magenta);
  console.log("\n" + "[Now Online]".black.bgGreen);

  bot.user.setPresence({
    status: "idle",
    activity: {
      name: "?help",
      type: "PLAYING"
    }
  });
});

bot.on("guildCreate", guild => {
  ReloadServerEmojis(guild);
});

bot.on("guildDelete", peasants => {
  let RemovedEmojis = 0;

  peasants.emojis.cache.forEach(item => {
    if (Object.values(emojis).indexOf(`<:${item.name}:${item.id}>`) > -1) {
      //console.log("[Testing]".black.bgYellow, Object.values(emojis).indexOf(`<:${item.name}:${item.id}>`), emojis[Object.keys(emojis)[Object.values(emojis).indexOf(`<:${item.name}:${item.id}>`)]]);
      delete emojis[
        Object.keys(emojis)[
          Object.values(emojis).indexOf(`<:${item.name}:${item.id}>`)
        ]
      ];
      RemovedEmojis++;
    } else if (
      Object.values(emojis).indexOf(`<a:${item.name}:${item.id}>`) > -1
    ) {
      //console.log("[Testing]".black.bgYellow, Object.values(emojis).indexOf(`<:${item.name}:${item.id}>`), emojis[Object.keys(emojis)[Object.values(emojis).indexOf(`<:${item.name}:${item.id}>`)]]);
      delete emojis[
        Object.keys(emojis)[
          Object.values(emojis).indexOf(`<a:${item.name}:${item.id}>`)
        ]
      ];
      RemovedEmojis++;
    }
  });

  SaveJSON(1);

  return console.log(
    `[Removed from Server] <${peasants.name}/${peasants.id}>`.cyan,
    `Removed ${RemovedEmojis.toString().yellow} from emojimages.json`
  );
});

bot.on("emojiCreate", newemoji => {
  var AnimatedStart = "";
  if (newemoji.animated === true) AnimatedStart = "a";

  if (
    newemoji.name in emojis &&
    emojis[newemoji.name] ==
      `<${AnimatedStart}:${newemoji.name}:${newemoji.id}>`
  ) {
    return; // pretty sure this check will never be true but... eh
  } else if (
    newemoji.name in emojis &&
    emojis[newemoji.name] !=
      `<${AnimatedStart}:${newemoji.name}:${newemoji.id}>`
  ) {
    for (let keepGoing = 1; keepGoing < 420; keepGoing++) {
      if (!(newemoji.name + keepGoing.toString() in emojis)) {
        emojis[
          newemoji.name + keepGoing.toString()
        ] = `<${AnimatedStart}:${newemoji.name}:${newemoji.id}>`;
        break;
      }
    }
  } else {
    emojis[
      newemoji.name
    ] = `<${AnimatedStart}:${newemoji.name}:${newemoji.id}>`;
  }

  SaveJSON(1);
  return console.log(
    "[New Emoji]".bgMagenta,
    `<${newemoji.guild.name}/${newemoji.guild.id}>`.cyan,
    `Added :${newemoji.name.toString().yellow}: ${
      newemoji.id.toString().yellow
    } to emojimages.json`
  );
});



bot.on("emojiUpdate", (emojiold, emojiupd) => {
  var AnimatedStart = "";
  if (emojiold.animated && emojiupd.animated) AnimatedStart = "a";

  if (
    emojiold.name in emojis &&
    emojis[emojiold.name] ==
      `<${AnimatedStart}:${emojiold.name}:${emojiold.id}>`
  ) {
    //console.log("[Testing]".bgYellow.white, "Case 1: Emoji is already in json and has same value");
    delete emojis[
      Object.keys(emojis)[
        Object.values(emojis).indexOf(
          `<${AnimatedStart}:${emojiold.name}:${emojiold.id}>`
        )
      ]
    ];
    emojis[
      emojiupd.name
    ] = `<${AnimatedStart}:${emojiupd.name}:${emojiupd.id}>`;
  } else if (
    emojiold.name in emojis &&
    emojis[emojiold.name] !=
      `<${AnimatedStart}:${emojiold.name}:${emojiold.id}>`
  ) {
    //console.log("[Testing]".bgYellow.white, "Case 2: emoji name is in json but is different emoji");
    for (let keepGoing = 1; keepGoing < 420; keepGoing++) {
      if (
        emojis[emojiold.name + keepGoing.toString()] ==
        `<${AnimatedStart}:${emojiold.name}:${emojiold.id}>`
      ) {
        delete emojis[emojiold.name + keepGoing.toString()];
        break;
      }
    }
  } else if (!(emojiold.name in emojis)) {
    if (
      emojiupd.name in emojis &&
      emojis[emojiupd.name] ==
        `<${AnimatedStart}:${emojiupd.name}:${emojiupd.id}>`
    ) {
      //console.log("[Testing]".bgYellow.white, "Case 3-1: New name is in json and already has correct value");
      return; // this one should also never pass
    } else if (
      emojiupd.name in emojis &&
      emojis[emojiupd.name] !=
        `<${AnimatedStart}:${emojiupd.name}:${emojiupd.id}>`
    ) {
      //console.log("[Testing]".bgYellow.white, "Case 3-2: New name is already in json and has other value");
      for (let keepGoing = 1; keepGoing < 420; keepGoing++) {
        if (!(emojiupd.name + keepGoing.toString() in emojis)) {
          emojis[
            emojiupd.name + keepGoing.toString()
          ] = `<${AnimatedStart}:${emojiupd.name}:${emojiupd.id}>`;
          break;
        }
      }
    } else {
      //console.log("[Testing]".bgYellow.white, "Case 3-3: Emoji is not in json");
      emojis[
        emojiupd.name
      ] = `<${AnimatedStart}:${emojiupd.name}:${emojiupd.id}>`;
      console.log(
        "[New Emoji]".bgMagenta,
        `<${emojiupd.guild.name}/${emojiupd.guild.id}>`.cyan,
        `Added :${emojiupd.name.toString().yellow}: ${
          emojiupd.id.toString().yellow
        } to emojimages.json`
      );
    }
  }

  SaveJSON(1);
  return console.log(
    "[Updated Emoji]".bgYellow,
    `<${emojiupd.guild.name}/${emojiupd.guild.id}>`.cyan,
    `Changed :${emojiold.name.toString().yellow}: to :${
      emojiupd.name.toString().yellow
    }:`
  );
});



bot.on("emojiDelete", ripEmoji => {
  var AnimatedStart = "";
  if (ripEmoji.animated === true) AnimatedStart = "a";

  if (
    Object.values(emojis).indexOf(
      `<${AnimatedStart}:${ripEmoji.name}:${ripEmoji.id}>`
    ) > -1
  ) {
    delete emojis[
      Object.keys(emojis)[
        Object.values(emojis).indexOf(
          `<${AnimatedStart}:${ripEmoji.name}:${ripEmoji.id}>`
        )
      ]
    ];
  }

  SaveJSON(1);
  return console.log(
    "[Deleted Emoji]".bgBlue,
    `<${ripEmoji.guild.name}/${ripEmoji.guild.id}>`.cyan,
    `Deleted :${ripEmoji.name.toString().yellow}:`
  );
});



bot.on("message", async message => {
  var channel = message.channel;
  var msg = message.content;
  var words = msg.split(" ");

  if (words[0] == Config["prefix"] + "memes") {
    var listomemes = "";
    let embeded = new Discord.MessageEmbed()
      .setTitle(Object.keys(memes).length + " Memes")
      .setDescription(
        "Use `" +
          Config["meme-wrapper"] +
          "` on both sides of the meme name send it"
      );
    let startpos = 0;

    if (words[1] && Number(words[1])) {
      //skips further into the list
      startpos = Number(words[1]) * 10;
      if (startpos > Object.keys(memes).length) {
        // start at the end and work backwards
        for (var i = startpos; i > 0; i--) {
          if (i <= startpos - 10) {
            // once it reaches the maximum length, hit stop.
            startpos = i;
            break;
          }
        }
      }
    }
    for (var loops = startpos; loops < Object.keys(memes).length; loops++) {
      if (loops >= startpos + 10 || loops >= Object.keys(memes).length) {
        break;
      } else {
        listomemes += Object.keys(memes)[loops] + "\n";
      }
    }

    let theFooterLol = 0;
    if (startpos / 10 == 0.1) {
      theFooterLol = 1;
    } else {
      theFooterLol = Math.ceil(startpos / 10) + 1;
    }
    embeded
      .addField("_______", listomemes)
      .setFooter(
        theFooterLol +
          " of " +
          Math.ceil(Object.keys(memes).length / 10) +
          " | Use ?memes [page #]"
      );

    return channel.send(embeded);
  } else if (words[0] == Config["prefix"] + "emojis") {
    var listoemojis = "";
    let embeded = new Discord.MessageEmbed()
      .setTitle(Object.keys(emojis).length + " Emojis")
      .setDescription(
        "Use `" +
          Config["emoji-wrapper"] +
          "` on both sides of the emoji name send it"
      );
    let startpos = 0;

    if (words[1] && Number(words[1]) && Number(words[1]) != 1) {
      //skips further into the list
      if (Number(words[1]) * 10 > Object.keys(emojis).length + 10)
        return channel.send("I don't have access to that many emojis!");
      startpos = Number(words[1]) * 10;
      if (startpos > Object.keys(emojis).length) {
        // start at the end and work backwards
        for (var i = startpos; i > 0; i--) {
          if (i <= startpos - 10) {
            // once it reaches the maximum length, hit stop.
            startpos = i;
            break;
          }
        }
      }
    }

    for (var loops = startpos; loops < Object.keys(emojis).length; loops++) {
      if (loops >= startpos + 10 || loops >= Object.keys(emojis).length) {
        break;
      } else {
        listoemojis += `${Object.keys(emojis)[loops]} ${
          Object.values(emojis)[loops]
        }\n`;
      }
    }

    let theFooterLol = 0;
    if (startpos / 10 == 0.1) {
      theFooterLol = 1;
    } else {
      theFooterLol = Math.ceil(startpos / 10) + 1;
    }

    if (listoemojis.replace(/\n/g).replace(" ") == "") {
      return channel.send("Amazing! I don't have access to any emojis!");
    }

    embeded
      .addField("_______", listoemojis)
      .setFooter(
        theFooterLol +
          " of " +
          Math.ceil(Object.keys(emojis).length / 10) +
          " | Use ?emojis [page #]"
      );
    return channel.send(embeded);
  } else if (words[0] == Config["prefix"] + "help") {
    return channel.send(
      new Discord.MessageEmbed()
        .setTitle("Memeinator Help Menu")
        .setDescription(
          "Discord Memeinator Bot\nInvite to your server: https://discord.com/api/oauth2/authorize?client_id=813201447101005875&permissions=1074130112&scope=bot \n\nUse this bot just like how you use emojis. To use a meme enter in the name with `" +
            Config["meme-wrapper"] +
            "` on either side, example: `" +
            Config["meme-wrapper"] +
            "brain_blast" +
            Config["meme-wrapper"] +
            "`\nTo use an emoji enter in an emoji name with `" +
            Config["emoji-wrapper"] +
            "` on either side, example: `" +
            Config["emoji-wrapper"] +
            "MaBoiHere" +
            Config["emoji-wrapper"] +
            "`\n*Using emojis is case sensitive*"
        )
        .addField(
          "?memes",
          "Shows a list of available memes.\nFollow the command with a number to skip to a certain page such as `?memes 2`"
        )
        .addField(
          "?emojis",
          "Shows a list of available emojis.\nFollow the command with a number to skip to a certain page such as `?emojis 2`"
        )
    );
  } else if (words[0] == Config["prefix"] + "ping") {
    var before = Date.now();
    var test_image = await channel.send(
      "Pinging Imgur.... https://i.imgur.com/8YsAmq3.gif"
    );
    var after = Date.now();

    test_image.delete();
    channel.send(
      `Ping to Server: ${Math.round(bot.ws.ping)}ms\nPing to Imgur: ${after -
        before}ms`
    );
    return console.log(
      "[Ping]".magenta,
      `<${message.guild.name}/${message.guild.id}>`.cyan,
      Math.round(bot.ws.ping) + "ms",
      `<Imgur>`.green,
      after - before + "ms"
    );
  } else if ( msg.startsWith(Config["meme-wrapper"]) && msg.endsWith(Config["meme-wrapper"]) ) {
    
    
    // sends an image into chat, typically with text on it.

    if (memes[msg.replace(/ /g, "_").replace(/\|/g, "")]) {
      var JSONMeme = memes[msg.replace(/ /g, "_").replace(/\|/g, "")];
      if (typeof JSONMeme == "object") {
        message.inlineReply(JSONMeme[Math.floor(Math.random() * JSONMeme.length)]);
      } else {
        message.inlineReply(JSONMeme);
      }
    } else {
      channel.send("I couldn't find that meme in my database.");
    }
    
    
  } else if (msg.split(Config["emoji-wrapper"]).length > 1) {
    let emojiwrappers = msg.split(Config["emoji-wrapper"]);
    var ToSend = "";
    var QueuedEmojis = [];

    for (var semicolons = 1; semicolons < emojiwrappers.length; semicolons += 2 ) {
      
      if(emojiwrappers.length % 2 == 0){
        if(semicolons > emojiwrappers.length-2){
          console.log("Uneven semicolons");
          break;
        }
      }
      
      
      if(emojiwrappers[semicolons - 1].length > 29 || emojiwrappers[semicolons - 1].split(" ").length > 1)
      ToSend += emojiwrappers[semicolons - 1] + " ";
      if (semicolons > emojiwrappers.length) {
        break;
      }

      if (emojis[emojiwrappers[semicolons].replace(/ /g, "")]) {
        ToSend += emojis[emojiwrappers[semicolons].replace(/ /g, "")] + " ";
        QueuedEmojis.push(emojiwrappers[semicolons].replace(/ /g, ""));
      } else {
        delete emojis[emojiwrappers[semicolons].replace(/ /g, "")];
        return channel.send("I couldn't find that emoji in my database.");
      }
      
    }

    
    var Response = await channel.send(ToSend);

    for (var i = 0; i < QueuedEmojis.length; i++) {

      if (
        Response.content.includes(
          emojis[QueuedEmojis[i]].substring(
            emojis[QueuedEmojis[i]].indexOf(":"), 
            emojis[QueuedEmojis[i]].lastIndexOf(":")+1
          )
        ) &&
        Response.content.charAt(
          Response.content.indexOf(
            emojis[QueuedEmojis[i]].substring(
              emojis[QueuedEmojis[i]].indexOf(":"), 
              emojis[QueuedEmojis[i]].lastIndexOf(":")+1
            )
          ) - 1
        ) != "a" &&
        Response.content.charAt(
          Response.content.indexOf(
            emojis[QueuedEmojis[i]].substring(
              emojis[QueuedEmojis[i]].indexOf(":"), 
              emojis[QueuedEmojis[i]].lastIndexOf(":")+1
            )
          ) - 1
        ) != "<"
      ) {
        
        Response.edit("Oops! I no longer have access to one or more of those emojis, I'll correct my list...");
        delete emojis[QueuedEmojis[i]];

        console.log("[Deleted Emoji]".bgBlue, `Deleted :${QueuedEmojis[i].toString().yellow}:`);
        SaveJSON(1);
        return;
      }
    }

    return;
  } else if (words[0] == Config["prefix"] + "reloadEmojis" && message.author.id == 596938492752166922) {
    console.log("[Reloading Server Emojis]".bgWhite.blue);

    var ReloadMessage = await channel.send("Reloading The Servers... 0%");
    let loops = 0;

    bot.guilds.cache.forEach(server => {
      try {
        ReloadServerEmojis(server);
      } catch (err) {
        if (err) {
          message.edit("I got an error while reloading! Check the console");
          return console.log("[ERROR]".black.bgRed, "");
        }
      }
      loops++;
      ReloadMessage.edit(
        `Reloading the Servers... ${(loops / bot.guilds.cache.size).toFixed(
          2
        )}%`
      );
    });

    console.log("[Finished Reloading Server Emojis]".cyan.bgBlue);
    return ReloadMessage.edit("Finished Reloading Servers");
  
  }else if(msg === "420" || msg === "69"){
    return message.inlineReply("Nice.");           
  }
});

function SaveJSON(file) {
  if (file == 0) {
    fs.writeFile("memeages.json", JSON.stringify(memes), err => {
      if (err) throw err;
    });
  } else if (file == 1) {
    fs.writeFile("emojimages.json", JSON.stringify(emojis), err => {
      if (err) throw err;
    });
  }
}

function ReloadServerEmojis(server) {
  let FoundEmojis = 0;

  server.emojis.cache.forEach(item => {
    console.log(item.name + ": https://cdn.discordapp.com/emojis/" + item.id + ".png?v=1");
    var AnimatedStart = ""; // Animated emojis start with an a before the rest of the input, so in this'll fill the slot before hand

    if (item.animated === true) AnimatedStart = "a";
    if (
      item.name in emojis &&
      emojis[item.name] == `<${AnimatedStart}:${item.name}:${item.id}>`
    ) {
      // nuthin
    } else if (
      item.name in emojis &&
      emojis[item.name] != `<${AnimatedStart}:${item.name}:${item.id}>`
    ) {
      for (let keepGoing = 1; keepGoing < 420; keepGoing++) {
        if (
          item.name + keepGoing.toString() in emojis &&
          emojis[item.name + keepGoing.toString()] ==
            `<${AnimatedStart}:${item.name}:${item.id}>`
        ) {
          // that emoji is already in there, it just has a number on the end of it.
          break;
        } else {
          emojis[
            item.name + keepGoing.toString()
          ] = `<${AnimatedStart}:${item.name}:${item.id}>`;
          break;
        }
      }
    } else {
      emojis[item.name] = `<${AnimatedStart}:${item.name}:${item.id}>`;
    }
    FoundEmojis += 1;
  });

  SaveJSON(1);

  return console.log(
    `[Joined Server] <${server.name}/${server.id}>`.cyan,
    `Added ${FoundEmojis.toString().yellow} to emojimages.json`
  );
}



/* Thanks Allvaa on Github :D
https://gist.github.com/Allvaa/0320f06ee793dc88e4e209d3ea9f6256 */
class ExtAPIMessage extends APIMessage {
    resolveData() {
        if (this.data) return this;
        super.resolveData();
        const allowedMentions = this.options.allowedMentions || this.target.client.options.allowedMentions || {};
        if (allowedMentions.repliedUser !== undefined) {
            if (this.data.allowed_mentions === undefined) this.data.allowed_mentions = {};
            Object.assign(this.data.allowed_mentions, { replied_user: allowedMentions.repliedUser });
        }
        if (this.options.replyTo !== undefined) {
            Object.assign(this.data, { message_reference: { message_id: this.options.replyTo.id } });
        }
        return this;
    }
}

class Message extends Structures.get("Message") {
    inlineReply(content, options) {
        return this.channel.send(ExtAPIMessage.create(this, content, options, { replyTo: this }).resolveData());
    }

    edit(content, options) {
        return super.edit(ExtAPIMessage.create(this, content, options).resolveData());
    }
}

Structures.extend("Message", () => Message);