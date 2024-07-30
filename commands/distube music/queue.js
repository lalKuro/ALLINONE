


const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('warteschlange')
        .setDescription('siehe die altuelle Warteschlange'),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('**Du musst in einem Voice Channel sein um die Warteschlange zu sehen!**');
        }

        const queue = interaction.client.distube.getQueue(interaction.guildId);

        if (!queue || !queue.songs.length) {
            const noSongsEmbed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setAuthor({ 
                    name: "Oops!", 
                    iconURL: musicIcons.wrongIcon ,
                     url: "https://discord.gg/dvWvS8kuWV"
                    })
                .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })   
                .setDescription('Keine Lieder in der Warteschlange.');

            if (interaction.isCommand && interaction.isCommand()) {
                return interaction.reply({ embeds: [noSongsEmbed] });
            } else {
                return interaction.channel.send({ embeds: [noSongsEmbed] });
            }
        }

        const queueEmbed = new EmbedBuilder()
            .setColor('#DC92FF')
            .setAuthor({ 
                name: "Aktuelle Warteschlange!", 
                iconURL: musicIcons.beatsIcon ,
                 url: "https://discord.gg/dvWvS8kuWV"
                })
            .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })   
            .setDescription(`Songs: ${queue.songs.length}`)
            .setTimestamp();

            for (let i = 1; i < queue.songs.length; i++) {
                queueEmbed.addFields(
                    { name: `${i}. ${queue.songs[i].name}`, value: `Duration: ${queue.songs[i].formattedDuration}` }
                );
            }

        if (interaction.isCommand && interaction.isCommand()) {
            await interaction.reply({ embeds: [queueEmbed] });
        } else {
            await interaction.channel.send({ embeds: [queueEmbed] });
        }
    },
};
