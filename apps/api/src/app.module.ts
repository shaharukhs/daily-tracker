import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { validateEnv, type Env } from './config/env';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PreferencesModule } from './preferences/preferences.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SalahModule } from './trackers/salah/salah.module';
import { WaterModule } from './trackers/water/water.module';
import { AdhkarModule } from './trackers/adhkar/adhkar.module';
import { QuranModule } from './trackers/quran/quran.module';
import { ExerciseModule } from './trackers/exercise/exercise.module';
import { JunkFreeModule } from './trackers/junk-free/junk-free.module';
import { FoodLogModule } from './trackers/food-log/food-log.module';
import { WeightModule } from './trackers/weight/weight.module';
import { ReflectionModule } from './trackers/reflection/reflection.module';
import { MeditationModule } from './trackers/meditation/meditation.module';
import { SleepModule } from './trackers/sleep/sleep.module';
import { MoodModule } from './trackers/mood/mood.module';
import { FastingModule } from './trackers/fasting/fasting.module';
import { SadaqahModule } from './trackers/sadaqah/sadaqah.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService<Env, true>) => [
        {
          ttl: cfg.get('THROTTLE_TTL_MS', { infer: true }),
          limit: cfg.get('THROTTLE_LIMIT', { infer: true }),
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PreferencesModule,
    SubscriptionsModule,
    SalahModule,
    WaterModule,
    AdhkarModule,
    QuranModule,
    ExerciseModule,
    JunkFreeModule,
    FoodLogModule,
    WeightModule,
    ReflectionModule,
    MeditationModule,
    SleepModule,
    MoodModule,
    FastingModule,
    SadaqahModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
