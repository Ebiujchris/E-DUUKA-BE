import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FixedAsset } from '../../entities/fixed-asset.entity';
import { CreateFixedAssetDto, UpdateFixedAssetDto } from './dto/fixed-asset.dto';

@Injectable()
export class FixedAssetsService {
  constructor(
    @InjectRepository(FixedAsset)
    private assetRepository: Repository<FixedAsset>,
  ) {}

  async create(dto: CreateFixedAssetDto & { shopId: string }): Promise<FixedAsset> {
    const asset = this.assetRepository.create(dto);
    return this.assetRepository.save(asset);
  }

  async findAll(shopId: string): Promise<FixedAsset[]> {
    return this.assetRepository.find({
      where: { shopId },
      order: { acquireDate: 'DESC' },
    });
  }

  async findOne(id: string, shopId: string): Promise<FixedAsset> {
    const asset = await this.assetRepository.findOne({ where: { id, shopId } });
    if (!asset) throw new Error('Fixed asset not found');
    return asset;
  }

  async update(id: string, shopId: string, dto: UpdateFixedAssetDto): Promise<FixedAsset> {
    await this.assetRepository.update({ id, shopId }, dto);
    return this.findOne(id, shopId);
  }

  async remove(id: string, shopId: string): Promise<{ message: string }> {
    const result = await this.assetRepository.delete({ id, shopId });
    if (result.affected === 0) throw new Error('Fixed asset not found');
    return { message: 'Fixed asset removed successfully' };
  }

  /** Straight-line depreciation: (cost - salvage) / usefulLife years */
  calcDepreciation(asset: FixedAsset, asOfDate: Date = new Date()) {
    const cost          = Number(asset.cost);
    const salvage       = Number(asset.salvageValue);
    const life          = asset.usefulLifeYears;
    const acquired      = new Date(asset.acquireDate);
    const annualDep     = (cost - salvage) / life;

    const msPerYear     = 1000 * 60 * 60 * 24 * 365.25;
    const yearsHeld     = Math.max(0, (asOfDate.getTime() - acquired.getTime()) / msPerYear);
    const accumulated   = Math.min(cost - salvage, annualDep * yearsHeld);
    const bookValue     = cost - accumulated;

    return { annualDepreciation: annualDep, accumulatedDepreciation: accumulated, bookValue };
  }
}
