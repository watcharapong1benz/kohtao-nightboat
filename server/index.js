const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.SECRET_KEY || 'supersecretkey';

app.use(cors());
app.use(express.json());
// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '12h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/register', async (req, res) => {
    // Initial seeding or admin creation
    const { username, password, name, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, password: hashedPassword, name, role: role || 'STAFF' },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- TICKET ROUTES ---

app.get('/api/tickets', authenticateToken, async (req, res) => {
    const { date } = req.query; // date string YYYY-MM-DD
    try {
        const where = {};
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            where.travelDate = {
                gte: start,
                lte: end
            };
        }
        const tickets = await prisma.ticket.findMany({
            where,
            include: { seller: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tickets', authenticateToken, async (req, res) => {
    const { passengerName, phone, route, seatNumber, seatLayout, price, travelDate } = req.body;

    try {
        // Check if seat is taken
        const existingTicket = await prisma.ticket.findFirst({
            where: {
                travelDate: new Date(travelDate),
                route,
                seatNumber,
                seatLayout
            }
        });

        if (existingTicket) {
            return res.status(400).json({ message: 'Seat already taken' });
        }

        const ticket = await prisma.ticket.create({
            data: {
                passengerName,
                phone,
                route,
                seatNumber,
                seatLayout,
                price,
                travelDate: new Date(travelDate),
                sellerId: req.user.id,
            },
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tickets/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        if (data.travelDate) data.travelDate = new Date(data.travelDate);
        const ticket = await prisma.ticket.update({
            where: { id: parseInt(id) },
            data,
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tickets/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.ticket.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Ticket deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- PARCEL ROUTES ---

app.get('/api/parcels', authenticateToken, async (req, res) => {
    const { date } = req.query;
    try {
        const where = {};
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            where.depositDate = {
                gte: start,
                lte: end
            };
        }
        const parcels = await prisma.parcel.findMany({
            where,
            include: { seller: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(parcels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/parcels', authenticateToken, async (req, res) => {
    const { senderName, senderPhone, receiverName, receiverPhone, weight, price, depositDate, paymentStatus } = req.body;
    try {
        const parcel = await prisma.parcel.create({
            data: {
                senderName,
                senderPhone,
                receiverName,
                receiverPhone,
                weight: parseFloat(weight),
                price: parseFloat(price),
                depositDate: new Date(depositDate),
                paymentStatus,
                sellerId: req.user.id,
            },
        });
        res.json(parcel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/parcels/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        if (data.depositDate) data.depositDate = new Date(data.depositDate);
        if (data.weight) data.weight = parseFloat(data.weight);
        if (data.price) data.price = parseFloat(data.price);

        const parcel = await prisma.parcel.update({
            where: { id: parseInt(id) },
            data,
        });
        res.json(parcel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/parcels/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.parcel.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Parcel deleted' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Parcel not found' });
        }
        res.status(500).json({ error: error.message });
    }
});

// --- DASHBOARD ROUTES ---

app.get('/api/dashboard', authenticateToken, async (req, res) => {
    // Totals for TODAY
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
        const ticketsSoldToday = await prisma.ticket.count({
            where: { createdAt: { gte: today, lt: tomorrow } } // Or travelDate? Usually "sales of the day" means sold today.
        });

        const parcelsdepositedToday = await prisma.parcel.count({
            where: { depositDate: { gte: today, lt: tomorrow } }
        });

        // Revenue
        const ticketRevenue = await prisma.ticket.aggregate({
            _sum: { price: true },
            where: { createdAt: { gte: today, lt: tomorrow } }
        });

        const parcelRevenue = await prisma.parcel.aggregate({
            _sum: { price: true },
            where: { depositDate: { gte: today, lt: tomorrow } }
        });

        const totalRevenue = (ticketRevenue._sum.price || 0) + (parcelRevenue._sum.price || 0);

        const parcelsWaiting = await prisma.parcel.count({
            where: { status: 'WAITING' }
        });

        // Latest transactions
        const recentTickets = await prisma.ticket.findMany({
            where: { createdAt: { gte: today, lt: tomorrow } },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { seller: { select: { name: true } } }
        });

        const recentParcels = await prisma.parcel.findMany({
            where: { depositDate: { gte: today, lt: tomorrow } },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { seller: { select: { name: true } } }
        });

        res.json({
            ticketsSoldToday,
            parcelsdepositedToday,
            totalRevenue,
            parcelsWaiting,
            recentTickets,
            recentParcels
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Catch-all route to serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
