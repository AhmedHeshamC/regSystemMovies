const adminService = require('../services/admin.service'); // Adjust path as needed

class AdminController {
    /**
     * GET /admin/reservations?showtimeId={id}
     * Gets all reservations for a specific showtime.
     */
    async getReservationsByShowtime(req, res, next) {
        try {
            const showtimeId = parseInt(req.query.showtimeId, 10);
            if (isNaN(showtimeId)) {
                return res.status(400).json({ error: { status: 400, message: 'Invalid or missing showtimeId query parameter' } });
            }

            const reservations = await adminService.getReservationsByShowtime(showtimeId);
            res.status(200).json(reservations);
        } catch (error) {
            // Pass errors to the centralized error handler
            next(error);
        }
    }

    /**
     * GET /admin/reports/capacity?date=YYYY-MM-DD
     * Gets seat capacity and occupancy report for a given date.
     */
    async getCapacityReport(req, res, next) {
        try {
            const date = req.query.date;
            // Basic validation for date format (YYYY-MM-DD)
            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return res.status(400).json({ error: { status: 400, message: 'Invalid or missing date query parameter (YYYY-MM-DD)' } });
            }

            const report = await adminService.getCapacityReport(date);
            res.status(200).json(report);
        } catch (error) {
            // Pass errors to the centralized error handler
            next(error);
        }
    }
}

module.exports = new AdminController();
