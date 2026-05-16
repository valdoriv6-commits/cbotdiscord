require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

// ======================
// DEBUG
// ======================

console.log("🔐 TOKEN:", process.env.DISCORD_TOKEN ? "OK" : "MISSING");
console.log("🆔 CLIENT_ID:", process.env.CLIENT_ID);
console.log("🏠 GUILD_ID:", process.env.GUILD_ID);

// ======================
// VALIDACIÓN
// ======================

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
    console.log("❌ Faltan variables en .env");
    process.exit(1);
}

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ======================
// IMÁGENES
// ======================

const PLACAS_IMG = "https://i.imgur.com/WyJrWv3.gif";
const ASCENSO_IMG = "https://i.imgur.com/WyJrWv3.gif";
const DESCENSO_IMG = "https://i.imgur.com/WyJrWv3.gif";
const DESPIDO_IMG = "https://i.imgur.com/WyJrWv3.gif";

// ======================
// CLIENTE
// ======================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// ======================
// REST
// ======================

const rest = new REST({ version: '10' }).setToken(TOKEN);

// ======================
// COMANDOS
// ======================

const commands = [

    new SlashCommandBuilder()
        .setName('placa')
        .setDescription('Asignar placa oficial')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
        .addStringOption(o => o.setName('prefijo').setDescription('Ej: FGR').setRequired(true))
        .addStringOption(o => o.setName('nombre').setDescription('Nombre').setRequired(true))
        .addIntegerOption(o => o.setName('numero').setDescription('Número').setRequired(true)),

    new SlashCommandBuilder()
        .setName('ascenso')
        .setDescription('Ascender agente')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
        .addRoleOption(o => o.setName('nuevo_rango').setDescription('Nuevo rango').setRequired(true))
        .addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(true)),

    new SlashCommandBuilder()
        .setName('descenso')
        .setDescription('Descender agente')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
        .addRoleOption(o => o.setName('nuevo_rango').setDescription('Nuevo rango').setRequired(true))
        .addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(true)),

    new SlashCommandBuilder()
        .setName('despido')
        .setDescription('Despedir agente')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
        .addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(true))

].map(c => c.toJSON());

// ======================
// REGISTRO
// ======================

(async () => {
    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
    );

    console.log("✅ Comandos registrados");
})();

// ======================
// READY
// ======================

client.once('ready', () => {
    console.log(`🟢 BOT ACTIVO COMO ${client.user.tag}`);
});

// ======================
// INTERACCIONES
// ======================

client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    try {

        // ======================
        // PLACA
        // ======================
        if (interaction.commandName === 'placa') {

            await interaction.deferReply();

            const usuario = interaction.options.getUser('usuario');
            const prefijo = interaction.options.getString('prefijo');
            const nombre = interaction.options.getString('nombre');
            const numero = interaction.options.getInteger('numero');

            const miembro = await interaction.guild.members.fetch(usuario.id);

            const placa = `[${prefijo}-${String(numero).padStart(3, '0')}]`;

            await miembro.setNickname(`${placa} ${nombre}`);

            const embed = new EmbedBuilder()
                .setTitle('🚔 ASIGNACIÓN DE PLACA OFICIAL')
                .setColor(0x00ff00)
                .setImage(PLACAS_IMG)
                .addFields(
                    { name: '👮 Oficial', value: `${nombre}`, inline: true },
                    { name: '👤 Usuario', value: `${usuario}`, inline: true },
                    { name: '🪪 Placa', value: `${placa}`, inline: true }
                )
                .setFooter({ text: 'Sistema oficial de asignación - FGR' });

            return interaction.editReply({ embeds: [embed] });
        }

        // ======================
        // ASCENSO
        // ======================
        if (interaction.commandName === 'ascenso') {

            await interaction.deferReply();

            const usuario = interaction.options.getUser('usuario');
            const nuevo = interaction.options.getRole('nuevo_rango');
            const motivo = interaction.options.getString('motivo');

            const miembro = await interaction.guild.members.fetch(usuario.id);
            await miembro.roles.add(nuevo);

            const embed = new EmbedBuilder()
                .setTitle('⬆️ ASCENSO OFICIAL')
                .setColor(0x00ff00)
                .setImage(ASCENSO_IMG)
                .addFields(
                    { name: '👤 Usuario', value: `${usuario}`, inline: true },
                    { name: '🎖 Nuevo rango', value: `${nuevo}`, inline: true },
                    { name: '📄 Motivo', value: `${motivo}`, inline: false }
                )
                .setFooter({ text: 'Sistema oficial de ascensos - FGR' });

            return interaction.editReply({ embeds: [embed] });
        }

        // ======================
        // DESCENSO
        // ======================
        if (interaction.commandName === 'descenso') {

            await interaction.deferReply();

            const usuario = interaction.options.getUser('usuario');
            const nuevo = interaction.options.getRole('nuevo_rango');
            const motivo = interaction.options.getString('motivo');

            const miembro = await interaction.guild.members.fetch(usuario.id);
            await miembro.roles.add(nuevo);

            const embed = new EmbedBuilder()
                .setTitle('⬇️ DESCENSO OFICIAL')
                .setColor(0xffa500)
                .setImage(DESCENSO_IMG)
                .addFields(
                    { name: '👤 Usuario', value: `${usuario}`, inline: true },
                    { name: '📉 Nuevo rango', value: `${nuevo}`, inline: true },
                    { name: '📄 Motivo', value: `${motivo}`, inline: false }
                )
                .setFooter({ text: 'Sistema oficial de control interno - FGR' });

            return interaction.editReply({ embeds: [embed] });
        }

        // ======================
        // DESPIDO
        // ======================
        if (interaction.commandName === 'despido') {

            await interaction.deferReply();

            const usuario = interaction.options.getUser('usuario');
            const motivo = interaction.options.getString('motivo');

            const miembro = await interaction.guild.members.fetch(usuario.id);

            const embed = new EmbedBuilder()
                .setTitle('❌ BAJA LABORAL OFICIAL')
                .setColor(0xff0000)
                .setImage(DESPIDO_IMG)
                .addFields(
                    { name: '👤 Usuario', value: `${usuario}`, inline: true },
                    { name: '📄 Motivo', value: `${motivo}`, inline: false }
                )
                .setFooter({ text: 'Sistema oficial de bajas - FGR' });

            return interaction.editReply({ embeds: [embed] });
        }

    } catch (err) {
        console.error(err);

        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({
                content: "❌ Error ejecutando comando"
            });
        }

        return interaction.reply({
            content: "❌ Error ejecutando comando",
            ephemeral: true
        });
    }
});

client.login(TOKEN);