import { Request } from 'express';
import rateLimit from 'express-rate-limit';

// Simple API rate limiter (adjust windowMs/max to taste)
export const apiLimiter = rateLimit({
	// 1 minute window
	windowMs: 60 * 1000,
	// limit each IP to 60 requests per windowMs
	max: 60,
	standardHeaders: true,
	legacyHeaders: false,
});

// Ensures page and limit are numeric, valid and clamped to safe bounds.
// Returns normalized { page, limit } to be used by handlers.
export function clampPageLimit(req: Request): { page: number; limit: number } {
	const rawPage = Number.parseInt(String(req.query.page ?? '1'), 10);
	const rawLimit = Number.parseInt(String(req.query.limit ?? '50'), 10);

	const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
	// allow client to request up to 200 items per page, minimum 1
	const limit = Number.isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), 200);

	return { page, limit };
}
