import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Payment from '../models/Payment';
import Category from '../models/Category';
import { sendSuccess, sendError } from '../utils/apiResponse';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);

/** Statuses that count as revenue-generating (confirmed sale). */
const REVENUE_STATUSES = ['Delivered', 'Shipped', 'Out for Delivery', 'Packed', 'Preparing', 'Confirmed'];
/** Payment statuses that count as paid. */
const PAID_PAYMENT_STATUSES = ['Verified', 'Paid'];

const parseDateRange = (query: any) => {
  const now = new Date();
  const from = query.from ? new Date(query.from) : undefined;
  const to = query.to ? new Date(query.to) : undefined;
  return { from, to, now };
};

// ─── 1. DASHBOARD SUMMARY ─────────────────────────────────────────────────────

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const lastMonthEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    // ── Revenue aggregations ──────────────────────────────────────────────────
    const [revenueAgg] = await Order.aggregate([
      {
        $facet: {
          lifetime: [
            { $match: { orderStatus: { $in: REVENUE_STATUSES } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ],
          today: [
            {
              $match: {
                orderStatus: { $in: REVENUE_STATUSES },
                createdAt: { $gte: todayStart, $lte: todayEnd },
              },
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ],
          thisMonth: [
            {
              $match: {
                orderStatus: { $in: REVENUE_STATUSES },
                createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
              },
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ],
          lastMonth: [
            {
              $match: {
                orderStatus: { $in: REVENUE_STATUSES },
                createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
              },
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ],
          thisWeek: [
            {
              $match: {
                orderStatus: { $in: REVENUE_STATUSES },
                createdAt: { $gte: weekStart },
              },
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ],
        },
      },
    ]);

    const lifetimeRevenue = revenueAgg?.lifetime?.[0]?.total ?? 0;
    const todayRevenue = revenueAgg?.today?.[0]?.total ?? 0;
    const thisMonthRevenue = revenueAgg?.thisMonth?.[0]?.total ?? 0;
    const lastMonthRevenue = revenueAgg?.lastMonth?.[0]?.total ?? 0;
    const thisWeekRevenue = revenueAgg?.thisWeek?.[0]?.total ?? 0;

    const monthlyGrowthPct =
      lastMonthRevenue === 0
        ? thisMonthRevenue > 0
          ? 100
          : 0
        : parseFloat((((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1));

    // ── Order counts ──────────────────────────────────────────────────────────
    const orderStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const orderByStatus: Record<string, number> = {};
    for (const s of orderStatusCounts) orderByStatus[s._id] = s.count;

    const totalOrders = await Order.countDocuments();
    const todaysOrdersCount = await Order.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const thisMonthOrders = await Order.countDocuments({
      createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
    });
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });
    const orderGrowthPct =
      lastMonthOrders === 0
        ? thisMonthOrders > 0 ? 100 : 0
        : parseFloat((((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1));

    // ── Product counts ────────────────────────────────────────────────────────
    const [productStats] = await Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$availability', 'in_stock'] }, 1, 0] },
          },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$availability', 'out_of_stock'] }, 1, 0] },
          },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$stock', 0] },
                    { $lte: ['$stock', 5] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          stockValue: { $sum: { $multiply: ['$stock', '$sellingPrice'] } },
        },
      },
    ]);

    const todayProductsAdded = await Product.countDocuments({
      isDeleted: false,
      createdAt: { $gte: todayStart },
    });

    // ── Customer counts ───────────────────────────────────────────────────────
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const todaysNewCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const thisMonthNewCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
    });
    const lastMonthNewCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });
    const customerGrowthPct =
      lastMonthNewCustomers === 0
        ? thisMonthNewCustomers > 0 ? 100 : 0
        : parseFloat(
            (((thisMonthNewCustomers - lastMonthNewCustomers) / lastMonthNewCustomers) * 100).toFixed(1)
          );

    // ── Recent orders ─────────────────────────────────────────────────────────
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // ── Best sellers (by units sold from order items) ─────────────────────────
    const bestSellers = await Order.aggregate([
      { $match: { orderStatus: { $in: REVENUE_STATUSES } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          unitsSold: 1,
          revenue: 1,
          name: '$product.name',
          images: '$product.images',
          stock: '$product.stock',
          sellingPrice: '$product.sellingPrice',
          category: '$product.category',
        },
      },
    ]);

    // ── AOV ───────────────────────────────────────────────────────────────────
    const avgOrderValue = totalOrders > 0 ? parseFloat((lifetimeRevenue / totalOrders).toFixed(2)) : 0;

    return sendSuccess(
      res,
      {
        revenue: {
          lifetime: lifetimeRevenue,
          today: todayRevenue,
          thisWeek: thisWeekRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          monthlyGrowthPct,
        },
        orders: {
          total: totalOrders,
          today: todaysOrdersCount,
          thisMonth: thisMonthOrders,
          lastMonth: lastMonthOrders,
          orderGrowthPct,
          byStatus: orderByStatus,
        },
        products: {
          total: productStats?.total ?? 0,
          active: productStats?.active ?? 0,
          outOfStock: productStats?.outOfStock ?? 0,
          lowStock: productStats?.lowStock ?? 0,
          stockValue: productStats?.stockValue ?? 0,
          addedToday: todayProductsAdded,
        },
        customers: {
          total: totalCustomers,
          today: todaysNewCustomers,
          thisMonth: thisMonthNewCustomers,
          lastMonth: lastMonthNewCustomers,
          customerGrowthPct,
        },
        avgOrderValue,
        recentOrders,
        bestSellers,
        // Legacy compat field
        metrics: {
          totalRevenue: lifetimeRevenue,
          totalOrders,
          todaysOrdersCount,
          totalProducts: productStats?.total ?? 0,
          totalCustomers,
        },
      },
      'Dashboard analytics fetched from MongoDB Atlas'
    );
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// ─── 2. MONTHLY REVENUE (current year, Jan-Dec) ───────────────────────────────

export const getMonthlyRevenue = async (req: Request, res: Response) => {
  try {
    const year = parseInt((req.query.year as string) || String(new Date().getFullYear()), 10);
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

    const rawData = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: REVENUE_STATUSES },
          createdAt: { $gte: yearStart, $lte: yearEnd },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          units: { $sum: { $sum: '$items.quantity' } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthMap: Record<number, any> = {};
    for (const row of rawData) {
      monthMap[row._id] = row;
    }

    const monthlyRevenue = MONTH_NAMES.map((name, idx) => {
      const monthNum = idx + 1;
      const row = monthMap[monthNum];
      return {
        month: name,
        revenue: row?.revenue ?? 0,
        orders: row?.orders ?? 0,
        avgOrderValue: row?.orders > 0 ? parseFloat((row.revenue / row.orders).toFixed(2)) : 0,
        unitsSold: row?.units ?? 0,
      };
    });

    return sendSuccess(res, { year, monthlyRevenue }, 'Monthly revenue fetched');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// ─── 3. REVENUE ANALYTICS ─────────────────────────────────────────────────────

export const getRevenueAnalytics = async (req: Request, res: Response) => {
  try {
    const { from, to, now } = parseDateRange(req.query);
    const matchRange = from && to ? { $gte: from, $lte: to } : undefined;

    const baseMatch: any = { orderStatus: { $in: REVENUE_STATUSES } };
    if (matchRange) baseMatch.createdAt = matchRange;

    const [daily, weekly, monthly, yearly, allTime] = await Promise.all([
      // Daily (last 30 days)
      Order.aggregate([
        {
          $match: {
            orderStatus: { $in: REVENUE_STATUSES },
            createdAt: { $gte: new Date(new Date().setDate(now.getDate() - 30)) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Weekly (last 12 weeks)
      Order.aggregate([
        {
          $match: {
            orderStatus: { $in: REVENUE_STATUSES },
            createdAt: { $gte: new Date(new Date().setDate(now.getDate() - 84)) },
          },
        },
        {
          $group: {
            _id: { $week: '$createdAt' },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Monthly (current year)
      Order.aggregate([
        {
          $match: {
            orderStatus: { $in: REVENUE_STATUSES },
            createdAt: { $gte: startOfYear(now) },
          },
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Yearly (all years)
      Order.aggregate([
        { $match: { orderStatus: { $in: REVENUE_STATUSES } } },
        {
          $group: {
            _id: { $year: '$createdAt' },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // All time totals
      Order.aggregate([
        { $match: { orderStatus: { $in: REVENUE_STATUSES } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' },
          },
        },
      ]),
    ]);

    return sendSuccess(
      res,
      {
        daily,
        weekly,
        monthly,
        yearly,
        summary: allTime[0] ?? { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
      },
      'Revenue analytics fetched'
    );
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// ─── 4. ORDER ANALYTICS ───────────────────────────────────────────────────────

export const getOrderAnalytics = async (req: Request, res: Response) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const dateMatch: any = {};
    if (from && to) dateMatch.createdAt = { $gte: from, $lte: to };

    const statusCounts = await Order.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments(dateMatch);
    const byStatus: Record<string, { count: number; revenue: number }> = {};
    for (const s of statusCounts) {
      byStatus[s._id] = { count: s.count, revenue: s.revenue };
    }

    const deliveredCount = byStatus['Delivered']?.count ?? 0;
    const cancelledCount = byStatus['Cancelled']?.count ?? 0;
    const successRate = totalOrders > 0 ? parseFloat(((deliveredCount / totalOrders) * 100).toFixed(1)) : 0;
    const cancellationRate = totalOrders > 0 ? parseFloat(((cancelledCount / totalOrders) * 100).toFixed(1)) : 0;

    // Payment method breakdown
    const paymentMethodCounts = await Order.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    return sendSuccess(
      res,
      {
        total: totalOrders,
        byStatus,
        successRate,
        cancellationRate,
        paymentMethodBreakdown: paymentMethodCounts,
      },
      'Order analytics fetched'
    );
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// ─── 5. CUSTOMER ANALYTICS ────────────────────────────────────────────────────

export const getCustomerAnalytics = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const [totals, topSpenders, dailyReg] = await Promise.all([
      User.aggregate([
        { $match: { role: 'customer' } },
        {
          $facet: {
            total: [{ $count: 'n' }],
            today: [
              { $match: { createdAt: { $gte: startOfDay(now) } } },
              { $count: 'n' },
            ],
            thisWeek: [
              { $match: { createdAt: { $gte: new Date(new Date().setDate(now.getDate() - 7)) } } },
              { $count: 'n' },
            ],
            thisMonth: [
              { $match: { createdAt: { $gte: startOfMonth(now) } } },
              { $count: 'n' },
            ],
            avgSpent: [{ $group: { _id: null, avg: { $avg: '$totalSpent' } } }],
          },
        },
      ]),

      // Top spenders
      User.find({ role: 'customer' })
        .sort({ totalSpent: -1 })
        .limit(5)
        .select('name email photo totalSpent loginCount createdAt')
        .lean(),

      // Daily registrations last 30 days
      User.aggregate([
        {
          $match: {
            role: 'customer',
            createdAt: { $gte: new Date(new Date().setDate(now.getDate() - 30)) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const t = totals[0] ?? {};

    return sendSuccess(
      res,
      {
        total: t.total?.[0]?.n ?? 0,
        today: t.today?.[0]?.n ?? 0,
        thisWeek: t.thisWeek?.[0]?.n ?? 0,
        thisMonth: t.thisMonth?.[0]?.n ?? 0,
        avgSpent: parseFloat((t.avgSpent?.[0]?.avg ?? 0).toFixed(2)),
        topSpenders,
        dailyRegistrations: dailyReg,
      },
      'Customer analytics fetched'
    );
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// ─── 6. PRODUCT ANALYTICS ────────────────────────────────────────────────────

export const getProductAnalytics = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const [stats] = await Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$availability', 'in_stock'] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$availability', 'out_of_stock'] }, 1, 0] } },
          discontinued: { $sum: { $cond: [{ $eq: ['$availability', 'discontinued'] }, 1, 0] } },
          lowStock: {
            $sum: {
              $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 5] }] }, 1, 0],
            },
          },
          featured: { $sum: { $cond: ['$featured', 1, 0] } },
          trending: { $sum: { $cond: ['$trending', 1, 0] } },
          stockValue: { $sum: { $multiply: ['$stock', '$sellingPrice'] } },
          mrpValue: { $sum: { $multiply: ['$stock', '$mrp'] } },
        },
      },
    ]);

    const addedToday = await Product.countDocuments({
      isDeleted: false,
      createdAt: { $gte: startOfDay(now) },
    });

    const recentlyAdded = await Product.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name sellingPrice stock availability images createdAt')
      .lean();

    const lowStockItems = await Product.find({
      isDeleted: false,
      stock: { $gt: 0, $lte: 5 },
    })
      .sort({ stock: 1 })
      .limit(10)
      .select('name stock sellingPrice images')
      .lean();

    return sendSuccess(
      res,
      {
        ...(stats ?? {
          total: 0, active: 0, outOfStock: 0, discontinued: 0,
          lowStock: 0, featured: 0, trending: 0, stockValue: 0, mrpValue: 0,
        }),
        addedToday,
        recentlyAdded,
        lowStockItems,
      },
      'Product analytics fetched'
    );
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// ─── 7. CATEGORY ANALYTICS ───────────────────────────────────────────────────

export const getCategoryAnalytics = async (req: Request, res: Response) => {
  try {
    // Products per category
    const productsByCategory = await Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          stockValue: { $sum: { $multiply: ['$stock', '$sellingPrice'] } },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'cat',
        },
      },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          categoryId: '$_id',
          name: '$cat.name',
          slug: '$cat.slug',
          productCount: 1,
          stockValue: 1,
        },
      },
    ]);

    // Revenue per category (from orders)
    const revenueByCategory = await Order.aggregate([
      { $match: { orderStatus: { $in: REVENUE_STATUSES } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'prod',
        },
      },
      { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$prod.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $sum: 1 },
          unitsSold: { $sum: '$items.quantity' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'cat',
        },
      },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          categoryId: '$_id',
          name: '$cat.name',
          revenue: 1,
          orders: 1,
          unitsSold: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return sendSuccess(
      res,
      { productsByCategory, revenueByCategory },
      'Category analytics fetched'
    );
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// ─── 8. INVENTORY ANALYTICS ──────────────────────────────────────────────────

export const getInventoryAnalytics = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const [summary] = await Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: [{ $eq: ['$availability', 'in_stock'] }, 1, 0] } },
          inactiveProducts: { $sum: { $cond: [{ $ne: ['$availability', 'in_stock'] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$availability', 'out_of_stock'] }, 1, 0] } },
          lowStock: {
            $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 5] }] }, 1, 0] },
          },
          inventoryWorth: { $sum: { $multiply: ['$stock', '$sellingPrice'] } },
          totalUnits: { $sum: '$stock' },
        },
      },
    ]);

    const addedToday = await Product.countDocuments({
      isDeleted: false,
      createdAt: { $gte: startOfDay(now) },
    });

    return sendSuccess(
      res,
      {
        ...(summary ?? {
          totalProducts: 0, activeProducts: 0, inactiveProducts: 0,
          outOfStock: 0, lowStock: 0, inventoryWorth: 0, totalUnits: 0,
        }),
        addedToday,
      },
      'Inventory analytics fetched'
    );
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// ─── 9. PAYMENT ANALYTICS ────────────────────────────────────────────────────

export const getPaymentAnalytics = async (req: Request, res: Response) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const dateMatch: any = {};
    if (from && to) dateMatch.createdAt = { $gte: from, $lte: to };

    const [statusAgg, methodAgg] = await Promise.all([
      Payment.aggregate([
        { $match: dateMatch },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            amount: { $sum: '$amount' },
          },
        },
      ]),

      Payment.aggregate([
        { $match: dateMatch },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            amount: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const byStatus: Record<string, { count: number; amount: number }> = {};
    for (const s of statusAgg) byStatus[s._id] = { count: s.count, amount: s.amount };

    const byMethod: Record<string, { count: number; amount: number }> = {};
    for (const m of methodAgg) byMethod[m._id] = { count: m.count, amount: m.amount };

    const totalCollected =
      (byStatus['Approved']?.amount ?? 0) + (byStatus['Paid']?.amount ?? 0);

    return sendSuccess(
      res,
      {
        byStatus,
        byMethod,
        totalCollected,
        pending: byStatus['Pending']?.count ?? 0,
        approved: byStatus['Approved']?.count ?? 0,
        rejected: byStatus['Rejected']?.count ?? 0,
      },
      'Payment analytics fetched'
    );
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// ─── Legacy compat alias ──────────────────────────────────────────────────────
export const getAdminAnalytics = getDashboardSummary;
