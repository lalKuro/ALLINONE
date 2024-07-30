const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { DisTubeError } = require('distube');
const musicIcons = require('../../UI/icons/musicicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Looping für den aktuellen song in der Warteschlange aktiviert')
        .addStringOption(option =>
            option.setName('Modus?')
                .setDescription('Loop Modus: "Warteschlange" or "Lied"')
                .setRequired(false)),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            await interaction.deferReply();
        }

        try {
            await executeLoop(interaction);
        } catch (error) {
            console.error(error);
            const errorMessage = 'Ein Fehler ist während des umschalten aufgetaucht.';
            await interaction.editReply(errorMessage);
        }
    },

    async executePrefix(message, args) {
        try {
            await executeLoop(message);
        } catch (error) {
            console.error(error);
            const errorMessage = 'Ein Fehler ist während des umschalten aufgetaucht.';
            await message.channel.send(errorMessage);
        }
    },
};

async function executeLoop(source) {
    const voiceChannel = source.member.voice.channel;

    if (!voiceChannel) {
        if (source.isCommand && source.isCommand()) {
            return source.editReply('**Du musst in einem Voice channel sein, um die Music zu kontrollieren!**');
        } else {
            return source.channel.send('**Du musst in einem Voice channel sein, um die Music zu kontrollieren!**');
        }
    }

    const permissions = voiceChannel.permissionsFor(source.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        if (source.isCommand && source.isCommand()) {
            return source.editReply('Ich brauche eine Erlaubnis um deinen Voice channel beizutreten!');
        } else {
            return source.channel.send('Ich brauche eine Erlaubnis um deinen Voice channel beizutreten!');
        }
    }

    const loopMode = source.options?.getString('mode') || (source.content.split(/\s+/)[1] || '').toLowerCase();

    const guildId = source.guildId;
    const queue = source.client.distube.getQueue(guildId);

    if (!queue) {
        const noQueueEmbed = new EmbedBuilder()
            .setColor('#DC92FF')
            .setAuthor({ 
                name: "Oops!", 
                iconURL: musicIcons.wrongIcon ,
                 url: "https://discord.gg/dvWvS8kuWV"
                })
        .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })  
            .setDescription('**Es ist keine Warteschlabge immoment!**');

        if (source.isCommand && source.isCommand()) {
            return source.editReply({ embeds: [noQueueEmbed] });
        } else {
            return source.channel.send({ embeds: [noQueueEmbed] });
        }
    }

    const toggleLoopEmbed = new EmbedBuilder()
        .setColor('#DC92FF')
        .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })  
        .setAuthor({ 
            name: "Loop", 
            iconURL: musicIcons.loopIcon ,
             url: "https://discord.gg/dvWvS8kuWV"
            });
    if (loopMode === 'queue') {
        await source.client.distube.setRepeatMode(guildId, 2); 
        toggleLoopEmbed.setDescription('**Looping Modus für die aktuelle Warteschlange aktiviert.**');
    } else if (loopMode === 'song') {
        await source.client.distube.setRepeatMode(guildId, 1); 
        toggleLoopEmbed.setDescription('**Looping Modus für den aktuellen song aktiviert.**');
    } else {
       
        if (queue.repeatMode === 1) {
            await source.client.distube.setRepeatMode(guildId, 0);
            toggleLoopEmbed.setDescription('**Looping Modus ausgeschaltet!**');
        } else if (queue.repeatMode === 0) {
            await source.client.distube.setRepeatMode(guildId, 1); 
            toggleLoopEmbed.setDescription('**Looping Modus für den aktuellen song aktiviert!**');
        } else {
            await source.client.distube.setRepeatMode(guildId, 0);
            toggleLoopEmbed.setDescription('**Looping Modus ausgeschaltet!**');
        }
    }

    if (source.isCommand && source.isCommand()) {
        await source.editReply({ embeds: [toggleLoopEmbed] });
    } else {
        await source.channel.send({ embeds: [toggleLoopEmbed] });
    }
}
