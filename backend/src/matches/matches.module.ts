import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './match.entity';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { UserEntity } from 'src/users/user.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([MatchEntity,
        UserEntity]),
        UsersModule],
    controllers: [MatchesController],
    providers: [MatchesService],
    exports: [MatchesService]
})
export class MatchesModule {}
