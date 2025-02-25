const { AttachmentBuilder } = require('discord.js');

async function createTranscript(interaction) {
  const messages = await interaction.channel.messages.fetch({ limit: 100 });
  const transcript = messages.map((msg) => {
    return `**${msg.author.tag}** [${new Date(msg.createdTimestamp).toLocaleString()}]:\n${msg.content}\n\n`;
  }).join(''); 


  const buffer = Buffer.from(transcript, 'utf-8');

  const attachment = new AttachmentBuilder(buffer, { name: `transcript-${interaction.user.username}-${Date.now()}.txt` });

  await interaction.channel.send({
    files: [attachment],
  });
}

module.exports = { createTranscript };
