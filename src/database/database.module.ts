import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('DB_HOST'),
                port: config.get('DB_PORT'),
                username: config.get('DB_USER'),
                password: config.get('DB_PASSWORD'),
                database: config.get('DB_NAME'),
                autoLoadEntities: true,
                synchronize: true,
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                ssl: {
                    rejectUnauthorized: false,
                },
                seeds: [__dirname + '/seeds/*{.ts,.js}'],
                factories: [__dirname + '/factories/*{.ts,.js}'],
            }),
            inject: [ConfigService],
        }),
    ]
})

export class DatabaseModule implements OnModuleInit {
  constructor(
    private dataSource: DataSource
  ) {}
  
  async onModuleInit() {
    if (this.dataSource.isInitialized) {
      console.log('✅ Database connected successfully');
    } else {
      console.log('Database connection failed');
    }
  }
}
