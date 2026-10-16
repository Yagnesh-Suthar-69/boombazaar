import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryAll, queryFirst, execute } from '@/lib/db';
import { generateOrderNumber, generateAccessToken, buildWhatsAppOrderUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const CreateOrderSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  customerPhone: z.string().min(10, 'Valid 10-digit mobile number required').max(15),
  deliveryType: z.enum(['delivery', 'pickup']),
  address: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  ageConfirmed: z.boolean().refine(val => val === true, 'You must confirm you are at least 18 years old'),
  safetyAcknowledged: z.boolean().refine(val => val === true, 'Fireworks safety declaration must be accepted'),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive('Quantity must be greater than zero'),
      itemType: z.enum(['product', 'hamper']).optional(),
    })
  ).min(1, 'Cart cannot be empty'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = CreateOrderSchema.parse(body);

    if (validatedData.deliveryType === 'delivery' && (!validatedData.address || validatedData.address.trim().length < 10)) {
      return NextResponse.json(
        { error: 'A complete delivery address (at least 10 characters) is required for home delivery.' },
        { status: 400 }
      );
    }

    // Step 2 & 3: Re-fetch products and hampers directly from D1 / SQLite database
    const validatedLineItems: Array<{
      productId: string;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
      itemType: 'product' | 'hamper';
    }> = [];

    let calculatedSubtotal = 0;

    for (const item of validatedData.items) {
      if (item.itemType === 'hamper') {
        const hamper = await queryFirst(
          'SELECT id, name, slug, price, sale_price, is_active FROM hampers WHERE id = ?',
          [item.productId]
        );

        if (!hamper) {
          return NextResponse.json({ error: `Hamper ID "${item.productId}" is not available.` }, { status: 400 });
        }
        if (!hamper.is_active) {
          return NextResponse.json({ error: `Hamper "${hamper.name}" is currently inactive.` }, { status: 400 });
        }

        const effectiveUnitPrice = hamper.sale_price && hamper.sale_price > 0 ? hamper.sale_price : hamper.price;
        const lineTotal = effectiveUnitPrice * item.quantity;
        calculatedSubtotal += lineTotal;

        validatedLineItems.push({
          productId: hamper.id,
          productName: hamper.name,
          sku: `HMP-${hamper.slug.substring(0, 10).toUpperCase()}`,
          unitPrice: effectiveUnitPrice,
          quantity: item.quantity,
          totalPrice: lineTotal,
          itemType: 'hamper',
        });
      } else {
        const product = await queryFirst(
          'SELECT id, name, sku, price, sale_price, stock, is_active FROM products WHERE id = ?',
          [item.productId]
        );

        // If not found in products, check if it's a hamper
        if (!product) {
          const hamper = await queryFirst(
            'SELECT id, name, slug, price, sale_price, is_active FROM hampers WHERE id = ?',
            [item.productId]
          );
          if (hamper) {
            const effectiveUnitPrice = hamper.sale_price && hamper.sale_price > 0 ? hamper.sale_price : hamper.price;
            const lineTotal = effectiveUnitPrice * item.quantity;
            calculatedSubtotal += lineTotal;
            validatedLineItems.push({
              productId: hamper.id,
              productName: hamper.name,
              sku: `HMP-${hamper.slug.substring(0, 10).toUpperCase()}`,
              unitPrice: effectiveUnitPrice,
              quantity: item.quantity,
              totalPrice: lineTotal,
              itemType: 'hamper',
            });
            continue;
          }

          return NextResponse.json(
            { error: `Item ID "${item.productId}" is not available.` },
            { status: 400 }
          );
        }

        if (!product.is_active) {
          return NextResponse.json(
            { error: `Product "${product.name}" is currently inactive and cannot be purchased.` },
            { status: 400 }
          );
        }

        if (product.stock < item.quantity) {
          return NextResponse.json(
            {
              error: `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available: ${product.stock}. Please adjust your cart.`,
            },
            { status: 400 }
          );
        }

        const effectiveUnitPrice = product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;
        const lineTotal = effectiveUnitPrice * item.quantity;
        calculatedSubtotal += lineTotal;

        validatedLineItems.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: effectiveUnitPrice,
          quantity: item.quantity,
          totalPrice: lineTotal,
          itemType: 'product',
        });
      }
    }

    // Step 4: Calculate final delivery fee and grand total on the server using store settings in rupees
    const deliverySetting = await queryFirst('SELECT value FROM settings WHERE key = ?', ['delivery_fee_rupees'])
      || await queryFirst('SELECT value FROM settings WHERE key = ?', ['delivery_fee']);
    const thresholdSetting = await queryFirst('SELECT value FROM settings WHERE key = ?', ['free_delivery_threshold_rupees'])
      || await queryFirst('SELECT value FROM settings WHERE key = ?', ['free_delivery_threshold']);

    let standardDeliveryFee = 15000; // default ₹150
    if (deliverySetting?.value) {
      const val = Number(deliverySetting.value);
      standardDeliveryFee = val > 1000 ? val : val * 100;
    }

    let freeDeliveryThreshold = 250000; // default ₹2,500
    if (thresholdSetting?.value) {
      const val = Number(thresholdSetting.value);
      freeDeliveryThreshold = val > 10000 ? val : val * 100;
    }

    const deliveryFee = validatedData.deliveryType === 'delivery'
      ? (calculatedSubtotal >= freeDeliveryThreshold ? 0 : standardDeliveryFee)
      : 0;

    const grandTotal = calculatedSubtotal + deliveryFee;

    // Step 5: Generate unique order number and access token
    const orderNumber = generateOrderNumber();
    const accessToken = generateAccessToken();
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Upsert or link customer record
    let customerId: string | null = null;
    const existingCustomer = await queryFirst('SELECT id, total_orders, lifetime_spend FROM customers WHERE phone = ?', [
      validatedData.customerPhone,
    ]);

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await execute(
        'UPDATE customers SET name = ?, total_orders = total_orders + 1, lifetime_spend = lifetime_spend + ? WHERE id = ?',
        [validatedData.customerName, grandTotal, customerId]
      );
    } else {
      customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await execute(
        'INSERT INTO customers (id, name, phone, address, total_orders, lifetime_spend) VALUES (?, ?, ?, ?, 1, ?)',
        [customerId, validatedData.customerName, validatedData.customerPhone, validatedData.address || '', grandTotal]
      );
    }

    // Step 6: Save order to database
    await execute(
      `INSERT INTO orders (
        id, order_number, customer_id, customer_name, customer_phone, delivery_type, 
        address, notes, subtotal, tax_amount, delivery_fee, discount_amount, 
        total_amount, payment_status, payment_method, order_status, sales_channel, access_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, 'pending', 'cash_on_delivery', 'Pending', 'online', ?)`,
      [
        orderId,
        orderNumber,
        customerId,
        validatedData.customerName,
        validatedData.customerPhone,
        validatedData.deliveryType,
        validatedData.address || null,
        validatedData.notes || null,
        calculatedSubtotal,
        deliveryFee,
        grandTotal,
        accessToken,
      ]
    );

    // Save order line items and deduct inventory atomically
    for (const lineItem of validatedLineItems) {
      const orderItemId = `oi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      await execute(
        `INSERT INTO order_items (id, order_id, product_id, product_name, sku, unit_price, quantity, total_price, item_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderItemId,
          orderId,
          lineItem.productId,
          lineItem.productName,
          lineItem.sku,
          lineItem.unitPrice,
          lineItem.quantity,
          lineItem.totalPrice,
          lineItem.itemType || 'product',
        ]
      );

      if (lineItem.itemType === 'hamper') {
        // Atomic stock deduction for products inside the hamper
        const hamperProducts = await queryAll(
          'SELECT product_id, quantity FROM hamper_items WHERE hamper_id = ?',
          [lineItem.productId]
        );
        for (const hp of hamperProducts) {
          const deductTotal = hp.quantity * lineItem.quantity;
          await execute('UPDATE products SET stock = MAX(0, stock - ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
            deductTotal,
            hp.product_id,
          ]);
          await execute(
            `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, reason, reference_id)
             VALUES (?, ?, 'sale', ?, 'Online Hamper Order Placement', ?)`,
            [`im_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, hp.product_id, -deductTotal, orderId]
          );
        }
      } else {
        // Decrement product inventory
        await execute('UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
          lineItem.quantity,
          lineItem.productId,
        ]);

        // Record inventory movement
        await execute(
          `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, reason, reference_id)
           VALUES (?, ?, 'sale', ?, 'Online Order Placement', ?)`,
          [`im_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, lineItem.productId, -lineItem.quantity, orderId]
        );
      }
    }

    // Record initial status history
    await execute(
      `INSERT INTO order_status_history (id, order_id, previous_status, new_status, comment, changed_by)
       VALUES (?, ?, NULL, 'Pending', 'Order placed successfully by customer via online storefront', 'Customer')`,
      [`osh_${Date.now()}`, orderId]
    );

    // Fetch store WhatsApp number from settings
    const settingsWhatsapp = await queryFirst('SELECT value FROM settings WHERE key = ?', ['whatsapp_phone']);
    const whatsappPhone = settingsWhatsapp?.value || '8128627017';

    // Construct WhatsApp message prefilled URL
    const whatsappUrl = buildWhatsAppOrderUrl({
      orderNumber,
      customerName: validatedData.customerName,
      customerPhone: validatedData.customerPhone,
      deliveryType: validatedData.deliveryType,
      address: validatedData.address,
      items: validatedLineItems,
      subtotal: calculatedSubtotal,
      deliveryFee,
      totalAmount: grandTotal,
      orderStatus: 'Pending',
      whatsappPhone,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNumber,
        accessToken,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        deliveryType: validatedData.deliveryType,
        address: validatedData.address,
        subtotal: calculatedSubtotal,
        deliveryFee,
        totalAmount: grandTotal,
        orderStatus: 'Pending',
        items: validatedLineItems,
      },
      whatsappUrl,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}
