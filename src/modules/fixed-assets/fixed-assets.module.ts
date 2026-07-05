import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedAsset } from '../../entities/fixed-asset.entity';
import { FixedAssetsService } from './fixed-assets.service';
import { FixedAssetsController } from './fixed-assets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FixedAsset])],
  controllers: [FixedAssetsController],
  providers: [FixedAssetsService],
  exports: [FixedAssetsService],
})
export class FixedAssetsModule {}
