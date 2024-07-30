const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { DisTubeError } = require('distube');
const musicIcons = require('../../UI/icons/musicicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stopt den aktuellen Song und leavt den Voice Channel'),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('**Du musst in einem Voice Channel sein um den Commanf auszuführen!**');
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return interaction.reply('**Ich brauche die Erlaubnis um ihren Voice Channel beizutreten!**');
        }

        try {
            await interaction.reply('**Warteschlange wird gestoppt!**');

            // Stop the queue and leave voice channel
            await interaction.client.distube.stop(voiceChannel);

            const stoppedEmbed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setAuthor({ 
                    name: "Gestoppt!", 
                    iconURL: musicIcons.stopIcon ,
                     url: "https://discord.gg/dvWvS8kuWV"
                    })
                .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })   
                .setDescription('**Die Warteschlange wurde gestoppt**');

            if (interaction.isCommand && interaction.isCommand()) {
                await interaction.editReply({ embeds: [stoppedEmbed] });
            } else {
                await interaction.reply({ embeds: [stoppedEmbed] });
            }
        } catch (error) {
            console.error(error);

            if (error instanceof DisTubeError && error.code === 'NO_QUEUE') {
                const noQueueEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ 
                        name: "Oops!", 
                        iconURL: musicIcons.wrongIcon ,
                         url: "https://discord.gg/dvWvS8kuWV"
                        })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })   
                    .setDescription('**Es spielt aktuell kein Song.**');

                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply({ embeds: [noQueueEmbed] });
                } else {
                    await interaction.reply({ embeds: [noQueueEmbed] });
                }
            } else if (error instanceof DisTubeError && error.code === 'STOPPED') {
                const alreadyStoppedEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ 
                        name: "Oops!", 
                        iconURL: musicIcons.wrongIcon ,
                         url: "https://discord.gg/dvWvS8kuWV"
                        })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })   
                    .setDescription('**Die Warteschalange wurde schon gestoppt.**');

                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply({ embeds: [alreadyStoppedEmbed] });
                } else {
                    await interaction.reply({ embeds: [alreadyStoppedEmbed] });
                }
            } else {
                const errorMessage = 'Ein Fehler ist währenddessen aufgetaucht.';
                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
    },
};
