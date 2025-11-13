import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import * as readline from 'readline';
import { User, UserRole } from '../database/entities/user.entity';
import dataSource from '../config/typeorm.config';

config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  try {
    await dataSource.initialize();
    console.log('✅ Connexion à la base de données établie\n');

    const email = await question('Email de l\'admin: ');
    const name = await question('Nom de l\'admin: ');
    const password = await question('Mot de passe: ');

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRepository = dataSource.getRepository(User);

    // Vérifier si l'utilisateur existe déjà
    const existing = await userRepository.findOne({ where: { email } });
    if (existing) {
      console.log('\n❌ Un utilisateur avec cet email existe déjà');
      rl.close();
      await dataSource.destroy();
      return;
    }

    const admin = userRepository.create({
      email,
      name,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await userRepository.save(admin);

    console.log('\n✅ Admin créé avec succès!');
    console.log(`   Email: ${email}`);
    console.log(`   Nom: ${name}`);
    console.log(`   Rôle: ${UserRole.ADMIN}\n`);

    rl.close();
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    rl.close();
    await dataSource.destroy();
    process.exit(1);
  }
}

createAdmin();
