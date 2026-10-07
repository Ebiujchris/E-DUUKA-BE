import { ProductsService } from './products.service';
import { Product } from '../../entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let activityService: {
    record: jest.Mock;
  };

  beforeEach(() => {
    productRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    activityService = {
      record: jest.fn(),
    };

    service = new ProductsService(
      productRepository as any,
      activityService as any,
    );
  });

  it('records stock adjustments with explicit reasons and signed deltas', async () => {
    const product: Partial<Product> = {
      id: 'p1',
      name: 'Rice',
      stockQuantity: 100,
      buyingPrice: 2500,
      sellingPrice: 3200,
      shopId: 'shop-1',
      userId: 'user-1',
    };

    productRepository.findOne.mockResolvedValue(product);
    productRepository.save.mockImplementation((savedProduct) => Promise.resolve(savedProduct));

    await service.updateStock('p1', 'shop-1', -12, 'sale', 'user-1');

    expect(productRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        stockQuantity: 88,
      }),
    );

    expect(activityService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'stock_adjustment',
        metadata: expect.objectContaining({
          reason: 'sale',
          delta: -12,
          before: 100,
          after: 88,
        }),
      }),
    );
  });
});
