import Product, { IProduct } from '../models/Product';

export class RecommendationEngine {
  /**
   * Fetches real products stored in MongoDB Atlas for recommendations.
   * Does NOT generate AI recommendations or mock items.
   * Returns [] if no products exist in the database.
   */
  static async getPersonalizedRecommendations(_userId?: string, limit: number = 8): Promise<IProduct[]> {
    try {
      const products = await Product.find({})
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(limit);

      return products;
    } catch (err) {
      console.error('[Database Query Error]', err);
      return [];
    }
  }

  /**
   * Returns related items in the same category from MongoDB Atlas.
   * Returns [] if no matching products exist in the database.
   */
  static async getRelatedProducts(productId: string, limit: number = 4): Promise<IProduct[]> {
    try {
      const currentProduct = await Product.findById(productId);
      if (!currentProduct) return [];

      return await Product.find({
        _id: { $ne: productId },
        category: currentProduct.category,
      })
        .populate('category', 'name slug')
        .limit(limit);
    } catch (err) {
      console.error('[Related Products Error]', err);
      return [];
    }
  }
}
