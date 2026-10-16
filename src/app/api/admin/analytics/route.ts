import { NextResponse } from 'next/server';
import { queryAll, queryFirst } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Revenue calculations: exclude cancelled orders
    // Online completed/confirmed/processing/ready/shipped/pending revenue
    const onlineStats = await queryFirst(`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(CASE WHEN order_status != 'Cancelled' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN order_status != 'Cancelled' AND date(created_at) = date('now') THEN total_amount ELSE 0 END), 0) as today_revenue,
        COALESCE(SUM(CASE WHEN order_status != 'Cancelled' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') THEN total_amount ELSE 0 END), 0) as month_revenue,
        COALESCE(SUM(CASE WHEN order_status = 'Pending' THEN 1 ELSE 0 END), 0) as pending_count,
        COALESCE(SUM(CASE WHEN order_status = 'Completed' THEN 1 ELSE 0 END), 0) as completed_count,
        COALESCE(SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END), 0) as cancelled_count,
        COALESCE(SUM(CASE WHEN order_status = 'Cancellation Requested' THEN 1 ELSE 0 END), 0) as cancel_requested_count
      FROM orders
    `);

    // Offline sales stats
    const offlineStats = await queryFirst(`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(CASE WHEN status != 'refunded' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status != 'refunded' AND date(created_at) = date('now') THEN total_amount ELSE 0 END), 0) as today_revenue,
        COALESCE(SUM(CASE WHEN status != 'refunded' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') THEN total_amount ELSE 0 END), 0) as month_revenue
      FROM sales
    `);

    const onlineRev = onlineStats?.total_revenue || 0;
    const offlineRev = offlineStats?.total_revenue || 0;
    const totalRevenue = onlineRev + offlineRev;

    const todayRev = (onlineStats?.today_revenue || 0) + (offlineStats?.today_revenue || 0);
    const monthRev = (onlineStats?.month_revenue || 0) + (offlineStats?.month_revenue || 0);

    const validOrderCount = (onlineStats?.total_count || 0) + (offlineStats?.total_count || 0);
    const averageOrderValue = validOrderCount > 0 ? Math.round(totalRevenue / validOrderCount) : 0;

    // Top selling products from order_items and sale_items
    const topProducts = await queryAll(`
      SELECT 
        p.id, p.name, p.sku, p.price, p.stock,
        COALESCE(SUM(oi.quantity), 0) as units_sold,
        COALESCE(SUM(oi.total_price), 0) as total_sales
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY units_sold DESC
      LIMIT 5
    `);

    // Low stock products alert
    const lowStockProducts = await queryAll(`
      SELECT id, name, sku, stock, low_stock_threshold, price
      FROM products
      WHERE stock <= low_stock_threshold AND is_active = 1
      ORDER BY stock ASC
      LIMIT 10
    `);

    // Recent 10 online orders
    const recentOrders = await queryAll(`
      SELECT id, order_number, customer_name, customer_phone, total_amount, order_status, payment_status, created_at, 'online' as channel
      FROM orders
      ORDER BY created_at DESC
      LIMIT 8
    `);

    // Recent 5 POS sales
    const recentSales = await queryAll(`
      SELECT id, invoice_number as order_number, customer_name, customer_phone, total_amount, 'Completed' as order_status, payment_status, created_at, 'offline' as channel
      FROM sales
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Combine recent transactions
    const recentTransactions = [...recentOrders, ...recentSales]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Sales by category
    const categorySales = await queryAll(`
      SELECT 
        c.name as category_name,
        COALESCE(SUM(oi.total_price), 0) as revenue,
        COALESCE(SUM(oi.quantity), 0) as units
      FROM categories c
      JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY c.id
      ORDER BY revenue DESC
    `);

    return NextResponse.json({
      metrics: {
        totalRevenue,
        todayRevenue: todayRev,
        monthRevenue: monthRev,
        onlineRevenue: onlineRev,
        offlineRevenue: offlineRev,
        totalOrders: onlineStats?.total_count || 0,
        pendingOrders: onlineStats?.pending_count || 0,
        completedOrders: onlineStats?.completed_count || 0,
        cancelledOrders: onlineStats?.cancelled_count || 0,
        cancelRequestedOrders: onlineStats?.cancel_requested_count || 0,
        totalCounterSales: offlineStats?.total_count || 0,
        averageOrderValue,
      },
      topProducts,
      lowStockProducts,
      recentTransactions,
      categorySales,
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load analytics' }, { status: 500 });
  }
}
