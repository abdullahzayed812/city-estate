import { Router, Request, Response } from 'express';
import { DatabaseConnection } from '@realestate/database';
import { authenticate } from '@realestate/middlewares';

const router = Router();
const db = () => DatabaseConnection.getInstance();

router.get('/stats', authenticate, async (req: Request, res: Response) => {
  const userId = req.user?.sub;

  const { rows: brokerRows } = await db().query(
    'SELECT id, rating, total_deals AS totalDeals, total_properties AS totalProperties, license_number AS licenseNumber, bio, specializations, service_areas AS serviceAreas, national_id AS nationalId FROM brokers WHERE user_id = ? AND deleted_at IS NULL LIMIT 1',
    [userId],
  );

  if (!brokerRows.length) {
    res.status(404).json({ success: false, message: 'Broker profile not found' });
    return;
  }

  const broker = brokerRows[0] as any;

  const { rows: propRows } = await db().query(
    `SELECT
       COUNT(*) AS totalProperties,
       SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS activeProperties,
       COALESCE(SUM(views_count), 0) AS totalViews
     FROM properties WHERE broker_id = ? AND deleted_at IS NULL`,
    [broker.id],
  );

  const { rows: bookingRows } = await db().query(
    `SELECT
       COUNT(*) AS totalBookings,
       SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pendingBookings,
       SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedBookings
     FROM bookings WHERE broker_id = ?`,
    [userId],
  );

  const p = propRows[0] as any;
  const b = bookingRows[0] as any;

  // calculate profile completion (6 fields)
  const fields = [broker.licenseNumber, broker.bio, broker.nationalId,
    broker.specializations?.length, broker.serviceAreas?.length, broker.rating > 0];
  const profileCompletion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  res.json({
    success: true,
    data: {
      totalProperties: parseInt(p.totalProperties) || 0,
      activeProperties: parseInt(p.activeProperties) || 0,
      totalViews: parseInt(p.totalViews) || 0,
      totalBookings: parseInt(b.totalBookings) || 0,
      pendingBookings: parseInt(b.pendingBookings) || 0,
      totalDeals: parseInt(broker.totalDeals) || 0,
      rating: parseFloat(broker.rating) || 0,
      profileCompletion,
    },
  });
});

router.get('/', async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
  const search = req.query.search as string | undefined;
  const isVerified = req.query.isVerified as string | undefined;

  let sql = `
    SELECT b.id, b.user_id AS userId, b.license_number AS licenseNumber,
           b.rating, b.total_ratings AS totalRatings,
           b.total_properties AS totalProperties, b.total_deals AS totalDeals,
           b.is_verified AS isVerified, b.is_featured AS isFeatured,
           b.specializations, b.service_areas AS serviceAreas,
           b.created_at AS createdAt,
           u.first_name AS firstName, u.last_name AS lastName,
           u.phone, u.email, u.avatar_url AS avatarUrl
    FROM brokers b
    JOIN users u ON u.id = b.user_id
    WHERE b.deleted_at IS NULL
  `;
  const params: unknown[] = [];

  if (search) {
    sql += ' AND (u.first_name LIKE ? OR u.last_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (isVerified !== undefined) {
    sql += ' AND b.is_verified = ?';
    params.push(isVerified === 'true' ? 1 : 0);
  }
  sql += ' LIMIT ?';
  params.push(limit);

  const { rows } = await db().query(sql, params);

  const brokers = (rows as any[]).map((row) => ({
    id: row.id,
    userId: row.userId,
    licenseNumber: row.licenseNumber,
    rating: parseFloat(row.rating) || 0,
    totalRatings: parseInt(row.totalRatings) || 0,
    totalProperties: parseInt(row.totalProperties) || 0,
    totalDeals: parseInt(row.totalDeals) || 0,
    isVerified: Boolean(row.isVerified),
    isFeatured: Boolean(row.isFeatured),
    specializations: Array.isArray(row.specializations) ? row.specializations : [],
    serviceAreas: Array.isArray(row.serviceAreas) ? row.serviceAreas : [],
    createdAt: row.createdAt,
    user: {
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
      email: row.email,
      avatarUrl: row.avatarUrl,
    },
  }));

  res.json({ success: true, data: { data: brokers, meta: { total: brokers.length } } });
});

router.patch('/:id/verify', async (req: Request, res: Response) => {
  await db().executeModify(
    'UPDATE brokers SET is_verified = ? WHERE id = ?',
    [req.body.isVerified ? 1 : 0, req.params.id],
  );
  res.json({ success: true });
});

router.patch('/:id/feature', async (req: Request, res: Response) => {
  await db().executeModify(
    'UPDATE brokers SET is_featured = ? WHERE id = ?',
    [req.body.isFeatured ? 1 : 0, req.params.id],
  );
  res.json({ success: true });
});

export { router as brokerRoutes };
