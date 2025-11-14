const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'arena_db',
    entities: [__dirname + '/../dist/database/entities/**/*.entity.js'],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connexion à la base de données établie\n');

    const email = await question("Email de l'admin: ");
    const name = await question("Nom de l'admin: ");
    const password = await question('Mot de passe: ');

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRepository = dataSource.getRepository('User');

    // Vérifier si l'utilisateur existe déjà
    const existing = await userRepository.findOne({ where: { email } });
    if (existing) {
      console.log('\n❌ Un utilisateur avec cet email existe déjà');
      rl.close();
      await dataSource.destroy();
      process.exit(1);
    }

    const admin = userRepository.create({
      email,
      name,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    await userRepository.save(admin);

    console.log('\n✅ Admin créé avec succès!');
    console.log(`   Email: ${email}`);
    console.log(`   Nom: ${name}`);
    console.log(`   Rôle: admin\n`);

    rl.close();
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    rl.close();
    await dataSource.destroy();
    process.exit(1);
  }
}

createAdmin();
