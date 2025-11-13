import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM('admin', 'host', 'animator');
      CREATE TYPE "game_status_enum" AS ENUM('lobby', 'running', 'paused', 'finished');
      CREATE TYPE "round_type_enum" AS ENUM('quiz', 'blindtest', 'mixed', 'final');
      CREATE TYPE "question_type_enum" AS ENUM('blindtest_audio', 'qcm', 'qcm_multi', 'text', 'numeric', 'survey');
      CREATE TYPE "validation_status_enum" AS ENUM('pending', 'correct', 'incorrect', 'partial');
    `);

    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "name" varchar NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'host',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Themes table
    await queryRunner.query(`
      CREATE TABLE "themes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "colors" jsonb,
        "logoUrl" varchar,
        "backgroundImageUrl" varchar,
        "backgroundVideoUrl" varchar,
        "fontFamily" varchar NOT NULL DEFAULT 'Inter',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Shows table
    await queryRunner.query(`
      CREATE TABLE "shows" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar NOT NULL,
        "description" text,
        "eventDate" timestamp,
        "venue" varchar,
        "themeId" uuid,
        "defaultLanguage" varchar NOT NULL DEFAULT 'fr',
        "settings" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE SET NULL
      )
    `);

    // Rounds table
    await queryRunner.query(`
      CREATE TABLE "rounds" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "showId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "type" "round_type_enum" NOT NULL DEFAULT 'quiz',
        "order" integer NOT NULL,
        "settings" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        FOREIGN KEY ("showId") REFERENCES "shows"("id") ON DELETE CASCADE
      )
    `);

    // Questions table
    await queryRunner.query(`
      CREATE TABLE "questions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "roundId" uuid NOT NULL,
        "title" varchar NOT NULL,
        "description" text,
        "type" "question_type_enum" NOT NULL,
        "order" integer NOT NULL,
        "timeLimit" integer NOT NULL DEFAULT 30,
        "basePoints" integer NOT NULL DEFAULT 100,
        "options" jsonb,
        "correctAnswer" text,
        "audioUrl" varchar,
        "audioStartAt" integer,
        "audioDuration" integer,
        "audioTitle" text,
        "audioArtist" text,
        "imageCoverUrl" varchar,
        "settings" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE
      )
    `);

    // Games table
    await queryRunner.query(`
      CREATE TABLE "games" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "showId" uuid NOT NULL,
        "pinCode" varchar(6) NOT NULL UNIQUE,
        "status" "game_status_enum" NOT NULL DEFAULT 'lobby',
        "currentRoundId" uuid,
        "currentQuestionId" uuid,
        "questionStartedAt" timestamp,
        "maxTeams" integer NOT NULL DEFAULT 60,
        "state" jsonb,
        "startedAt" timestamp,
        "finishedAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        FOREIGN KEY ("showId") REFERENCES "shows"("id") ON DELETE CASCADE
      )
    `);

    // Teams table
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "gameId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "color" varchar,
        "emoji" varchar,
        "score" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE
      )
    `);

    // Players table
    await queryRunner.query(`
      CREATE TABLE "players" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "teamId" uuid NOT NULL,
        "nickname" varchar NOT NULL,
        "deviceId" varchar,
        "isConnected" boolean NOT NULL DEFAULT false,
        "lastSeenAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE
      )
    `);

    // Answers table
    await queryRunner.query(`
      CREATE TABLE "answers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "teamId" uuid NOT NULL,
        "questionId" uuid NOT NULL,
        "payload" jsonb NOT NULL,
        "validationStatus" "validation_status_enum" NOT NULL DEFAULT 'pending',
        "pointsAwarded" integer NOT NULL DEFAULT 0,
        "submittedAt" timestamp NOT NULL,
        "wasFirstToAnswer" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE,
        FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE
      )
    `);

    // Buzzer attempts table
    await queryRunner.query(`
      CREATE TABLE "buzzer_attempts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "teamId" uuid NOT NULL,
        "questionId" uuid NOT NULL,
        "timestampMs" bigint NOT NULL,
        "isFirst" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE,
        FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX "IDX_games_pinCode" ON "games"("pinCode");
      CREATE INDEX "IDX_teams_gameId" ON "teams"("gameId");
      CREATE INDEX "IDX_teams_score" ON "teams"("score");
      CREATE INDEX "IDX_answers_questionId" ON "answers"("questionId");
      CREATE INDEX "IDX_buzzer_attempts_questionId" ON "buzzer_attempts"("questionId");
      CREATE INDEX "IDX_buzzer_attempts_timestampMs" ON "buzzer_attempts"("timestampMs");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "buzzer_attempts"`);
    await queryRunner.query(`DROP TABLE "answers"`);
    await queryRunner.query(`DROP TABLE "players"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(`DROP TABLE "questions"`);
    await queryRunner.query(`DROP TABLE "rounds"`);
    await queryRunner.query(`DROP TABLE "shows"`);
    await queryRunner.query(`DROP TABLE "themes"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "validation_status_enum"`);
    await queryRunner.query(`DROP TYPE "question_type_enum"`);
    await queryRunner.query(`DROP TYPE "round_type_enum"`);
    await queryRunner.query(`DROP TYPE "game_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
